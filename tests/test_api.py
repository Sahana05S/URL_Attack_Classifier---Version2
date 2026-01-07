from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_api_health():
    # Trigger startup
    with TestClient(app) as c:
        response = c.get("/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "event_id" in data[0]

def test_stats_endpoints():
    with TestClient(app) as c:
        resp = c.get("/stats/top-ips")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

def test_explain_endpoint():
    with TestClient(app) as c:
        # Get an event ID first
        events = c.get("/events").json()
        if not events: return
        
        target_id = events[0]["event_id"]
        resp = c.get(f"/explain/{target_id}")
        assert resp.status_code == 200
        assert "confidence" in resp.json()
