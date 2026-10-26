# Deployment and rollback

## Current publication state

The user created and designated the public repository
[JiaruiTang/my-journal](https://github.com/JiaruiTang/my-journal), then explicitly
authorized pushing committed `main` and verifying GitHub Actions. The initial push
succeeded, remote `main` matched local commit `c0ee6d9`, and the
[first CI run passed](https://github.com/JiaruiTang/my-journal/actions/runs/40398639362).
The public task tracker and product specification are now accessible in the repository.
An authorized hosting destination is still outstanding. No cloud hosting resources
were provisioned and no deployed application URL is claimed. The available Sites hosting
runtime is Cloudflare Workers and cannot host this Python/PostgreSQL stack directly;
it can host the browser-local demo once a destination/publication is authorized.

## Recommended submission deployment: static reviewer demo

The handoff explicitly permits a browser-local demo alongside a fully functioning
PostgreSQL local stack. This keeps anonymous reviewers isolated without accounts.
The same frontend components and contracts are used in both modes.

1. Completed: the public repository is configured as `origin`; the verified project
   and task tracker are published on `main` with explicit user authorization.
2. Completed: remote commit equality and a successful GitHub Actions test run were
   verified. Continue checking CI after subsequent source changes.
3. Choose an existing approved static host/account. `netlify.toml` supplies the
   build command, output directory, demo environment, redirects and security headers,
   following [Netlify's file configuration reference](https://docs.netlify.com/build/configure-builds/file-based-configuration/).
   Connect the repository and review the provider's plan before enabling deployment.
   Alternatively run `./scripts/build-demo.sh` and upload `frontend/dist` to an
   approved HTTPS static host. Do not upload `.env` or runtime storage.
4. Verify the actual public HTTPS site, including create/edit/delete, refresh,
   timeline, and a second isolated browser context. Ensure no `/api` requests occur.
5. Record the verified URL in README and the rubric/verification reports. Publish
   the task tracker with the repository. Observe a successful GitHub Actions run.

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

Static host: select the previous known-good deployment in the provider UI, restore
its immutable artifact, and repeat the public smoke flows. Browser-local entries
are retained under the same origin; avoid incompatible storage-schema changes.

Full-stack: retain previous frontend/backend image tags, back up PostgreSQL before
migrations, and redeploy those tags when their schema is compatible. For incompatible
schema changes restore a tested database backup in a maintenance window. Never run
a destructive migration downgrade against user data without authorization.

CI is prepared to run tests automatically; deployment automation is not enabled
without an authorized provider/destination. No rollback execution is claimed.
