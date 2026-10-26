# Task tracker

Created before implementation, used by the sequential roles in docs/agents.md.
Statuses are evidence-based. This tracker is published in the public GitHub repository.

| ID | Task and acceptance | Status |
| --- | --- | --- |
| T1 | Specify scope, privacy boundaries, roles, and current rubric | Verified: pre-code PRD and tracker; official rubric checked |
| T2 | API CRUD, merged PATCH validation, migrations, PostgreSQL, protected routes | Verified: 31 backend tests against PostgreSQL |
| T3 | Shared React UI, gallery/editor/detail/mood/timeline/delete confirmation | Verified: API and demo desktop/mobile browser flows |
| T4 | Isolated fictional browser demo; refresh and separate-context verification | Verified: unit and browser isolation checks; no demo API requests |
| T5 | Compose starts all services; health and persistence verified | Verified: full build, three healthy services, restart persistence smoke |
| T6 | Single-command unit/integration/frontend/browser suite passes | Verified: scripts/test.sh exit 0; 31 backend + 15 frontend + 6 browser tests |
| T7 | CI config, production config, rollback and reproduction instructions | Partial: remote CI passed; production configuration/rollback documented; public hosting blocked |
| T8 | Review code, verify evidence, commit; publish only if authorized | Verified: local review, authorized main push, matching remote SHA, and successful GitHub Actions run |

The first API browser run caught rejected edit metadata. The write contract was
fixed and retested. Review also caught repeat seeding; migration 0002 and a regression
test prevent deleted examples from reappearing. See verification.md and ai-usage-report.md.
