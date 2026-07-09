# Sacred Homes Production Infrastructure Design

Date: 2026-07-09
Status: Draft for review
Scope: Infrastructure only

## Summary

Sacred Homes is a production full-stack application with a React + Vite frontend in `client/` and a Rails backend in `server/`. Today, the app runs successfully on a VPS with Rails, Puma, PostgreSQL, Redis, Sidekiq, Nginx, cron-driven calendar sync, local-disk Active Storage, and deployment helper scripts. The productionization work in this phase must preserve those behaviors while making the repository portable and easier to operate across VPS hosting, Docker Compose, Railway-style platforms, and future Kubernetes deployments.

The canonical production reference architecture will be Docker Compose with independently replaceable `nginx`, `rails`, `sidekiq`, `postgres`, and `redis` services. The Rails image will stay provider-agnostic and expose Puma on `PORT` without assuming Nginx, Compose, Hostinger, Railway, or any other hosting environment. Active Storage will remain on local disk. Backups will be designed around three independent domains: PostgreSQL, Active Storage, and infrastructure/configuration. Secret hygiene will be improved in-repo without rotating production credentials or changing live infrastructure.

## Goals

- Productionize the repository without changing business logic.
- Make Docker Compose the canonical production reference architecture.
- Preserve the current app behavior, including local-disk Active Storage.
- Ensure each runtime service is independently replaceable.
- Create one documented environment-variable contract for all environments.
- Add non-destructive repository-level secret hygiene improvements.
- Add a backup/restore framework with manual restore verification and future CI compatibility.
- Add production-grade CI that validates code, builds, Docker, and Compose.
- Produce infrastructure documentation that explains both decisions and rationale.

## Non-Goals

The following are explicitly deferred from this phase:

- Cloud object storage migration
- CDN setup
- Multi-region deployment
- High availability
- Autoscaling
- Blue/Green deployments
- Kubernetes manifests
- Production secret rotation
- Live infrastructure modification
- Business logic changes in controllers, models, jobs, routes, booking flow, WhatsApp behavior, or calendar sync behavior

## Current-State Findings

The repository currently reflects these production assumptions:

- Frontend assets are built with Vite and published into `server/public/`.
- Rails serves the published SPA outside development.
- Production background jobs run through Sidekiq backed by Redis.
- Active Storage uses disk storage in production.
- Hostinger/VPS deployment guides already exist and reflect a host-native topology of Nginx + Puma + PostgreSQL + Redis + Sidekiq.
- Cron is used for calendar sync job enqueueing and PostgreSQL backups.
- Secret-bearing values are currently committed in repository env files and must be replaced with placeholders.

These findings make it important to preserve the existing runtime shape rather than introduce a new application architecture.

## Canonical Reference Architecture

Docker Compose is the canonical production reference architecture. All deployment documentation for Hostinger VPS, Railway, DigitalOcean, AWS, and future Kubernetes environments will describe how those targets map onto the same service boundaries rather than describe separate architectures.

### Reference Topology

```text
Internet
  -> nginx
     -> rails (Puma on PORT)
        -> postgres
        -> redis
     -> sidekiq
        -> postgres
        -> redis
```

### Service Responsibilities

- `nginx`
  - Public HTTP entrypoint in the reference deployment
  - Reverse proxies to Rails by container/service name
  - Serves as the location for HTTP buffering, asset caching headers, and upstream proxy config
- `rails`
  - Runs Puma only
  - Exposes `PORT`
  - Serves the published frontend and API
  - Talks to PostgreSQL, Redis, and local-disk Active Storage
- `sidekiq`
  - Runs background jobs from the same application image as Rails
  - Uses PostgreSQL and Redis
- `postgres`
  - Primary relational datastore
- `redis`
  - Queue backend and Redis-backed runtime support

### Why This Architecture

- It matches the current proven production shape.
- It keeps the app portable across VPS, managed platforms, and future orchestration.
- It makes dependencies explicit and independently replaceable.
- It avoids coupling the Rails image to a reverse proxy or a provider-specific runtime.

### Rejected Alternatives

- Separate architecture per hosting provider
  - Rejected because it creates operational drift and documentation divergence.
- Embedding Nginx inside the Rails image
  - Rejected because it reduces portability and couples unrelated concerns.
- Splitting the frontend into a separate runtime architecture
  - Rejected because the app already relies on Rails serving published frontend assets outside development.
- Separate web and worker application images
  - Rejected for this phase because one shared production image reduces drift and simplifies CI, deployment, and maintenance.

## Container Independence

Each service must be independently replaceable.

The Rails image must not assume:

