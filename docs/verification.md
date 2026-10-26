# Verification record

Date: 2026-10-26 (America/New_York).

## Environment

macOS, Node 22.18.0, npm 11.5.2 (initial lock generated using npm 11.21.1),
Python 3.13.5, Docker Engine 27.3.1, Docker Compose 2.29.7. PostgreSQL tests use
the actual PostgreSQL 17 container, not a SQLite substitute.

## Initial results and repairs

- First backend run: 29 passed. First frontend unit run: 14 passed.
- First browser demo run: 4 passed (desktop/mobile CRUD and separate-context isolation).
- First API browser run: 2 failed and 2 intentionally skipped. Strict PATCH rejected
  response metadata; corrected the write projection and added a regression test.
- Review corrected repeat seeding via a one-time migration and added migration
  idempotence and safe storage-outage tests. The two failed browser records were removed.
- Initial full-stack Docker build and health checks passed once the npm lock existed.

## Final complete run

`./scripts/test.sh` **exited 0**. Actual results:

| Check | Result |
| --- | --- |
| Backend unit + integration, isolated PostgreSQL 17 | 31 passed |
| Frontend validation + storage unit tests | 15 passed |
| TypeScript and Vite production builds | Passed locally and inside Docker |
| Browser demo, desktop + mobile Chromium | 4 passed |
| Browser API, desktop + mobile Chromium | 2 passed; 2 demo-only isolation checks intentionally skipped in API mode |
| Docker Compose full build/start | All three services healthy |
| Frontend, health, no anonymous API access | Passed |
| PostgreSQL/backend restart, read existing test record | Passed |
| Update, milestone filter, delete and verify 404 | Passed |

The raw local log is retained in ignored `artifacts/full-suite.log`. Key output:

```text
31 passed, 1 warning
Tests 15 passed (15)
4 passed
2 skipped
2 passed
PASS: entry persisted across PostgreSQL/backend restart
PASS: frontend, health, access protection, CRUD, milestone filter and deletion
```

The backend warning is Starlette's deprecation notice about the httpx TestClient
transport; it did not fail tests. Browser output also reports Node color-environment
warnings. PostgreSQL's deliberate constraint-rejection test logs an expected error
without the rejected row contents. No unresolved test failures remain.

The local stack is left running at http://127.0.0.1:8080. Only the frontend is
published to loopback; backend/database ports are internal. Initial tests used the
Vite development server for demo flows; a separate production-artifact check is
recorded after packaging below.

## Production demo artifact

`./scripts/build-demo.sh` exited 0 and produced `frontend/dist/` and
`artifacts/my-journal-demo.tar.gz`. The archive contains only index.html, favicon,
and compiled JS/CSS assets. No database, environment file, token, or runtime records
are packaged. `E2E_PREVIEW=1 npm run test:e2e` in frontend exited 0: **4 passed**
against the actual production bundle served by Vite preview, covering desktop/mobile
CRUD, milestones, refresh, literal text handling, and separate browser contexts.
No journal API requests occurred. This is local artifact verification, not deployment.

Archive SHA-256:
`3b0ed2eff4cea9a63b8346f51762ecae8cfa03c0a54b38c6b91dbdc380825c58`.

Final direct check confirmed the database contains only the three fictional seeds
(all disposable browser/smoke records removed), `/health` is healthy, response headers
include no-store for API data and frame protection, and neither development nor test
access tokens are embedded in the compiled demo JavaScript.

![Verified browser-local demo](images/journal-desktop.png)

## Additional direct checks

- `docker compose config --quiet` and test Compose validation succeeded.
- Netlify configuration parsed with Python tomllib; static demo mode/output/headers checked.
- Staged tree inspected for runtime data and common private-key/token patterns: none found.
  Only explicit public development/test credentials are included. This is a bounded
  repository review, not a formal security audit.
- Desktop/mobile demo screenshots were visually inspected. Final screenshots
  fast-forward entry animations to avoid capturing transient fade-in states.

## Unverified / external

No public repository URL, public HTTPS deployment, remote GitHub Actions run,
deployment rollback execution, metrics/traces UI, alert delivery, on-call agent,
or completed peer reviews is claimed. Public submission readiness remains partial.

## Local handoff and remaining user actions

Implementation is committed as `e69d276`; the subsequent documentation-only commit
records final evidence. The working application is at http://127.0.0.1:8080 and uses
the development token documented in README. Start again with `docker compose up --build`.

1. Designate an empty public GitHub repository URL and authorize pushing to that
   exact destination. Then publish main and verify the GitHub Actions run.
2. Designate and authorize an existing static hosting account/project for the demo.
   Deploy the prepared artifact or connect the repository using netlify.toml.
3. Verify the public HTTPS URL in two separate browser contexts: create, view, edit,
   milestone/timeline, refresh, delete/cancel. Confirm no journal API requests or
   shared data. Update README, deployment evidence, and rubric status with the URL.
4. Submit the public repository/demo through the course platform and complete its
   three required peer reviews. No course submission or peer review was performed here.
