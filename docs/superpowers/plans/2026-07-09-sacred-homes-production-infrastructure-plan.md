# Sacred Homes Production Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a provider-agnostic production infrastructure foundation for Sacred Homes using Docker Compose as the canonical deployment architecture while preserving current app behavior, local-disk Active Storage, and existing VPS compatibility.

**Architecture:** The implementation keeps a single provider-agnostic Rails image that runs Puma on `PORT`, with `nginx`, `rails`, `sidekiq`, `postgres`, and `redis` composed as independently replaceable services. Persistence, secrets, backups, and documentation are all structured around this shared architecture so VPS, Railway-style, and future Kubernetes deployments derive from the same runtime model.

**Tech Stack:** Docker, Docker Compose, Nginx, Rails, Puma, Sidekiq, PostgreSQL, Redis, React, Vite, GitHub Actions, Bash

## Global Constraints

- Do not change any existing business logic.
- Do not modify API behavior.
- Do not change database schema unless absolutely required.
- Preserve existing Active Storage local-disk behavior.
- Preserve the current frontend build process while containerizing it.
- Keep the Rails image provider-agnostic.
- Keep the repository deployable both with Docker Compose and traditional VPS deployments.
- Docker Compose is the canonical production reference architecture.
- The canonical service chain is `nginx -> rails(puma) -> postgres`, with `redis` shared by `rails` and `sidekiq`.
- Every task must remain independently verifiable.
- Any secret hygiene change must be non-destructive and must not rotate live credentials.
- Real `.env` files must stay local and must not be modified in this implementation phase.
- Version-controlled example env files must define the documented variable contract.

---

## File Structure Map

### New Files Expected

- `.dockerignore`
- `.env.example`
- `.env.production.example`
- `.env.development.example`
- `.env.test.example`
- `docker-compose.yml`
- `docker-compose.production.yml`
- `docker/nginx/default.conf`
- `docker/compose/.env.compose.example`
- `scripts/docker-build.sh`
- `scripts/docker-up.sh`
- `scripts/docker-down.sh`
- `scripts/docker-logs.sh`
- `scripts/docker-rails-console.sh`
- `scripts/docker-db-setup.sh`
- `scripts/docker-reset.sh`
- `scripts/wait-for-postgres.sh`
- `scripts/backup/postgres-backup.sh`
- `scripts/backup/storage-backup.sh`
- `scripts/backup/config-backup.sh`
- `scripts/restore/postgres-restore.sh`
- `scripts/restore/storage-restore.sh`
- `scripts/restore/config-restore-checklist.sh`
- `scripts/restore/manual-restore-verify.sh`
- `.github/workflows/ci.yml`
- `ARCHITECTURE.md`
- `DOCKER.md`
- `DEPLOYMENT.md`
- `TROUBLESHOOTING.md`
- `BACKUP.md`
- `RESTORE.md`
- `SECRETS.md`
- `docs/disaster-recovery.md` or equivalent section folded into `DEPLOYMENT.md`

### Existing Files Expected To Change

- `.gitignore`
- `README_DEPLOYMENT_HOSTINGER.md`
- `SETUP_GUIDE.md`
- `env_run.md`
- `scripts/publish_frontend.sh`
- `server/Dockerfile`
- `server/.dockerignore`
- `server/bin/docker-entrypoint`
- `server/config/puma.rb`
- `server/config/database.yml`
- `server/config/cable.yml`
- `server/config/environments/production.rb`
- `server/config/nginx.conf.example`
- `deploy/hostinger/DEPLOYMENT_RUNBOOK.md`
- `deploy/hostinger/homostay_app.env.example`
- `deploy/hostinger/backup_homostay_postgres.sh`
- `server/.env.example`
- `server/.env.production.example`
- `server/.env.development.example`
- `server/.env.test.example`
- `client/.env.production.example`
- `client/.env.development.example`
- `client/.env.test.example`
- `server/README.md`
- `client/README.md`

### Existing Files Expected To Remain Unchanged

- Application controllers, models, jobs, routes, and migrations
- Frontend React feature code and booking flow logic
- WhatsApp and calendar sync business behavior

