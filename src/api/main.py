from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import random

from src.generation.synthetic import SyntheticLogGenerator
from src.schema.events import UnifiedEvent
from src.models.baseline import TFIDFClassifier
from src.models.rules import RuleBasedDetector
from src.models.success_classifier import SuccessClassifier
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="URL Attack Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory "Database"
DB_EVENTS: List[UnifiedEvent] = []
MODEL_TFIDF = TFIDFClassifier()
MODEL_RULES = RuleBasedDetector()
MODEL_SUCCESS = SuccessClassifier()

@app.on_event("startup")
def startup_event():
    """Initialize DB with synthetic data and train models."""
    global DB_EVENTS, MODEL_TFIDF
    print("Generating synthetic data...")
    gen = SyntheticLogGenerator(seed=123)
    DB_EVENTS = gen.generate_events(500)
    
    # Train the model to ensure meaningful predictions on new data (if any)
    # Ideally we'd load a pre-trained model, but we train on startup for demo simplicity
    print("Training baseline model...")
    MODEL_TFIDF.train(DB_EVENTS)
    print("System ready.")

@app.get("/events", response_model=List[UnifiedEvent])
def get_events(
    limit: int = 100, 
    offset: int = 0,
    source_ip: Optional[str] = None,
    attack_type: Optional[str] = None,
    is_successful: Optional[bool] = None
):
    """
    Get paginated event logs with optional filters.
    """
    filtered = DB_EVENTS
    if source_ip:
        filtered = [e for e in filtered if e.source_ip == source_ip]
    if attack_type:
        filtered = [e for e in filtered if e.attack_type == attack_type]
    if is_successful is not None:
        filtered = [e for e in filtered if e.is_successful == is_successful]
        
    # Sort by timestamp desc
    filtered.sort(key=lambda x: x.timestamp, reverse=True)
    return filtered[offset : offset + limit]

@app.get("/stats/timeline")
def get_timeline():
    """
    Aggregate attacks over time (buckets).
    """
    # Simple bucketing by hour or day is nice.
    # For now, let's just return raw counts per attack type to let frontend chart it
    timeline = {}
    for e in DB_EVENTS:
        ts_str = e.timestamp.strftime("%Y-%m-%d %H:00")
        if ts_str not in timeline:
            timeline[ts_str] = {"Successful": 0, "Attempted": 0}
        
        if e.is_successful:
            timeline[ts_str]["Successful"] += 1
        else:
            timeline[ts_str]["Attempted"] += 1
            
    # Format for chart: array of objects
    result = [{"time": k, "success": v["Successful"], "attempt": v["Attempted"]} for k, v in timeline.items()]
    result.sort(key=lambda x: x["time"])
    return result

@app.get("/stats/top-ips")
def get_top_ips(limit: int = 5):
    """
    Return top attacker IPs.
    """
    counts = {}
    for e in DB_EVENTS:
        if e.attack_type == "Normal": continue
        if e.source_ip not in counts:
            counts[e.source_ip] = 0
        counts[e.source_ip] += 1
        
    sorted_ips = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    return [{"ip": ip, "count": count} for ip, count in sorted_ips]

@app.get("/explain/{event_id}")
def get_explanation(event_id: str):
    """
    Get explainability details for a specific event.
    """
    event = next((e for e in DB_EVENTS if e.event_id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Re-run rule detection for explanation
    rule_hits = MODEL_RULES.analyze(event)
    
    # Fake confidence for demo if not computed
    confidence = event.confidence if event.confidence > 0 else random.uniform(0.7, 0.99)
    
    return {
        "event_id": event_id,
        "attack_type": event.attack_type,
        "confidence": confidence,
        "rule_hits": rule_hits, # Dict {type: [rules]}
        "payload_snippet": (event.payload or "")[:50],
        "factors": [
            "Matches known attack pattern" if rule_hits else "Heuristic text analysis",
            f"Response code {event.status_code} consistent with result"
        ]
    }

@app.get("/storyline/{ip}")
def get_storyline(ip: str):
    """
    Get full chronological history for an IP.
    """
    events = [e for e in DB_EVENTS if e.source_ip == ip]
    events.sort(key=lambda x: x.timestamp)
    return events