- Nginx
- Docker Compose
- Hostinger
- Railway
- Kubernetes

The Rails image contract is:

- it starts Puma
- it binds `PORT`
- it reads environment variables
- it can reach PostgreSQL and Redis over the network
- it can read/write a mounted storage path for Active Storage

This contract allows:

- Compose on a VPS
- host-native service management with systemd
- provider-specific service wiring on Railway or similar platforms
- future deployment behind ingress controllers or load balancers

## Docker And Build Layout

One production application image will be used for both `rails` and `sidekiq`.

### Planned Build Strategy

- Multi-stage Docker build
- Ruby and Node dependency caching optimized for repeated builds
- Frontend compiled during the image build
- Published frontend assets copied into the Rails public directory inside the final image
- Final runtime image contains only runtime dependencies, built assets, and the application code needed to execute

### Runtime Requirements

The final image must support:

- Puma
- PostgreSQL client tools needed for runtime and operational helpers
- Redis connectivity
- Sidekiq execution
- Active Storage local disk usage
- image processing via `libvips`

### Why One App Image

- Prevents drift between web and worker artifacts
- Keeps deployable units simple
- Makes future orchestration easier because runtime role is command-driven, not image-driven

## Volume And Persistence Strategy

The design explicitly distinguishes persistent volumes from ephemeral container state.

### Persistent Volumes

- PostgreSQL data
- Redis data if persistence is enabled in the reference deployment
- Active Storage local disk files
- optional retained logs only if log persistence is intentionally configured
- optional backup output directory when helper scripts write archives locally

### Ephemeral Container State

- PID files
- temp files
- caches
- app filesystem outside mounted persistent paths
- runtime process state

### Persistent Paths To Document

- PostgreSQL data directory in the `postgres` container
- Redis data directory in the `redis` container when persistence is enabled
- Active Storage path used by Rails disk storage
- optional backup export path

### Why This Matters

- Containers can be recreated safely without losing state.
- Backup scope becomes explicit and auditable.
- Future migrations to managed services or object storage become easier.

## Configuration Strategy

There will be a single environment-variable specification as the documented source of truth.

### Source-of-Truth Artifacts

- root `.env.example`
- `SECRETS.md`
- environment variable reference section in deployment documentation

### Rules

- Every required variable must be documented once with purpose, consumers, and configuration location.
- Service-specific example files may exist only as convenience derivatives, not competing sources of truth.
- Local development convenience must be preserved where possible.
- Production behavior must not depend on committed secret-bearing env files.

### Configuration Surfaces

- Docker Compose env files and overrides
- host-native environment files such as systemd `EnvironmentFile`
- provider-managed secret stores in future platforms

## Secret Hygiene Strategy

This phase includes non-destructive repository-level secret hygiene improvements.

### In Scope

- Audit for committed secrets, tokens, credentials, and sensitive configuration
- Replace committed real values with placeholders or safe examples
- Update `.gitignore` to reduce accidental secret commits
- Add or update example env files
- Document all required variables and where they belong
- Create a post-change secret rotation plan

### Out of Scope

- Rotating live secrets
- Generating production credentials
- Editing live provider configuration

### Secret Documentation Deliverables

- `SECRETS.md`
  - variable name
  - purpose
  - required/optional status
  - configuration location
  - consuming service(s)
- secret rotation plan
  - which secrets should be rotated after the repository changes land
  - why they should be rotated
  - operational order of rotation

## Backup Framework Design

The application is treated as three independent backup domains.

### Domain 1: PostgreSQL

Contents:

- application relational data
- Active Storage metadata tables
- Sidekiq-related application data stored in PostgreSQL

Restore characteristic:

- independently restorable
- does not automatically require restoring files from Active Storage

### Domain 2: Active Storage

Contents:

- locally stored uploaded files
- image and document assets managed through Rails disk storage

Restore characteristic:

- independently restorable
- may require verification against database metadata after restore

### Domain 3: Infrastructure / Configuration

Contents:

- env examples and env contracts
- Compose files
- deployment scripts
- backup/restore scripts
- Nginx configuration
- operational docs
- optional host-specific config templates

Restore characteristic:

- independently recoverable from version control plus operator-managed secret sources

### Backup Principles

- Each domain has an explicit backup procedure.
- Each domain has an explicit restore procedure.
- Combined restore procedures are documented only for scenarios that require them.
- A bad deployment should not force a data restore.
- A database restore should not overwrite file storage unless explicitly intended.

## Restore Verification Design

The backup framework will be designed from day one to support automated restore verification, but only a manual restore verification helper will be implemented in this phase.