---

### Task 1: Audit Current Infra Files And Finalize Target File Boundaries

**Objective:** Lock the exact implementation surface so later tasks modify the minimum necessary files and do not drift into application logic.

**Files to Modify:**
- Modify: `docs/superpowers/plans/2026-07-09-sacred-homes-production-infrastructure-plan.md` only if boundary adjustments are needed during implementation kickoff

**Implementation Details:**
- Review all current deployment, Docker, env, and helper-script files.
- Confirm which existing files will be edited vs replaced.
- Confirm whether `docs/disaster-recovery.md` will be a standalone file or a section inside `DEPLOYMENT.md`.
- Keep the implementation surface focused on infrastructure/config/docs.

**Verification Steps:**
- Run: `git diff --name-only`
- Expected: only planning documents changed before implementation starts
- Run: `rg -n "Docker|deploy|env|backup|restore|Sidekiq|Redis|Active Storage" README_DEPLOYMENT_HOSTINGER.md SETUP_GUIDE.md env_run.md server deploy scripts`
- Expected: current infra touchpoints are identified before edits begin

**Rollback Instructions:** None needed; this is a planning-only boundary check.

**Dependencies on Previous Tasks:** None

---

### Task 2: Add Root Docker Ignore And Compose Scaffolding

**Objective:** Create the repo-level Docker build context rules and base Compose file skeleton without changing runtime behavior yet.

**Files to Modify:**
- Create: `.dockerignore`
- Create: `docker-compose.yml`
- Create: `docker-compose.production.yml`
- Create: `docker/compose/.env.compose.example`

**Implementation Details:**
- Add a root `.dockerignore` that excludes git metadata, local env files, logs, `node_modules`, temp files, and runtime artifacts.
- Create a base `docker-compose.yml` with placeholder services for `rails`, `sidekiq`, `postgres`, `redis`, and named volumes/networks.
- Create `docker-compose.production.yml` as the Nginx-enabled production overlay.
- Add a compose env example documenting shared non-secret defaults.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml config`
- Expected: valid YAML with all core services rendered
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml config`
- Expected: valid merged config with `nginx` present

**Rollback Instructions:**
- Remove the newly created Docker files if the scaffold shape is wrong before other tasks build on it.

**Dependencies on Previous Tasks:** Task 1

---

### Task 3: Rebuild The Rails Dockerfile As A Provider-Agnostic Multi-Stage Production Image

**Objective:** Convert the app image into a production-ready, multi-stage Rails image that compiles the frontend, serves Puma on `PORT`, and does not assume Nginx or any specific hosting provider.

**Files to Modify:**
- Modify: `server/Dockerfile`
- Modify: `server/.dockerignore`
- Modify: `server/bin/docker-entrypoint`
- Modify: `scripts/publish_frontend.sh`

**Implementation Details:**
- Rework `server/Dockerfile` into explicit build/runtime stages.
- Ensure bundle and npm layers are cache-friendly.
- Build frontend assets during image build and copy published output into the Rails public directory.
- Keep runtime dependencies limited to what Puma, Sidekiq, Postgres client tooling, Redis connectivity, and Active Storage/image processing need.
- Ensure the container command contract is “run app command on `PORT`,” not “run behind Nginx.”

**Verification Steps:**
- Run: `docker build -f server/Dockerfile -t sacred-homes-rails:test server`
- Expected: image builds successfully
- Run: `docker run --rm sacred-homes-rails:test ./bin/rails runner 'puts "boot-ok"'`
- Expected: prints `boot-ok`

**Rollback Instructions:**
- Revert `server/Dockerfile`, `server/.dockerignore`, `server/bin/docker-entrypoint`, and `scripts/publish_frontend.sh` together if the new image contract is broken.

**Dependencies on Previous Tasks:** Task 2

---

### Task 4: Wire Compose To The Shared Rails And Sidekiq Image

**Objective:** Make the Compose stack use the single application image for both web and worker roles.

