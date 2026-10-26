import os

os.environ["API_TOKEN"] = "test-access-token-at-least-24-characters"
# Test runner sets TEST_DATABASE_URL to a dedicated test database. Never use app data.
if os.environ.get("TEST_DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.db import engine
from app.main import app


@pytest.fixture
def client():
    if not os.environ.get("TEST_DATABASE_URL"):
        pytest.fail("Integration tests require TEST_DATABASE_URL pointing to an isolated test database")
    database_name = engine.url.database or ""
    if not database_name.endswith("_test"):
        pytest.fail("Test database name must end with _test; refusing to clear non-test data")
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE journal_entries"))
    with TestClient(app, headers={"Authorization": f"Bearer {os.environ['API_TOKEN']}"}) as test_client:
        yield test_client


@pytest.fixture
def payload():
    return {"title": "A fictional test day", "content": "Fictional integration test.", "entry_date": "2026-10-26", "mood": "hopeful", "is_milestone": False, "milestone_type": None}
