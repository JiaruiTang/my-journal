# Rubric compliance

Reviewed 2026-10-26 against the [official rubric](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/526d9c12506c159e7a8f3cef30e5de1eeaec287b/project/README.md)
(last rubric commit 2026-10-16). The course defines 12 criteria, 24 available points,
and a 10-point passing threshold. Three peer reviews are separately required.
My Journal includes a tested local full-stack application, a public reviewer demo,
and automated CI/CD. The following table maps implementation evidence to the
assessment criteria. Peer reviewers determine the final score.

| Criterion | Required evidence | Status | Verification / gap |
| --- | --- | --- | --- |
| Problem description | Purpose, behavior | Verified | README and PRD explain journaling and milestones |
| Product specification | Acceptance criteria, public tracker, agent usage | Verified | PRD and docs/tasks.md used before implementation; tracker and AI usage report are now publicly accessible |
| Agent team specification | Responsibilities and workflow | Verified | AGENTS.md, docs/agents.md, and truthful sequential-role evidence in AI report |
| Context management | Root instructions, modular context | Verified | AGENTS.md links specification, architecture, process, tracker, Git workflow |
| Application | Connected frontend/API/database, single command | Verified | Desktop/mobile API browser CRUD passed; actual record persisted across database/backend restart |
| Testing | Passing unit and integration, one command | Verified | scripts/test.sh exit 0: 31 backend, 15 frontend, 6 browser tests plus restart smoke |
| Containerization | Whole system starts in Compose | Verified | Actual Docker image builds and all three health checks passed |
| Deployment | Public reachable app/demo | Verified | Public HTTPS Pages demo passed anonymous desktop/mobile CRUD, timeline, refresh and isolation tests; personal root stayed 404 |
| CI/CD | Remote PR tests; deployment stages | Partial | Actual full CI and automatic Pages deployment passed; live browser/privacy guards passed; separate dev/manual-production stages absent |
| Observability | Logs; correlated metrics/traces and UI for full coverage | Partial | Actual structured API method/status/duration logs; metrics/traces/UI absent |
| Alerting on user impact | Demonstrated user-impact alert | Not Implemented | Deferred outside core delivery scope |
| On-call agent | Alert-triggered demonstrated recovery | Not Implemented | No agent recovery claimed |

The technical MVP and public reviewer demo are ready. Remaining coverage gaps are
advanced telemetry, operational alerts, an on-call responder, and separate dev/
manual-production deployment stages. These are scoring gaps rather than universal
submission prerequisites under the published threshold. Course completion still
requires the project submission and three peer reviews. See submission.md,
verification.md, and deployment.md.