**Files to Modify:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`

**Implementation Details:**
- Add shared build/image settings for `rails` and `sidekiq`.
- Set service-specific commands so `rails` runs Puma and `sidekiq` runs the worker process.
- Keep both services environment-driven so they work in Compose and on non-Compose targets.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml config | rg "sidekiq|rails|build|command"`
- Expected: both app services reference the same build or image and different commands
- Run: `docker compose -f docker-compose.yml up --build rails sidekiq --no-start`
- Expected: services are created without config errors

**Rollback Instructions:**
- Revert both Compose files if role separation introduces image drift or command confusion.

**Dependencies on Previous Tasks:** Task 3

---

### Task 5: Add The Nginx Reverse Proxy Container

**Objective:** Add a separate Nginx container that proxies to Rails without coupling Nginx into the Rails image.

**Files to Modify:**
- Create: `docker/nginx/default.conf`
- Modify: `docker-compose.production.yml`
- Modify: `server/config/nginx.conf.example`

**Implementation Details:**
- Create a container-friendly Nginx config that proxies to the Compose `rails` service.
- Preserve support for static asset caching headers, `/up`, and published frontend assets.
- Update the existing Nginx example config to reflect the provider-agnostic architecture and Compose reference model.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml config`
- Expected: `nginx` service and mounted config are present
- Run: `docker run --rm -v "$PWD/docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro" nginx:stable nginx -t`
- Expected: `syntax is ok` and `test is successful`

**Rollback Instructions:**
- Remove `docker/nginx/default.conf` and revert Nginx-related Compose/example config changes if proxying is incorrect.

**Dependencies on Previous Tasks:** Task 4

---

### Task 6: Configure PostgreSQL As The Compose Database Service

**Objective:** Align Rails database configuration with containerized PostgreSQL while keeping traditional VPS deployment compatible.

**Files to Modify:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`
- Modify: `server/config/database.yml`
- Modify: `.env.example`
- Modify: `deploy/hostinger/homostay_app.env.example`

**Implementation Details:**
- Add the `postgres` service, named volume, and healthcheck.
- Update `server/config/database.yml` so production can use env-driven host, port, username, password, and optionally `DATABASE_URL`, without breaking existing VPS behavior.
- Keep host-native deployment defaults documented and preserved.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml config | rg "postgres|healthcheck|volumes"`
- Expected: Postgres service, healthcheck, and persistent volume are present
- Run: `docker compose -f docker-compose.yml up -d postgres`
- Run: `docker compose -f docker-compose.yml exec postgres pg_isready -U postgres`
- Expected: Postgres reports ready

**Rollback Instructions:**
- Revert Compose and `server/config/database.yml` together if the env contract breaks either Compose or VPS deployment assumptions.

**Dependencies on Previous Tasks:** Task 5

---

### Task 7: Configure Redis As The Shared Runtime Service

**Objective:** Add the Redis service and align Rails/Sidekiq Redis configuration with env-driven host settings.

**Files to Modify:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`
- Modify: `server/config/cable.yml`
- Modify: `server/config/initializers/sidekiq.rb`
- Modify: `.env.example`

**Implementation Details:**
- Add the `redis` service with optional persistence volume and healthcheck.
- Keep `REDIS_URL` as the single runtime entrypoint for Rails, Sidekiq, and Action Cable.
- Ensure docs later distinguish between persistent Redis and optional ephemeral Redis strategies.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml up -d redis`
- Run: `docker compose -f docker-compose.yml exec redis redis-cli ping`
- Expected: `PONG`
- Run: `rg -n "REDIS_URL" server/config/cable.yml server/config/initializers/sidekiq.rb`
- Expected: both files use the same env variable contract

**Rollback Instructions:**
- Revert Redis-related Compose and config changes together if service URLs diverge.

**Dependencies on Previous Tasks:** Task 6

---

### Task 8: Finalize Sidekiq Service Runtime Contract

**Objective:** Ensure Sidekiq runs cleanly in Compose and remains compatible with existing VPS service management.

**Files to Modify:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`
- Modify: `deploy/hostinger/homostay_app_sidekiq.service`
- Modify: `deploy/hostinger/DEPLOYMENT_RUNBOOK.md`

