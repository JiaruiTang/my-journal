"""Local API smoke; --restart proves PostgreSQL persistence through service restart."""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

base = os.environ.get("BASE_URL", "http://127.0.0.1:8080")
token = os.environ.get("API_TOKEN", "local-development-token-change-before-hosting")


def request(path, method="GET", body=None, authenticated=True):
    headers = {"Content-Type": "application/json"}
    if authenticated:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=5) as response:
        data = response.read()
        return json.loads(data) if data else None


assert request("/health")["status"] == "ok"
with urllib.request.urlopen(base, timeout=5) as response:
    assert response.status == 200 and b"My Journal" in response.read()
try:
    request("/api/entries", authenticated=False)
    raise AssertionError("Anonymous API access must fail")
except urllib.error.HTTPError as error:
    assert error.code == 401

entry = request("/api/entries", "POST", {"title": "Fictional persistence smoke", "content": "Disposable automated verification record.", "entry_date": "2026-10-26", "mood": "calm", "is_milestone": False, "milestone_type": None})
path = f"/api/entries/{entry['id']}"
try:
    if "--restart" in sys.argv:
        if base != "http://127.0.0.1:8080":
            raise RuntimeError("Restart smoke is restricted to the default local Compose target")
        subprocess.run(["docker", "compose", "restart", "db", "backend"], check=True, timeout=60)
        deadline = time.monotonic() + 60
        while True:
            try:
                if request("/health")["status"] == "ok":
                    break
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                pass
            if time.monotonic() > deadline:
                raise RuntimeError("Services did not recover within 60 seconds")
            time.sleep(1)
        assert request(path)["content"] == entry["content"]
        print("PASS: entry persisted across PostgreSQL/backend restart")
    updated = request(path, "PATCH", {"title": "Fictional smoke updated", "is_milestone": True, "milestone_type": "reflection"})
    assert updated["is_milestone"]
    assert entry["id"] in [e["id"] for e in request("/api/entries?milestones=true")]
finally:
    request(path, "DELETE")
try:
    request(path)
    raise AssertionError("Deleted entry still exists")
except urllib.error.HTTPError as error:
    assert error.code == 404
print("PASS: frontend, health, access protection, CRUD, milestone filter and deletion")
