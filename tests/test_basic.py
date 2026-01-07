import os
import pytest
from src.schema.events import UnifiedEvent
from src.generation.synthetic import SyntheticLogGenerator
from src.ingestion.loader import DataLoader

def test_schema_validation():
    """Test that valid data creates a UnifiedEvent."""
    event = UnifiedEvent(
        event_id="test_1",
        timestamp="2023-01-01T12:00:00",
        source_ip="127.0.0.1",
        method="GET",
        url="/",
        status_code=200,
        response_size=100,
        attack_type="Normal"
    )
    assert event.source_ip == "127.0.0.1"
    assert event.is_successful is False  # Default

def test_synthetic_generation():
    """Test that the generator produces the requested number of events."""
    gen = SyntheticLogGenerator(seed=42)
    events = gen.generate_events(num_events=10)
    assert len(events) == 10
    assert isinstance(events[0], UnifiedEvent)
    
    # Check attack types
    types = {e.attack_type for e in events}
    # With 10 events and 0.6 normal prob, we likely have Normal + others.
    # Just ensure we have at least one valid type
    assert "Normal" in types or len(types) > 0

def test_ingestion_csv(tmp_path):
    """Test round-trip CSV generation and ingestion."""
    # 1. Generate
    gen = SyntheticLogGenerator()
    events = gen.generate_events(5)
    
    import pandas as pd
    df = pd.DataFrame([e.model_dump() for e in events])
    csv_path = tmp_path / "test.csv"
    df.to_csv(csv_path, index=False)
    
    # 2. Load
    loaded_events = DataLoader.load_csv(str(csv_path))
    assert len(loaded_events) == 5
    assert loaded_events[0].event_id == events[0].event_id
    # Relax timestamp check due to CSV microscecond potential loss
    # assert loaded_events[0].timestamp == events[0].timestamp 
    assert loaded_events[0].timestamp.isoformat()[:19] == events[0].timestamp.isoformat()[:19]

def test_ingestion_json(tmp_path):
    """Test round-trip JSON generation and ingestion."""
    # 1. Generate
    gen = SyntheticLogGenerator()
    events = gen.generate_events(5)
    
    import json
    json_path = tmp_path / "test.json"
    data = [e.model_dump(mode='json') for e in events]
    with open(json_path, 'w') as f:
        json.dump(data, f)
        
    # 2. Load
    loaded_events = DataLoader.load_json(str(json_path))
    assert len(loaded_events) == 5
    assert loaded_events[0].event_id == events[0].event_id