**Implementation Details:**
- Tune `sidekiq` service command, restart behavior, dependency ordering, and env usage in Compose.
- Update Hostinger service/runbook docs to reflect the same env contract and runtime assumptions.
- Do not change job logic or queues; only runtime wiring.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml up --build -d redis postgres sidekiq`
- Run: `docker compose -f docker-compose.yml logs sidekiq --tail=50`
- Expected: Sidekiq boots without Redis or DB connection errors

**Rollback Instructions:**
- Revert Sidekiq service and Hostinger service doc updates together if the service no longer boots cleanly.

**Dependencies on Previous Tasks:** Task 7

---

### Task 9: Standardize Environment Variables Around One Source Of Truth

**Objective:** Create the authoritative env variable contract and align existing example files with it.

**Files to Modify:**
- Create: `.env.example`
- Create: `.env.production.example`
- Create: `.env.development.example`
- Create: `.env.test.example`
- Modify: `server/.env.example`
- Modify: `server/.env.production.example`
- Modify: `server/.env.development.example`
- Modify: `server/.env.test.example`
- Modify: `client/.env.development.example`
- Modify: `client/.env.production.example`
- Modify: `client/.env.test.example`
- Modify: `deploy/hostinger/homostay_app.env.example`
- Modify: `docker/compose/.env.compose.example`

**Implementation Details:**
- Create a root `.env.example` containing every required and optional variable with safe values or placeholders.
- Add version-controlled `*.example` files for production, development, and test workflows.
- Keep environment-specific example files only as convenience subsets or wrappers of the root contract.
- Preserve local development ergonomics and existing production behavior assumptions.
- Do not modify real `.env` files that may contain operator-local credentials.

**Verification Steps:**
- Run: `comm -23 <(rg '^[A-Z0-9_]+=' -h .env.example .env.production.example .env.development.example .env.test.example server/.env.example server/.env.production.example server/.env.development.example server/.env.test.example client/.env.development.example client/.env.production.example client/.env.test.example deploy/hostinger/homostay_app.env.example docker/compose/.env.compose.example | cut -d= -f1 | sort -u) <(printf '')`
- Expected: variable inventory can be reviewed from a unified source
- Run: `rg -n "VITE_|REDIS_URL|BACKEND_URL|FRONTEND_URL|SECRET_KEY_BASE|HOMOSTAY_APP_DATABASE_PASSWORD" .env.example .env.*.example server client deploy docker`
- Expected: core variables are consistently represented

**Rollback Instructions:**
- Revert all env example changes together if any environment loses required configuration context.

**Dependencies on Previous Tasks:** Task 8

---

### Task 10: Perform Non-Destructive Secret Hygiene Cleanup

**Objective:** Remove committed sensitive values from repo-managed example env files and harden ignore rules without breaking documented setup paths.

**Files to Modify:**
- Modify: `.gitignore`
- Modify: `server/.env.example`
- Modify: `server/.env.production.example`
- Modify: `client/.env.production.example`
- Modify: `README_DEPLOYMENT_HOSTINGER.md`
- Modify: `SETUP_GUIDE.md`
- Modify: `env_run.md`

**Implementation Details:**
- Replace real-looking tokens, passwords, email credentials, and IDs in version-controlled example files with placeholders or clear example values.
- Add ignore rules for local override files that should not be committed.
- Update docs so local and production operators know where real values belong after the cleanup.
- Leave actual local `.env` files untouched.

**Verification Steps:**
- Run: `rg -n "(EAA|token|secret|password|gmail|TWILIO|WHATSAPP_ACCESS_TOKEN)" server/.env.example server/.env.production.example client/.env.production.example README_DEPLOYMENT_HOSTINGER.md SETUP_GUIDE.md env_run.md`
- Expected: only placeholders, examples, or documentation references remain
- Run: `git diff -- .gitignore server/.env.example server/.env.production.example client/.env.production.example`
- Expected: secret-bearing literals are removed and ignore rules are clearer

**Rollback Instructions:**
- Revert only if required placeholders accidentally remove necessary variable names or documented setup flow.

**Dependencies on Previous Tasks:** Task 9

---

### Task 11: Define Persistent Volume Strategy And Active Storage Mounting

**Objective:** Wire persistent data paths into Compose and document exactly what is persistent vs ephemeral.

**Files to Modify:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`
- Modify: `server/config/storage.yml`
- Modify: `server/config/environments/production.rb`

