import uuid

from sqlalchemy import text
from fastapi.testclient import TestClient

from app.db import engine
from app.main import app


def test_health_and_crud_persistence(client, payload):
    assert client.get("/health").json() == {"status": "ok", "storage": "postgresql"}
    result = client.post("/api/entries", json=payload)
    assert result.status_code == 201
    created = result.json()
    entry_id = created["id"]
    assert client.get(f"/api/entries/{entry_id}").json()["title"] == payload["title"]
    # A separate SQL connection and HTTP client prove committed DB persistence.
    with engine.connect() as connection:
        assert connection.scalar(text("SELECT count(*) FROM journal_entries WHERE id = :id"), {"id": uuid.UUID(entry_id)}) == 1
    with TestClient(app, headers=client.headers) as another:
        assert another.get(f"/api/entries/{entry_id}").json()["content"] == payload["content"]
    changed = client.patch(f"/api/entries/{entry_id}", json={"title": "Updated", "is_milestone": True, "milestone_type": "achievement"})
    assert changed.status_code == 200
    assert changed.json()["title"] == "Updated"
    assert changed.json()["updated_at"] >= created["updated_at"]
    assert len(client.get("/api/entries?milestones=true").json()) == 1
    assert client.patch(f"/api/entries/{entry_id}", json={"is_milestone": False}).json()["milestone_type"] is None
    assert client.get("/api/entries?milestones=true").json() == []
    assert client.delete(f"/api/entries/{entry_id}").status_code == 204
    assert client.get(f"/api/entries/{entry_id}").status_code == 404


def test_ordering_and_filter(client, payload):
    for day in ["2026-10-25", "2026-10-23", "2026-10-26"]:
        client.post("/api/entries", json={**payload, "entry_date": day, "is_milestone": True, "milestone_type": "reflection"})
    client.post("/api/entries", json=payload)
    gallery = client.get("/api/entries").json()
    assert len(gallery) == 4
    assert [e["entry_date"] for e in gallery] == sorted([e["entry_date"] for e in gallery], reverse=True)
    timeline = client.get("/api/entries?milestones=true").json()
    assert len(timeline) == 3
    assert [e["entry_date"] for e in timeline] == ["2026-10-23", "2026-10-25", "2026-10-26"]


def test_errors_and_patch_invariants(client, payload):
    created = client.post("/api/entries", json=payload).json()
    path = f"/api/entries/{created['id']}"
    for patch in [{"is_milestone": True}, {"milestone_type": "achievement"}, {"title": None}, {"mood": "angry"}, {"content": " "}, {"unknown": 1}]:
        assert client.patch(path, json=patch).status_code == 422
    assert client.get(path).json()["title"] == payload["title"]
    assert client.patch(path, json={"mood": None}).json()["mood"] is None
    assert client.get("/api/entries/not-a-uuid").status_code == 422
    assert client.get(f"/api/entries/{uuid.uuid4()}").status_code == 404
    invalid = client.post("/api/entries", json={**payload, "content": "", "private": "do not echo"})
    assert invalid.status_code == 422
    assert "do not echo" not in invalid.text
    assert invalid.json()["error"]["code"] == "validation_error"


def test_no_anonymous_or_wrong_token_access(client, payload):
    created = client.post("/api/entries", json=payload).json()
    for token in ["", "wrong-token", "☃"]:
        headers = {"Authorization": f"Bearer {token}"} if token.isascii() else {"Authorization": "Basic wrong"}
        with TestClient(app, headers=headers) as anonymous:
            for method, path, body in [
                ("GET", "/api/entries", None), ("POST", "/api/entries", payload),
                ("GET", f"/api/entries/{created['id']}", None),
                ("PATCH", f"/api/entries/{created['id']}", {"title": "stolen"}),
                ("DELETE", f"/api/entries/{created['id']}", None),
            ]:
                assert anonymous.request(method, path, json=body).status_code == 401
    assert client.get(f"/api/entries/{created['id']}").json()["title"] == payload["title"]


def test_database_constraints_reject_invalid_milestone(client):
    import pytest
    from sqlalchemy.exc import IntegrityError
    with pytest.raises(IntegrityError), engine.begin() as connection:
        connection.execute(text("INSERT INTO journal_entries (id,title,content,entry_date,is_milestone,created_at,updated_at) VALUES (:id,'Test','Fictional','2026-10-26',true,now(),now())"), {"id": uuid.uuid4()})


def test_migrations_do_not_reseed_a_deliberately_empty_notebook(client):
    import subprocess
    subprocess.run(["alembic", "upgrade", "head"], check=True, timeout=30)
    assert client.get("/api/entries").json() == []


def test_storage_outage_returns_safe_503(client, monkeypatch):
    from sqlalchemy.exc import SQLAlchemyError
    def unavailable(*args, **kwargs):
        raise SQLAlchemyError("sensitive connection details")
    monkeypatch.setattr(engine, "connect", unavailable)
    result = client.get("/health")
    assert result.status_code == 503
    assert result.json()["error"]["code"] == "database_unavailable"
    assert "sensitive" not in result.text
