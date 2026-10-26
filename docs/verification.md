# Verification record

Date: 2026-10-26 (America/New_York).

## Environment

macOS, Node 22.18.0, npm 11.5.2 (initial lock generated using npm 11.21.1),
Python 3.13.5, Docker Engine 27.3.1, Docker Compose 2.29.7. PostgreSQL tests use
the actual PostgreSQL 17 container, not a SQLite substitute.

## Initial results and repairs

- First backend run: 29 passed. First frontend unit run: 14 passed.
- First browser demo run: 4 passed (desktop/mobile CRUD and separate-context isolation).
- First API browser run: 2 failed and 2 intentionally skipped. Strict PATCH rejected
  response metadata; corrected the write projection and added a regression test.
- Review corrected repeat seeding via a one-time migration and added migration
  idempotence and safe storage-outage tests. The two failed browser records were removed.
- Initial full-stack Docker build and health checks passed once the npm lock existed.

## Final complete run

`./scripts/test.sh` **exited 0**. Actual results:

| Check | Result |
| --- | --- |
| Backend unit + integration, isolated PostgreSQL 17 | 31 passed |
| Frontend validation + storage unit tests | 15 passed |
| TypeScript and Vite production builds | Passed locally and inside Docker |
| Browser demo, desktop + mobile Chromium | 4 passed |
| Browser API, desktop + mobile Chromium | 2 passed; 2 demo-only isolation checks intentionally skipped in API mode |
| Docker Compose full build/start | All three services healthy |
| Frontend, health, no anonymous API access | Passed |
| PostgreSQL/backend restart, read existing test record | Passed |
| Update, milestone filter, delete and verify 404 | Passed |

The raw local log is retained in ignored `artifacts/full-suite.log`. Key output:

```text
31 passed, 1 warning
Tests 15 passed (15)
4 passed
2 skipped
2 passed
PASS: entry persisted across PostgreSQL/backend restart
PASS: frontend, health, access protection, CRUD, milestone filter and deletion
```

The backend warning is Starlette's deprecation notice about the httpx TestClient
transport; it did not fail tests. Browser output also reports Node color-environment
warnings. PostgreSQL's deliberate constraint-rejection test logs an expected error
without the rejected row contents. No unresolved test failures remain.

The local stack is left running at http://127.0.0.1:8080. Only the frontend is
published to loopback; backend/database ports are internal. Initial tests used the
Vite development server for demo flows; a separate production-artifact check is
recorded after packaging below.

## Production demo artifact

`./scripts/build-demo.sh` exited 0 and produced `frontend/dist/` and
`artifacts/my-journal-demo.tar.gz`. The archive contains only index.html, favicon,
and compiled JS/CSS assets. No database, environment file, token, or runtime records
are packaged. `E2E_PREVIEW=1 npm run test:e2e` in frontend exited 0: **4 passed**
against the actual production bundle served by Vite preview, covering desktop/mobile
CRUD, milestones, refresh, literal text handling, and separate browser contexts.
No journal API requests occurred. This is local artifact verification, not deployment.

Archive SHA-256:
`3b0ed2eff4cea9a63b8346f51762ecae8cfa03c0a54b38c6b91dbdc380825c58`.

Final direct check confirmed the database contains only the three fictional seeds
(all disposable browser/smoke records removed), `/health` is healthy, response headers
include no-store for API data and frame protection, and neither development nor test
access tokens are embedded in the compiled demo JavaScript.

![Verified browser-local demo](images/journal-desktop.png)

## Additional direct checks

- `docker compose config --quiet` and test Compose validation succeeded.
- Netlify configuration parsed with Python tomllib; static demo mode/output/headers checked.
- Staged tree inspected for runtime data and common private-key/token patterns: none found.
  Only explicit public development/test credentials are included. This is a bounded
  repository review, not a formal security audit.
- Desktop/mobile demo screenshots were visually inspected. Final screenshots
  fast-forward entry animations to avoid capturing transient fade-in states.

## Unverified / external