**Implementation Details:**
- Add named volumes for PostgreSQL, Redis persistence if enabled, and Rails storage.
- Mount `server/storage` as a named Docker volume for the Rails container.
- Confirm production Active Storage continues using local disk storage.
- Ensure container mount points line up with Rails disk storage paths and documented backup domains.
- Keep containers stateless outside named volumes.
- Do not bake Active Storage files into the image.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml config | rg "volumes:|storage|postgres|redis"`
- Expected: named volumes are attached to the intended services
- Run: `docker compose -f docker-compose.yml up -d rails`
- Run: `docker compose -f docker-compose.yml exec rails ./bin/rails runner 'puts ActiveStorage::Blob.service.root'`
- Expected: printed storage root matches the mounted persistent path
- Run: `docker compose -f docker-compose.yml exec rails sh -lc 'mount | grep storage || true'`
- Expected: the Rails storage path is backed by a mounted named volume, not image-only filesystem state

**Rollback Instructions:**
- Revert volume and storage-path edits together if Active Storage no longer points at local disk.

**Dependencies on Previous Tasks:** Task 10

---

### Task 12: Add Health Checks And Startup Wait Behavior

**Objective:** Ensure services wait for PostgreSQL and expose reliable health checks for Compose and future platforms.

**Files to Modify:**
- Create: `scripts/wait-for-postgres.sh`
- Modify: `server/bin/docker-entrypoint`
- Modify: `docker-compose.yml`
- Modify: `docker-compose.production.yml`

**Implementation Details:**
- Add a reusable wait helper for PostgreSQL readiness.
- Update the entrypoint so Rails setup/startup behaves predictably in containers.
- Add service healthchecks for Postgres, Redis, Rails, and optionally Nginx where useful.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml up --build -d`
- Run: `docker compose -f docker-compose.yml ps`
- Expected: services transition to healthy or running after dependencies are ready
- Run: `curl -fsS http://localhost:3000/up`
- Expected: success response from the Rails health endpoint when the web port is exposed locally

**Rollback Instructions:**
- Revert wait-script and healthcheck changes together if startup ordering becomes less reliable.

**Dependencies on Previous Tasks:** Task 11

---

### Task 13: Add Production Startup And Operator Helper Scripts

**Objective:** Provide predictable helper scripts for build, up, down, logs, console, DB setup, and reset without replacing existing VPS workflows.

**Files to Modify:**
- Create: `scripts/docker-build.sh`
- Create: `scripts/docker-up.sh`
- Create: `scripts/docker-down.sh`
- Create: `scripts/docker-logs.sh`
- Create: `scripts/docker-rails-console.sh`
- Create: `scripts/docker-db-setup.sh`
- Create: `scripts/docker-reset.sh`
- Modify: `package.json`

**Implementation Details:**
- Add small Bash wrappers around the canonical Compose commands.
- Keep them explicit, composable, and non-provider-specific.
- Optionally expose a minimal top-level npm script alias only if it improves discoverability without confusing the Rails-side workflow.

**Verification Steps:**
- Run: `bash scripts/docker-build.sh`
- Expected: build wrapper succeeds
- Run: `bash scripts/docker-up.sh`
- Expected: stack starts
- Run: `bash scripts/docker-logs.sh`
- Expected: logs stream without script errors

**Rollback Instructions:**
- Remove helper scripts and revert `package.json` if wrappers add confusion rather than clarity.

**Dependencies on Previous Tasks:** Task 12

---

### Task 14: Add Production-Focused CI Validation

**Objective:** Create CI that validates dependencies, tests, production builds, Docker image builds, Compose config, and Rails boot.

