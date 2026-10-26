# My Journal

A personal journaling web application for recording ordinary moments, emotions,
achievements, challenges, and reflections. Entries appear newest first; selected
milestones form a chronological Growth Timeline using the same records.

Built for the [DataTalksClub AI Dev Tools Zoomcamp final project](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/project/README.md).

**[Open the live demo — no account required](https://jiaruitang.github.io/my-journal/).**
The demo contains fictional examples and stores entries in the browser.

![My Journal browser-local demo with fictional entries](docs/images/journal-desktop.png)

## Local execution

Prerequisite: running Docker with Docker Compose v2. From the repository root:

```sh
docker compose up --build
```

Open **http://localhost:8080** (or http://127.0.0.1:8080). Three fictional entries
are seeded once during initial database migration. Connect with this development-only
access token (or your `API_TOKEN` override):

```text
local-development-token-change-before-hosting
```

No `.env` copy or manual database migration is needed. Compose starts React/Nginx,
FastAPI, and PostgreSQL, waits for health checks, and applies Alembic migrations.
Only the frontend is bound to the host, on loopback. Entries live in a named Docker
volume and survive container restarts. `docker compose down` stops the application
and keeps that volume. Do not remove the volume if you want to retain entries.

## Journal and Growth Timeline

- Create a dated entry with a title, thoughts, and optional mood.
- Open the full entry, edit it, and delete it after confirmation.
- Mark an entry as Achievement, Challenge / Failure, Turning Point, or Reflection.
- Switch to Growth Timeline to revisit milestones oldest first.
- Use the same responsive, keyboard-accessible interface on desktop and mobile.

## Reviewer demo and privacy

**Verified public HTTPS demo:** [jiaruitang.github.io/my-journal/](https://jiaruitang.github.io/my-journal/).
It is hosted on GitHub Pages without an account or access token. The source is
[JiaruiTang/my-journal](https://github.com/JiaruiTang/my-journal). See
[deployment instructions and privacy checks](docs/deployment.md).

The static production demo uses the **same React application** with a browser-local
storage adapter. It starts with fictional examples and requires no account. Each
browser origin/profile keeps its own records; records are not shared with other
reviewers. Changes survive refresh until that browser’s site data is cleared.
Tabs within one browser profile share the demo. It is not encrypted, backed up,
or synchronized; avoid sensitive information. Storage failures display an error.

The local Docker application uses FastAPI and PostgreSQL, protected by a runtime
bearer token. The token is never compiled into frontend assets and stays only in
sessionStorage until disconnected or the tab session ends. This is a single private
notebook, not multi-user authentication. Never give reviewers the private API token
or publicly expose the development configuration.

To preview the static demo (Node.js 22.18+ and npm required):

```sh
./scripts/build-demo.sh
cd frontend
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173. The script creates a deployable static folder and tarball.
It does not publish anything. A frontend build defaults to demo mode; the Docker
frontend explicitly builds with `VITE_STORAGE_MODE=api`.

## Automated verification

Prerequisites: Docker Compose, Node.js 22.18+, npm, Python 3.11+, and network access
for initial dependency/browser downloads. No local PostgreSQL installation needed.

```sh
./scripts/test.sh
```

This runs backend unit/integration tests against a separate ephemeral PostgreSQL
database, starts the full application, installs locked frontend dependencies,
runs frontend unit tests and a production build, then runs Playwright desktop/mobile
flows in both demo and API modes. Finally it creates a disposable fictional entry,
restarts PostgreSQL/backend, verifies persistence, and deletes that entry. The
application stays running at http://127.0.0.1:8080; temporary test containers are
removed. Linux CI installs Chromium system dependencies automatically.

Do not run the suite against a personal notebook in active use: the restart smoke
temporarily interrupts local access. It does not clear development entries. Test
fixtures refuse to truncate any database whose name does not end with `_test`.
If using a custom `.env`, export the matching `API_TOKEN` before running tests.
The complete test runner uses the default frontend port 8080.

See [verification evidence](docs/verification.md) for actual results and limitations.

## API

Journal routes require `Authorization: Bearer <API_TOKEN>`. Requests and responses
use JSON. Invalid input returns 422; missing entries 404; invalid tokens 401;
database unavailability 503, with an `error.code` and `error.message` envelope.
Health is anonymous and checks PostgreSQL connectivity.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/entries` | Entries newest first |
| POST | `/api/entries` | Create; returns 201 |
| GET | `/api/entries/{id}` | Complete entry |
| PATCH | `/api/entries/{id}` | Update provided fields; validate merged record |
| DELETE | `/api/entries/{id}` | Delete; returns 204 |
| GET | `/api/entries?milestones=true` | Milestones oldest first |
| GET | `/health` | Service and database readiness |

Titles: 1–160 trimmed characters. Content: 1–20,000 trimmed characters. Dates: ISO
calendar dates. Moods: joyful, calm, hopeful, tired, sad, or null. Milestone types:
achievement, challenge, turning_point, reflection. Clearing `is_milestone` in PATCH
clears its category. Unknown fields and null required fields are rejected.

## Structure and development

`frontend/`: React, TypeScript, Vite, Tailwind, Vitest, Playwright.
`backend/`: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pytest.
`compose.yaml`: complete local runtime; `compose.test.yaml`: isolated integration tests.
`.github/workflows/ci.yml`: PR/main tests, gated Pages deployment, live anonymous
browser checks, personal-root visibility checks, and browser evidence upload.

For backend changes use Python 3.13 and `backend/requirements.lock.txt`; direct
dependencies are listed in `backend/requirements.txt`. For frontend changes use
`npm ci` in `frontend/`. Docker builds use the committed dependency locks.

- [Product specification and acceptance criteria](docs/PRD.md)
- [Architecture and privacy boundaries](docs/architecture.md)
- [Agent instructions](AGENTS.md), [roles](docs/agents.md), [task tracker](docs/tasks.md)
- [Git workflow](docs/git-workflow.md), [AI usage report](docs/ai-usage-report.md)
- [Rubric compliance](docs/rubric-compliance.md)
- [Deployment and rollback](docs/deployment.md)
- [Zoomcamp submission and reviewer guide](docs/submission.md)

The [first complete CI/CD run passed](https://github.com/JiaruiTang/my-journal/actions/runs/40402578924)
for deployment commit `852c0d6`, including public desktop/mobile CRUD and isolation
checks. Main pushes deploy after tests; PRs run tests without deployment.
Advanced metrics/traces, alerts, and an on-call agent are not implemented. The
student must complete the course submission and three peer reviews separately.
