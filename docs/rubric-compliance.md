# Rubric compliance

Reviewed 2026-10-26 against the [official rubric](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/526d9c12506c159e7a8f3cef30e5de1eeaec287b/project/README.md)
(last rubric commit 2026-10-16). The course defines 12 criteria, 24 available points,
and a 10-point passing threshold. Three peer reviews are separately required.
These are evidence statuses, not awarded points or a claim of submission readiness.

| Criterion | Required evidence | Status | Verification / gap |
| --- | --- | --- | --- |
| Problem description | Purpose, behavior | Verified | README and PRD explain journaling and milestones |
| Product specification | Acceptance criteria, public tracker, agent usage | Partial | PRD and docs/tasks.md used from before implementation; tracker is still local |
| Agent team specification | Responsibilities and workflow | Verified | AGENTS.md, docs/agents.md, and truthful sequential-role evidence in AI report |
| Context management | Root instructions, modular context | Verified | AGENTS.md links specification, architecture, process, tracker, Git workflow |
| Application | Connected frontend/API/database, single command | Verified | Desktop/mobile API browser CRUD passed; actual record persisted across database/backend restart |
| Testing | Passing unit and integration, one command | Verified | scripts/test.sh exit 0: 31 backend, 15 frontend, 6 browser tests plus restart smoke |
| Containerization | Whole system starts in Compose | Verified | Actual Docker image builds and all three health checks passed |
| Deployment | Public reachable app/demo | Blocked | Static artifact/configuration prepared; no authorized destination or public URL |
| CI/CD | Remote PR tests; deployment stages | Partial | Workflow invokes full local suite; not pushed/run on GitHub; CD absent |
| Observability | Logs; correlated metrics/traces and UI for full coverage | Partial | Actual structured API method/status/duration logs; metrics/traces/UI absent |
| Alerting on user impact | Demonstrated user-impact alert | Not Implemented | Deferred outside core delivery scope |
| On-call agent | Alert-triggered demonstrated recovery | Not Implemented | No agent recovery claimed |

Full-stack and test statuses reflect the actual complete runner's successful exit.
External availability and CI execution cannot be inferred from files.
Public repository/hosting permissions, deployment verification, and course peer
reviews remain external submission gates. See verification.md and deployment.md.