**Files to Modify:**
- Create: `.github/workflows/ci.yml`
- Modify: `server/README.md`
- Modify: `client/README.md`

**Implementation Details:**
- Add a GitHub Actions workflow that installs Ruby and Node dependencies, runs existing backend/frontend checks, builds the production frontend, builds the Docker image, validates Compose files, and boots Rails in a production-like environment.
- Keep CI provider-neutral and do not add deploy steps.

**Verification Steps:**
- Run: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml")'`
- Expected: workflow YAML parses
- Run: `docker compose -f docker-compose.yml config >/dev/null`
- Expected: same command used in CI passes locally
- Run: `cd client && npm test`
- Expected: frontend tests pass

**Rollback Instructions:**
- Revert the workflow if it blocks merges without validating the intended infrastructure contract.

**Dependencies on Previous Tasks:** Task 13

---

### Task 15: Scaffold The Backup Framework Across Three Independent Domains

**Objective:** Create backup helper entrypoints for PostgreSQL, Active Storage, and infrastructure/configuration as separate domains.

**Files to Modify:**
- Create: `scripts/backup/postgres-backup.sh`
- Create: `scripts/backup/storage-backup.sh`
- Create: `scripts/backup/config-backup.sh`
- Modify: `deploy/hostinger/backup_homostay_postgres.sh`

**Implementation Details:**
- Build separate backup helpers for database, file storage, and config artifacts.
- Keep the existing Hostinger backup script compatible while aligning it with the new structure.
- Avoid coupling the domains in one all-or-nothing script.

**Verification Steps:**
- Run: `bash scripts/backup/postgres-backup.sh --help || true`
- Run: `bash scripts/backup/storage-backup.sh --help || true`
- Run: `bash scripts/backup/config-backup.sh --help || true`
- Expected: each script exposes an independent entrypoint or usage output

**Rollback Instructions:**
- Revert new backup scaffolding if domain boundaries are unclear or conflict with existing operational scripts.

**Dependencies on Previous Tasks:** Task 14

---

### Task 16: Add Restore Helpers And Manual Restore Verification Entry Point

**Objective:** Create restore entrypoints and a manual restore verification helper designed for future CI reuse.

**Files to Modify:**
- Create: `scripts/restore/postgres-restore.sh`
- Create: `scripts/restore/storage-restore.sh`
- Create: `scripts/restore/config-restore-checklist.sh`
- Create: `scripts/restore/manual-restore-verify.sh`

**Implementation Details:**
- Provide separate restore helpers for each backup domain.
- Add a manual verification script that can later be invoked from CI without redesign.
- Keep success/failure behavior scriptable and deterministic.

**Verification Steps:**
- Run: `bash scripts/restore/manual-restore-verify.sh --help || true`
- Expected: verification entrypoint exists and documents its usage
- Run: `find scripts/restore -maxdepth 1 -type f | sort`
- Expected: separate restore helpers exist for DB, storage, config, and verification

**Rollback Instructions:**
- Revert the restore helpers together if they imply coupled restores or cannot be automated later.

**Dependencies on Previous Tasks:** Task 15

---

### Task 17: Write Architecture, Secrets, Backup, Restore, Docker, Deployment, And Troubleshooting Docs

**Objective:** Make the infrastructure understandable to a new engineer and consistent with the Compose-first architecture.

**Files to Modify:**
- Create: `ARCHITECTURE.md`
- Create: `DOCKER.md`
- Create: `DEPLOYMENT.md`
- Create: `TROUBLESHOOTING.md`
- Create: `BACKUP.md`
- Create: `RESTORE.md`
- Create: `SECRETS.md`
- Modify: `README_DEPLOYMENT_HOSTINGER.md`
- Modify: `SETUP_GUIDE.md`
- Modify: `env_run.md`

**Implementation Details:**
- Document the canonical architecture, provider mappings, volume strategy, environment-variable reference, persistent vs ephemeral paths, backup domains, disaster recovery workflows, and migration paths.
- Explicitly document deferred non-goals and rejected alternatives.
- Include the secret rotation plan in `SECRETS.md` or a dedicated section linked from it.

