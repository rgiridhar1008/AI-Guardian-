from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def token():
    with client:
        response = client.post("/login", json={"email":"auditor@aiguardian.dev","password":"Guardian123!"})
        assert response.status_code == 200
        return response.json()["access_token"]

def test_health():
    with client:
        data = client.get("/health").json()
        assert data["status"] == "healthy"
        assert data["routing"] == "cascadeflow"

def test_dashboard_requires_auth():
    with client:
        assert client.get("/dashboard").status_code == 401

def test_login_and_dashboard():
    headers={"Authorization":f"Bearer {token()}"}
    response=client.get("/dashboard",headers=headers)
    assert response.status_code == 200
    assert response.json()["stats"]["total_audits"] >= 5

def test_analyze_creates_auditable_route():
    headers={"Authorization":f"Bearer {token()}"}
    response=client.post("/analyze",headers=headers,json={"subject_name":"Test Subject","decision_type":"loan","decision":"Review","data":{"credit_score":680,"debt_ratio":.38},"budget_usd":.05})
    assert response.status_code == 200
    body=response.json()
    assert body["reference"].startswith("AG-")
    assert body["routing"]["model"]
    assert body["memory_provider"]
