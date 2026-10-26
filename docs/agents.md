# Agent roles and process

These roles are performed sequentially by the same Codex agent. No independent
agents or human review are implied.

| Role | Responsibility | Handoff evidence |
| --- | --- | --- |
| Planner | Read handoff/current rubric, set scope and acceptance | PRD, architecture, tasks |
| Developer | Implement selected task with minimal dependencies | Code and local commits |
| Tester | Execute behavior, persistence and error-path checks | Commands and actual outputs |
| Reviewer | Inspect privacy, regressions, accessibility and evidence gaps | AI usage report, fixes |

Read task acceptance criteria before implementing. Update the tracker based on
observed tests, record failures and repairs, and do not mark external gates complete
because configuration files exist. Local tracker can become public when the
repository is authorized for publication.
