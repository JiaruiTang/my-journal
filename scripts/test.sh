#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test_project="journal-tests-$$"
cleanup() { docker compose -p "$test_project" -f compose.test.yaml down -v --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker compose -p "$test_project" -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
docker compose up --build -d --wait --wait-timeout 180
npm --prefix frontend ci
npm --prefix frontend run test
npm --prefix frontend run build
cd frontend
if [ "${CI:-}" = "true" ]; then npx playwright install --with-deps chromium; else npx playwright install chromium; fi
npm run test:e2e
E2E_MODE=api npm run test:e2e
cd ..
python3 scripts/smoke_test.py --restart