### Initial Implementation

- Manual helper to verify a restore in an isolated environment
- Documented verification flow and expected checks
- Shared command boundaries that a future CI job can invoke unchanged

### Future-Compatible Design

The manual restore verification path should be callable later by CI with minimal or no redesign. That means:

- stable script entrypoints
- machine-readable success/failure behavior
- isolated testable restore workflow
- clear dependency boundaries between backup domains

CI-based restore smoke testing is explicitly deferred from this phase.

## Disaster Recovery Design

The documentation will include a disaster recovery section describing recovery workflows for these scenarios.

### Server Loss

Recovery workflow:

- provision a new runtime host or environment
- restore infrastructure/configuration from version control and env source of truth
- recreate persistent volumes or managed data services
- restore PostgreSQL and Active Storage as needed
- boot services and run verification checks

### Disk Corruption

Recovery workflow:

- identify affected persistent domain(s)
- replace or recreate damaged storage
- restore only the affected domain when possible
- verify app boot and domain integrity

### Accidental Deletion

Recovery workflow:

- identify whether deletion affected database records, file storage, or config
- restore the affected domain from the latest safe backup
- run focused verification before broader service restart if possible

### Bad Deployment

Recovery workflow:

- roll back image/config first
- restore data only if the deployment damaged persistent state
- verify app boot, API behavior, and worker health

### Database Corruption

Recovery workflow:

- restore PostgreSQL independently
- verify schema, critical records, and Active Storage metadata consistency
- verify app boot and key API flows

## Migration Strategy

This phase should make future migrations straightforward without implementing them now.

### Planned Future Migrations

- Local disk Active Storage -> Cloudflare R2 or another object store
- Docker Compose -> Kubernetes
- VPS -> Railway or another managed platform
- containerized PostgreSQL -> managed PostgreSQL

### Design Choices That Enable Those Migrations

- Rails image does not depend on Nginx or Compose
- persistent domains are explicit
- env contract is centralized
- backup domains are independent
- documentation is architecture-driven rather than provider-driven

## CI Design

CI will validate the infrastructure and application packaging without introducing provider lock-in.

### CI Responsibilities

- install backend dependencies
- install frontend dependencies
- run existing tests
- validate production frontend build
- validate Rails production boot
- validate Docker image build
- validate Compose configuration
- validate service command assumptions for web and worker roles

### CI Boundaries

CI in this phase will not:

- deploy to production
- run provider-specific infrastructure provisioning
- perform restore smoke tests yet
- manage live secrets

## Verification Strategy

Implementation success will be verified through evidence, not assumption.

### Required Verification Areas

- repository tests
- frontend production build
- Rails production boot
- Docker image build
- Compose validation
- Compose-based service boot with PostgreSQL and Redis
- documentation completeness for env vars, backups, and deployment targets

### Manual Operational Verification Targets

- homepage
- blogs
- homestays
- booking flow
- admin login page
- health endpoint
- API endpoints
- responsive rendering

These can later be automated further, but the design preserves those verification goals now.

## Documentation Deliverables

Infrastructure documentation is part of the deliverable, not a follow-up.

Planned documents:

- `ARCHITECTURE.md`
- `DOCKER.md`
- `DEPLOYMENT.md`
- `TROUBLESHOOTING.md`
- `BACKUP.md`
- `RESTORE.md`
- `SECRETS.md`

Each document should explain:

- what was chosen
- why it was chosen
- which alternatives were rejected when relevant
- what remains deferred

## Risks And Mitigations

- Risk: secret cleanup may break undocumented local workflows
  - Mitigation: replace with placeholders carefully, preserve examples, and document every variable before removing real values
- Risk: Dockerizing may diverge from current VPS behavior
  - Mitigation: preserve current service boundaries and published frontend model
- Risk: backup scripts may accidentally imply coupled restores
  - Mitigation: design around explicit backup domains and document independent restores
- Risk: provider-specific assumptions may leak into configs
  - Mitigation: keep Compose canonical and provider mappings secondary in docs

## Implementation Boundaries

This design intentionally keeps infrastructure work separate from application behavior changes. No controller, model, job, route, booking, WhatsApp, or calendar sync business logic should be modified except where infrastructure compatibility requires non-behavioral configuration changes accompanied by tests.

## Planning Readiness

This design is intentionally scoped for one implementation plan covering:

- Docker and Compose artifacts
- env/secrets documentation and hygiene
- backup/restore scaffolding
- CI setup
- infrastructure documentation
- verification steps

It does not require decomposition into separate architecture projects before planning, and is ready to move into implementation planning after user review and approval.
