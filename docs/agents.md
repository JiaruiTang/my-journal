# Agent roles and process

Development follows Planner, Developer, Tester, and Reviewer roles in sequence.
One Codex agent performed these roles; independent agents and human review are
not part of the recorded workflow.

| Role | Responsibility | Handoff evidence |
| --- | --- | --- |
| Planner | Define scope and acceptance criteria against the product brief and course rubric | PRD, architecture, tasks |
| Developer | Implement selected task with minimal dependencies | Code and local commits |
| Tester | Execute behavior, persistence and error-path checks | Commands and actual outputs |
| Reviewer | Inspect privacy, regressions, accessibility and evidence gaps | AI usage report, fixes |

The public tracker in docs/tasks.md links implementation tasks to acceptance
criteria. Verification records contain executed commands, failures, and repairs.
Deployment status follows actual runtime checks rather than configuration presence.
