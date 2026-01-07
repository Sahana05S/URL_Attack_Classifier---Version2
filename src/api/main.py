from fastapi import FastAPI, HTTPException, Query, Depends, File, UploadFile
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
from starlette.middleware.base import BaseHTTPMiddleware
import time
import io
import shutil
import os
from src.ingestion.loader import DataLoader

app = FastAPI(title="URL Attack Classifier API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        print(f"--> Incoming {request.method} {request.url.path}")
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        print(f"<-- Outgoing {request.method} {request.url.path} | Status: {response.status_code} | {process_time:.2f}ms")
        return response

app.add_middleware(RequestLoggingMiddleware)

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.api.models import User, SessionLocal, init_db
from src.api.auth_utils import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from src.schema.auth import UserCreate, User as UserSchema
from jose import JWTError, jwt

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for authentication
def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="auth/login")), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Sentinel AI API is running"}

# In-memory "Database"
DB_EVENTS: List[UnifiedEvent] = []
MODEL_TFIDF = TFIDFClassifier()
MODEL_RULES = RuleBasedDetector()
MODEL_SUCCESS = SuccessClassifier()

@app.on_event("startup")
def startup_event():
    """Initialize DB and prepare system."""
    global DB_EVENTS, MODEL_TFIDF
    print("Setting up User DB...")
    init_db()
    
    # Starting with empty events as per user request
    DB_EVENTS = []
    print("System ready (empty dataset).")

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

# --- Auth Endpoints ---

@app.post("/auth/signup", response_model=UserSchema)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": {"username": user.username, "role": user.role}}

@app.get("/auth/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/upload/logs")
async def upload_logs(file: UploadFile = File(...)):
    """
    Upload a CSV or JSON log file for analysis.
    """
    global DB_EVENTS
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in [".csv", ".json"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or JSON.")

    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"DEBUG: Processing upload for {file.filename}")
        if file_extension == ".csv":
            new_events = DataLoader.load_csv(temp_path)
        else:
            new_events = DataLoader.load_json(temp_path)

        print(f"DEBUG: Loaded {len(new_events)} events")
        if not new_events:
            raise HTTPException(status_code=400, detail="No valid events found in file.")

        # Classify events if they don't have predictions
        for i, event in enumerate(new_events):
            # Simple heuristic: if confidence is 0.0, we probably need to predict
            if event.confidence <= 0.1:
                # 1. Rules
                matches = MODEL_RULES.analyze(event)
                if matches:
                    # Pick the first matching attack type from rules
                    event.attack_type = list(matches.keys())[0]
                    # Flatten all rule descriptions
                    all_hits = []
                    for rule_list in matches.values():
                        all_hits.extend(rule_list)
                    event.rule_hits = all_hits
                    event.confidence = 1.0 # Rule hits are 100% confident for this demo
                else:
                    # 2. ML Probability if no rules hit
                    probs = MODEL_TFIDF.predict_proba([event.url])[0]
                    event.confidence = float(max(probs))
                    
                    # 3. Label based on ML (assuming class 1 is Attack if 2 classes, or highest prob)
                    if len(probs) > 1 and probs[1] > 0.5:
                         event.attack_type = "Attack"
                    else:
                         event.attack_type = "Normal"
        
        print(f"DEBUG: Classified all events")
        # Add to global store
        DB_EVENTS.extend(new_events)
        # Sort by timestamp to keep things clean
        DB_EVENTS.sort(key=lambda x: x.timestamp, reverse=True)
        print(f"DEBUG: Updated DB_EVENTS, total now: {len(DB_EVENTS)}")
        
        return {
            "status": "success",
            "message": f"Successfully uploaded {len(new_events)} events",
            "count": len(new_events)
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print("CRITICAL ERROR IN UPLOAD:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
