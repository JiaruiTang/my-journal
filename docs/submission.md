# My Journal Zoomcamp Submission

My Journal is a personal journaling application with dated entries, optional moods,
and a milestone-based Growth Timeline. The public demo is available without an
account. The complete application runs locally with React, FastAPI, and PostgreSQL.

## Submission links

| Item | Link |
| --- | --- |
| Public repository | https://github.com/JiaruiTang/my-journal |
| Live reviewer demo | https://jiaruitang.github.io/my-journal/ |
| Submission form | https://courses.datatalks.club/ai-dev-tools-2026/project/project1 |
| Verified CI and deployment | https://github.com/JiaruiTang/my-journal/actions/runs/40403428826 |
| Product specification | [PRD](PRD.md) |
| Public task tracker | [Tasks](tasks.md) |
| Test and deployment evidence | [Verification](verification.md) |
| Rubric coverage | [Rubric compliance](rubric-compliance.md) |
| AI development process | [Roles](agents.md) and [AI usage report](ai-usage-report.md) |

The Project 1 deadline is **26 October 2026 at 19:00 EDT in New York**, equivalent
to **23:00 UTC**. The course platform stores `2026-10-26T23:00:00+00:00` and renders
the deadline in the viewer's timezone.

## Project summary

My Journal records everyday experiences and makes selected milestones easy to
revisit. Entries support a title, content, date, and optional mood. Milestones use
Achievement, Challenge / Failure, Turning Point, or Reflection categories and appear
chronologically in the Growth Timeline. The same React and TypeScript interface
supports a FastAPI and PostgreSQL application in Docker and a browser-local public
demo. The demo starts with fictional entries and stores each visitor's edits only
in that browser. Automated tests cover validation, database-backed CRUD,
persistence, responsive browser flows, and demo isolation. GitHub Actions runs the
suite before deploying the static demo and checking the live site.

## Submission form values

| Field | Value |
| --- | --- |
| GitHub link to the project | `https://github.com/JiaruiTang/my-journal` |
| Commit ID | Full 40-character SHA of the selected green `main` commit; retain that exact revision for evaluation |
| Certificate name | Participant's preferred certificate name |
| Time spent on project | Participant's actual project hours |
| Learning in public links | Optional; existing public progress posts only |
| FAQ contribution URL | Optional; an actual FAQ contribution URL, if applicable |

The verified application baseline is
`7d2d42501a0b28825d8e96375cdc84c96de8ed8b`, matching the linked successful CI/CD
run. Documentation preparation can add a later revision; its full SHA and successful
run should be used if that revision is selected for submission. Project hours and
certificate details are entered by the participant rather than inferred from AI
runtime or commit timestamps.

## Reviewer walkthrough

1. Open the live demo; no account or access token is required.
2. Create an entry with a mood, open it, and edit it.
3. Mark the entry as a milestone and open Growth Timeline.
4. Refresh the page to confirm browser-local persistence.
5. Delete the entry after confirmation. A separate browser profile or private
   window starts with independent fictional examples.

For the PostgreSQL-backed application, run `docker compose up --build` from the
repository root and open http://localhost:8080. The development access token is in
README. The entire automated suite runs with `./scripts/test.sh`.

## Verification evidence

| Check | Observed result |
| --- | --- |
| Backend validation and PostgreSQL integration | 31 tests passed |
| Frontend validation and storage | 15 tests passed |
| Browser tests for local demo and API modes | 6 passed; 2 demo-only cases intentionally skipped in API mode |
| Public anonymous desktop and mobile browser checks | 4 passed independently; also passed in CI/CD |
| Docker startup and PostgreSQL restart persistence | Passed |
| HTTPS application and static assets | HTTP 200 without authentication |
| Personal-site root privacy guard | HTTP 404 before and after deployment |

The public demo uses browser storage; it does not expose the private PostgreSQL
notebook or share records between visitors. Changes persist in the same browser
profile until site data is cleared. The PostgreSQL execution mode is verified
locally and in CI, rather than presented as public cloud persistence.

## Remaining rubric gaps

The [official rubric](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/project/README.md)
uses a passing threshold rather than requiring full coverage of every criterion.
The implemented core has linked evidence in the compliance report; peer reviewers
determine the score.

| Unfinished area | Current scope |
| --- | --- |
| Advanced observability | Structured API logs exist; correlated metrics, traces, and a telemetry UI are absent |
| User impact alerting | No operational alert is configured |
| On-call agent | No alert-triggered recovery agent is implemented |
| Highest CI/CD tier | Automatic test-gated public deployment exists; separate dev and manually approved production environments are absent |
| Rollback execution | Rollback procedure is documented; an executed rollback is not claimed |

These gaps are disclosed scoring limitations. They do not make every criterion a
universal submission prerequisite under the published rubric. The remaining course
actions are saving the project submission before the deadline and completing the
**three required peer reviews** assigned through the platform. No submission or
peer review has been recorded by this preparation workflow.
