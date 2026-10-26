# Product specification

## Problem and intended user

People need a quiet place to record everyday experiences and revisit moments of
growth. My Journal provides a notebook-like journal and an optional milestone
timeline. Course reviewers can try fictional entries without an account.

## Confirmed scope

- Journal cards ordered by entry date descending, deterministic tie ordering.
- Create, read, edit, and delete with confirmation; title, content, date, optional mood.
- Mark a record as a milestone in Achievement, Challenge / Failure, Turning Point,
  or Reflection. The timeline displays those same records chronologically.
- React + TypeScript + Vite + Tailwind frontend, FastAPI API, PostgreSQL persistence,
  SQLAlchemy and Alembic, Docker Compose, tests, CI, deployment configuration.
- Warm cream paper, restrained rust/sage accents, readable typography, responsive UI.
- Public demo uses browser-local fictional data, with explicit persistence labeling.

## Acceptance criteria (specified before implementation)

1. Journal opens with a useful empty state or cards; complete contents open accessibly.
2. Valid entry creates immediately and survives refresh in its selected storage mode.
3. Title/content are required and bounded; date must be a real ISO calendar date;
   moods and milestone categories accept only documented values.
4. Editing updates both gallery and timeline; removing milestone status clears category.
5. Deleting requires confirmation; cancellation leaves the record intact.
6. Timeline includes only milestones, oldest first, with categories and full entry access.
7. API supports GET/POST /api/entries, GET/PATCH/DELETE /api/entries/{id},
   GET /api/entries?milestones=true, and GET /health; invalid input and missing
   records produce consistent errors. Database failures do not expose credentials.
8. API records are protected by a configured bearer token; no shared anonymous writes.
   Compose binds only the frontend to loopback. Public builds use demo mode.
9. Demo contexts do not share records; demo edits persist only in the same browser
   origin and profile until local storage is cleared. No real content is seeded.
10. `docker compose up --build` starts frontend/backend/database, migrates and seeds
    fictional examples automatically, and persists database records across restarts.
11. `./scripts/test.sh` runs backend unit/integration, frontend unit, and browser flows.
12. Actual verification, unresolved blockers, and rubric evidence are documented.
13. Public demo is served without an account at
    `https://jiaruitang.github.io/my-journal/`. The personal-site root at
    `https://jiaruitang.github.io/` must continue returning HTTP 404, verified before
    and after publication. Do not change the personal website's repository/settings.

## Non-goals

Accounts, cloud synchronization, AI analysis, attachments, search, social features,
and advanced observability are outside the delivery MVP.

## External gates

Public repository publishing and cloud deployment require an authorized destination.
Peer reviews and final course submission remain the student's responsibility.