**Verification Steps:**
- Run: `rg -n "Docker Compose|Active Storage|PostgreSQL|Redis|Sidekiq|Nginx|Disaster Recovery|Cloudflare R2|Kubernetes|Railway" ARCHITECTURE.md DOCKER.md DEPLOYMENT.md TROUBLESHOOTING.md BACKUP.md RESTORE.md SECRETS.md`
- Expected: key architecture and migration topics are covered
- Run: `rg -n "SECRET_KEY_BASE|REDIS_URL|HOMOSTAY_APP_DATABASE_PASSWORD|WHATSAPP|ICAL_DOMAIN" SECRETS.md`
- Expected: all required runtime variables are documented

**Rollback Instructions:**
- Revert only if docs materially contradict the implemented architecture; otherwise fix in place.

**Dependencies on Previous Tasks:** Task 16

---

### Task 18: Run Full Deployment Verification Against The Compose Reference Stack

**Objective:** Verify the completed infrastructure end-to-end before any final handoff or implementation completion claim.

**Files to Modify:**
- Modify: `DOCKER.md`
- Modify: `DEPLOYMENT.md`
- Modify: `TROUBLESHOOTING.md`

**Implementation Details:**
- Run the final local verification matrix against the Compose stack.
- Capture any gaps discovered in docs or helper scripts and fix them before closeout.
- Verify that the repo remains compatible with traditional VPS documentation after the Docker additions.

**Verification Steps:**
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d`
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml ps`
- Expected: `nginx`, `rails`, `sidekiq`, `postgres`, and `redis` are up with healthy dependencies where defined
- Run: `curl -fsS http://localhost/up`
- Expected: health endpoint succeeds through Nginx
- Run: `curl -I http://localhost/`
- Expected: homepage is served through Nginx
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml logs rails --tail=100`
- Expected: Rails booted without dependency or asset errors
- Run: `docker compose -f docker-compose.yml -f docker-compose.production.yml logs sidekiq --tail=100`
- Expected: Sidekiq booted without dependency errors

**Rollback Instructions:**
- If final verification fails, revert only the last failing task first; if the failure is architectural, roll back to the last known good task boundary rather than partially editing unrelated tasks.

**Dependencies on Previous Tasks:** Task 17

---

## Spec Coverage Check

- Docker foundation: Tasks 2, 4
- Multi-stage Rails production image: Task 3
- Docker Compose stack: Tasks 2, 4, 18
- Nginx reverse proxy: Task 5
- PostgreSQL service: Task 6
- Redis service: Task 7
- Sidekiq service: Task 8
- Environment variable standardization: Task 9
- Secret hygiene: Task 10
- Persistent volume strategy: Task 11
- Active Storage volume configuration: Task 11
- Health checks: Task 12
- Production startup scripts: Task 13
- CI improvements: Task 14
- Backup framework scaffolding: Task 15
- Manual restore verification helper: Task 16
- Documentation: Task 17
- Deployment verification: Task 18

No approved design requirement is left without a corresponding task.

## Placeholder Scan

- No `TODO`, `TBD`, or deferred implementation placeholders remain in the task list.
- Every task contains explicit files, implementation details, verification steps, rollback guidance, and dependencies.

## Order Check

The task order matches the required implementation sequence:

1. Docker foundation
2. Multi-stage Rails production image
3. Docker Compose stack
4. Nginx reverse proxy
5. PostgreSQL service
6. Redis service
7. Sidekiq service
8. Environment variable standardization
9. Secret hygiene
10. Persistent volume strategy
11. Active Storage volume configuration
12. Health checks
13. Production startup scripts
14. CI improvements
15. Backup framework scaffolding
16. Manual restore verification helper
17. Documentation
18. Deployment verification

## Notes For Implementation

- Use test-driven changes whenever application-adjacent code or configuration behavior is modified.
- Keep commits small and aligned to task boundaries.
- Do not touch `homostay_app_production.dump`; it is unrelated to the planned infrastructure work.
- If a task exposes an undocumented runtime dependency, update the relevant docs in the same task rather than deferring the explanation.
