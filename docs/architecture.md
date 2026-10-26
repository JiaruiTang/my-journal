# Architecture

## Application structure

React uses one `EntryStore` contract. The API adapter connects to same-origin
`/api` through Nginx (Docker) or Vite (development). The demo adapter uses localStorage
with fictional samples. A build-time mode selects the adapter; components are shared.

FastAPI validates requests with Pydantic; SQLAlchemy persists records in PostgreSQL;
Alembic applies versioned schema migrations. Docker starts the database, waits for
health, runs migrations/seed, then starts the API and frontend. A named database
volume survives restarts. Health checks check actual database connectivity.

## Privacy boundary

The private/local API requires a bearer token supplied at runtime by the user and
held in sessionStorage. Nginx proxies requests without injecting credentials.
The backend and database have no host port published by Compose. The frontend is
bound to 127.0.0.1 by default. The default token is explicitly development-only.
Hosting the API requires a strong secret and HTTPS; do not publish the local stack
as a shared anonymous journal. The public demo makes no API requests.

Demo data stays within the browser origin/profile, is fictional at initialization,
and is not encrypted. Demo UI explains this; users should not enter sensitive data.
Untrusted content renders as React text. Telemetry never includes journal text.

## Data contract

Entry: UUID id; title (1–160 characters after trim); content (1–20000 after trim);
ISO entry_date; nullable mood (joyful, calm, hopeful, tired, sad); is_milestone;
nullable milestone_type (achievement, challenge, turning_point, reflection);
UTC created_at and updated_at. A milestone requires a category; a non-milestone
has no category. PATCH validates the merged record, not only supplied fields.

## Deployment

The same frontend builds as a static browser-local demo. The full stack can be
deployed to a Docker-capable host with PostgreSQL and a private API configuration.
See deployment.md for configuration, smoke checks, rollback, and authorization gates.

The public demo runs on the GitHub Pages project site at `/my-journal/`.
`VITE_BASE_PATH` selects that path for static assets and the
home link, while Docker keeps `/`. Deployment is gated by the full CI test job and
production browser tests under the subpath; live anonymous browser tests run after
publication. No FastAPI service or private PostgreSQL data is deployed to Pages.
The personal-site root must remain unpublished (HTTP 404). A read-only guard runs
before and after project-site deployment; only the `my-journal` repository's Pages
settings are configured. The two sites use separate repositories/deployments.