The public repository, public HTTPS demo, remote CI/CD, and anonymous reviewer
flows are verified below. No actual rollback execution, metrics/traces UI, alert
delivery, on-call agent, course submission, or completed peer reviews is claimed.
These advanced rubric features were deferred to prioritize today's working MVP.

## GitHub publication and CI

The user explicitly authorized pushing committed `main` to
`https://github.com/JiaruiTang/my-journal.git` and verifying GitHub Actions.
`git push -u origin main` succeeded. `git ls-remote origin refs/heads/main` matched
local HEAD `c0ee6d9986420eb60f3eaaba378bc8609179119e`.

[Verify My Journal — run 40398639362](https://github.com/JiaruiTang/my-journal/actions/runs/40398639362)
completed with conclusion **success** for that exact SHA on 2026-10-26. Its `test`
job succeeded, including `Run ./scripts/test.sh` and the browser-evidence upload.
This is actual GitHub-hosted Linux execution, separate from the earlier local run.
The [public task tracker](https://github.com/JiaruiTang/my-journal/blob/main/docs/tasks.md)
was also verified through GitHub's contents API.

This documentation follow-up records the verified implementation run. Subsequent
commits trigger their own checks; the chat handoff reports the final observed run.

## Public deployment and personal-site privacy

**Verified demo:** https://jiaruitang.github.io/my-journal/

The user explicitly selected this project site and required the personal website
at https://jiaruitang.github.io/ to remain HTTP 404. Only `my-journal` Pages was
configured, with workflow publishing and enforced HTTPS; no personal repository,
root-site setting, custom domain, or paid resource was changed.

Commit `852c0d6afdfb859f3d0a1e0d35ca29c9d4fc08d1` was published by
[CI/CD run 40402578924](https://github.com/JiaruiTang/my-journal/actions/runs/40402578924).
Both `test` and `deploy-demo` jobs completed with **success**. The deployment job
ran production browser tests under `/my-journal/`, the pre-publication root guard,
the actual Pages deployment, live public browser tests, and the post-publication
root guard. All those named steps succeeded; browser evidence was uploaded.

Independent checks from the local machine, after the GitHub deployment:

| Check | Observed result |
| --- | --- |
| Anonymous HTTPS GET /my-journal/ | 200, My Journal HTML; no redirect to sign-in |
| Public favicon, JavaScript, and CSS | 200, expected content types, byte-identical to locally tested production assets |
| `E2E_BASE_URL=https://jiaruitang.github.io/my-journal/ npm run test:e2e` | 4 passed on desktop/mobile, fresh browser contexts, no saved authentication |
| Public flows | Create, complete view, mood, edit, milestone, timeline, refresh, deletion cancellation/confirmation, home-link path |
| Demo isolation | Second browser context cannot see the first context's new entry; no journal API requests |
| Personal-site root before deployment | 404 |
| Personal-site root after deployment and independent live tests | 404 |
| Existing local Docker services | All three still healthy; frontend remains loopback-only |

The live screenshot was visually inspected. Demo data is fictional and changes
stay in each reviewer's browser profile/origin until site data is cleared. The
private PostgreSQL-backed notebook remains a separate local execution mode in the
same codebase; no private records or API tokens are part of the static deployment.

## Local handoff and remaining user actions

Implementation is committed as `e69d276`; the subsequent documentation-only commit
records final evidence. The working application is at http://127.0.0.1:8080 and uses
the development token documented in README. Start again with `docker compose up --build`.

1. Completed: the user-created public repository contains the committed project,
   the authorized push succeeded, and the initial GitHub Actions run passed.
2. Completed: the authorized free GitHub Pages demo is public, anonymous desktop/
   mobile flows passed, and the personal-site root remains 404.
3. Completed: README, deployment instructions, task tracker, and rubric report
   contain the verified demo URL and evidence.
4. Submit the public repository and demo URLs through the course platform, then
   complete its three required peer reviews. Those remain student responsibilities.

Technical MVP readiness: **Ready for reviewer access**, with the browser-local demo
storage boundary explicitly documented. No external implementation/deployment
blocker remains; advanced optional rubric work is not implemented.
