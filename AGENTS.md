# My Journal

Build a small, warm personal journal with React/TypeScript/Vite/Tailwind, FastAPI,
SQLAlchemy/Alembic, and PostgreSQL. Delivery and privacy take priority over expansion.

Read [PRD](docs/PRD.md), [architecture](docs/architecture.md),
[task tracker](docs/tasks.md), [roles](docs/agents.md), and
[Git workflow](docs/git-workflow.md) as relevant to your task.

## Workflow

Planner defines acceptance criteria in the tracker before implementation. Developer
implements the bounded task. Tester executes relevant automated and direct checks.
Reviewer inspects correctness, security, and evidence, then Developer fixes defects.
These are sequential logical roles unless actual delegation is explicitly recorded.
Record representative activity and actual outcomes in docs/ai-usage-report.md.
Never invent test results, agent activity, deployed URLs, or remote CI runs.

## Constraints

- One React codebase; storage adapters select local API or isolated browser demo.
- Demo records are fictional and browser-local. Never expose a shared anonymous API.
- Persistent API uses a configured bearer token. Do not embed it in built frontend assets.
- Do not log journal contents, credentials, or authorization headers.
- No unused authentication framework or optional product scope.
- Run `./scripts/test.sh`; verify Docker and persistence before claiming readiness.
- No remote push, public publishing, billable resources, or irreversible external
  changes without explicit authorization for the destination/action.
- Never commit secrets, runtime data, generated dependencies, or browser storage.
