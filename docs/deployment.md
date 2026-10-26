# Deployment and rollback

## Current publication state

The user created and designated the public repository
[JiaruiTang/my-journal](https://github.com/JiaruiTang/my-journal), then explicitly
authorized pushing committed `main` and verifying GitHub Actions. The initial push
succeeded, remote `main` matched local commit `c0ee6d9`, and the
[first CI run passed](https://github.com/JiaruiTang/my-journal/actions/runs/40398639362).
The public task tracker and product specification are now accessible in the repository.
The user has now authorized the free public GitHub Pages project site at
`https://jiaruitang.github.io/my-journal/`. Only this repository's Pages settings
are configured, using GitHub Actions and enforced HTTPS. Publication and live
verification are pending; the configured URL is not yet claimed as working.

The personal-site root `https://jiaruitang.github.io/` must remain HTTP 404.
It was checked before deployment and currently returns 404. Do not change the
personal website's repository or settings. A read-only guard checks the root before
and after every project deployment; it fails if the root is anything other than 404.

## Deadline deployment: static reviewer demo

The handoff explicitly permits a browser-local demo alongside a fully functioning
PostgreSQL local stack. This keeps anonymous reviewers isolated without accounts.
The same frontend components and contracts are used in both modes.

1. Completed: the public repository is configured as `origin`; the verified project
   and task tracker are published on `main` with explicit user authorization.
2. Completed: remote commit equality and a successful GitHub Actions test run were
   verified. Continue checking CI after subsequent source changes.
3. Main pushes run the full test job, then build `frontend/dist` with
   `VITE_STORAGE_MODE=demo` and `VITE_BASE_PATH=/my-journal/`. Desktop/mobile browser
   tests verify the production build under that subpath before Pages upload/deploy.
4. The deployment job checks the personal root before publication, deploys the
   static artifact with the official Pages actions, and runs the browser tests
   against the actual HTTPS URL without saved authentication. These cover create,
   view, edit, milestone/timeline, refresh, delete/cancel, and separate browser
   contexts; the demo must make no journal API requests. The personal root is
   checked again after deployment, including if the live browser tests fail.
5. Record the verified URL and workflow link in README and the evidence reports
   only after actual public verification succeeds.

GitHub Pages is available for public repositories on GitHub Free, and a project
site is separate from the account site. See [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
No server, managed database, custom domain, or paid subscription is provisioned.
Reviewers do not need a GitHub account; edits stay in their browser's localStorage
until they clear that site's data. They are not synced to PostgreSQL.

Manual live verification from `frontend/`:

```sh
E2E_BASE_URL=https://jiaruitang.github.io/my-journal/ npm run test:e2e
cd ..
python3 scripts/check_personal_site.py
```

Deployment is not complete until step 4 succeeds. A successful local preview is
not public deployment evidence. Static site changes remain local to each browser.

## Full-stack hosting configuration

For an already authorized Docker-capable host, build the supplied Dockerfiles and
run the same topology behind HTTPS. Keep PostgreSQL/backend on the private network.
Change both database credentials and API_TOKEN using the host's secret storage;
the API token must have at least 24 characters (generate a random 32-byte value).
URL-encode credentials embedded in DATABASE_URL. The frontend image must use
`VITE_STORAGE_MODE=api`; proxy `/api` and `/health` to the backend as in nginx.conf.
Alembic must complete before serving. The database requires persistent storage
and backups; validate health and restore before storing private data.

Compose is intentionally loopback-only and includes public development defaults;
it is a local deployment, not a ready-to-expose production configuration. Do not
give the same private API token to anonymous reviewers. Keep the public demo static,
or design and verify server-side ownership/authentication before public persistence.

## Rollback

GitHub Pages: revert the application/configuration change in an authorized commit
on main or re-run the workflow for an approved known-good main revision, then repeat
the public smoke flows and personal-root check. Browser-local entries
are retained under the same origin; avoid incompatible storage-schema changes.

Full-stack: retain previous frontend/backend image tags, back up PostgreSQL before
migrations, and redeploy those tags when their schema is compatible. For incompatible
schema changes restore a tested database backup in a maintenance window. Never run
a destructive migration downgrade against user data without authorization.

CI/CD targets only this public project site after tests pass. PRs never deploy.
`workflow_dispatch` permits rerunning the gated workflow on main. No actual rollback
execution is claimed.
