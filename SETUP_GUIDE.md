# Setup Guide

This guide is based only on the current repository contents for the Homestay App.

## 1. What This Repo Contains

- `client/` -> React 18 + Vite 6 frontend
- `server/` -> Ruby on Rails backend that also serves the SPA outside development
- `scripts/` -> helper scripts for publishing the frontend into Rails and preparing the test environment

## 2. Versions Confirmed From The Repo

### Backend

- Ruby: `3.3.10`
  - From `server/.ruby-version`
  - Also locked in `server/Gemfile.lock`
- Bundler: `2.7.2`
  - From `server/Gemfile.lock`
- Rails: `7.2.3`
  - Locked in `server/Gemfile.lock`
- Puma: `6.6.1`
  - Locked in `server/Gemfile.lock`
- PostgreSQL gem: `pg 1.6.3`
  - Locked in `server/Gemfile.lock`

### Frontend

- React: `18.3.1`
  - From `client/package.json`
- Vite: `6.4.1`
  - From `client/package.json`
- `@vitejs/plugin-react`: `5.1.4`
  - From `client/package.json`

### Node.js

The repo does not pin Node with a root `.nvmrc`, `.node-version`, `engines` field, or `.tool-versions`.

What the lockfile does confirm:

- `vite@6.4.1` supports `^18.0.0 || ^20.0.0 || >=22.0.0`
- `@vitejs/plugin-react@5.1.4` requires `^20.19.0 || >=22.12.0`

Safe repo-based recommendation:

- Use Node `20.19.0` or newer compatible release

## 3. Services Used

- Database: PostgreSQL
  - From `server/config/database.yml`
- Redis:
  - present in `server/Gemfile`
  - used by Action Cable in production via `server/config/cable.yml`
  - Sidekiq systemd example exists in `server/config/systemd/sidekiq.service.example`
- Sidekiq:
  - gem is present
  - mounted at `/sidekiq` in `server/config/routes.rb`
  - systemd example exists
  - note: the repo does not explicitly set `config.active_job.queue_adapter = :sidekiq`
- Active Storage:
  - local disk storage in development/production
  - test disk storage in test

## 4. Folder Structure

```text
homostay_app/
├── client/                  # React + Vite app
├── server/                  # Rails app
│   ├── app/
│   ├── config/
│   ├── db/
│   └── public/              # Rails-served published frontend in test/production
├── scripts/
│   ├── publish_frontend.sh
│   ├── build_test.sh
│   ├── prepare_test_env.sh
│   └── restore_test_db_from_dev.sh
├── env_run.md               # env/runbook for dev, test, and production flows
└── README_DEPLOYMENT_HOSTINGER.md
```

## 5. Environment Files In This Repo

There is no root `.env` file in the repo.

Environment files are used in these locations:

- `server/.env`
- `server/.env.development`
- `server/.env.test`
- `server/.env.production`
- `client/.env.development`
- `client/.env.test`
- `client/.env.production`

### Important production note

`dotenv-rails` is only included in the `development, test` group in `server/Gemfile`.

That means:

- `server/.env`, `server/.env.development`, and `server/.env.test` are useful for local/dev/test
- `server/.env.production` is not auto-loaded by Rails production in the current repo
- for production deployment, set the same values in the real process environment instead

## 6. Environment Variables Detected In Code

### Server variables

Used directly by application code or Rails config:

- `BACKEND_URL`
- `FRONTEND_URL`
- `NGROK_URL`
- `HOMOSTAY_APP_DATABASE_PASSWORD`
- `RAILS_MAX_THREADS`
- `RAILS_MIN_THREADS`
- `WEB_CONCURRENCY`
- `PORT`
- `PIDFILE`
- `RAILS_LOG_LEVEL`
- `RAILS_SERVE_STATIC_FILES`
- `REDIS_URL`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `ADMIN_WHATSAPP_NUMBER`
- `ICAL_DOMAIN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Only present in commented code or comments, not required by current running config:

- `GMAIL_USERNAME`
- `GMAIL_APP_PASSWORD`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`

### Client variables

- `VITE_API_BASE_URL`

## 7. How Frontend And Backend Communicate

### Local development

- Rails runs on `http://localhost:3000`
- Vite runs on `http://localhost:5173`
- the browser talks to the Vite app origin
- Vite proxies these routes to Rails:
  - `/api`
  - `/admin/api`
  - `/admin/sign_in`
  - `/admin/sign_out`
  - `/admin/password`

So in development the request flow is:

```text
Browser -> http://localhost:5173 -> Vite proxy -> http://localhost:3000
```

### Test / published / production flow

- the frontend is built into `client/build`
- `scripts/publish_frontend.sh` copies the build into `server/public`
- outside development, Rails serves:
  - `server/public/index.html`
  - `/vite/*` for compiled bundles
  - `/assets/*` for static public files

So outside development the request flow is:

```text
Browser -> Rails/Nginx origin -> Rails app + Rails-served published frontend
```

## 8. Local Setup

## 8.1 Prerequisites

Install these before running the app:

- Ruby `3.3.10`
- Bundler `2.7.2`
- Node `20.19.0` or another release compatible with the locked frontend toolchain
- PostgreSQL

Linux packages implied by the repo:

- `build-essential`
- `libpq-dev`
- `libvips`
- PostgreSQL server/client packages

Why these show up in the repo:

- `pg` gem needs PostgreSQL headers/libs
- `image_processing` uses `libvips`
- the Dockerfile installs `build-essential`, `libpq-dev`, and `libvips`

## 8.2 Clone The Repo

```bash
git clone <YOUR_REPO_URL> ~/homostay_app
cd ~/homostay_app
```

## 8.3 Backend Setup

If you use `rbenv`, the repo already gives you the exact Ruby version:

```bash
cd ~/homostay_app/server
rbenv install -s "$(cat .ruby-version)"
rbenv local "$(cat .ruby-version)"
gem install bundler -v 2.7.2
bundle _2.7.2_ install
bin/rails db:prepare
bin/rails db:seed
```

What this does:

- installs Ruby `3.3.10`
- installs gems from `server/Gemfile.lock`
- creates/prepares the development database
- loads seed data, including the seeded admin user and demo content

Database names from `server/config/database.yml`:

- development: `homostay_app_development`
- test: `homostay_app_test`
- production: `homostay_app_production`

## 8.4 Frontend Setup

From the frontend folder:

```bash
cd ~/homostay_app/client
npm install
```

## 8.5 Environment Setup For Local Development

Files already present in the repo:

- `server/.env.development`
- `client/.env.development`

Current values in those files point local development to:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`

For day-to-day local work:

- keep `server/.env.development` aligned with the Rails URL
- keep `client/.env.development` aligned with the backend URL reference file

Notes:

- the frontend code uses `window.location.origin` in development mode, so Vite proxying is the real dev connection path
- `server/.env` contains external-service variables; they are not required just to boot the app locally
- the WhatsApp service safely skips sends if required WhatsApp vars are missing

## 8.6 Run The App Locally

Open terminal 1:

```bash
cd ~/homostay_app/server
bin/rails s
```

Open terminal 2:

```bash
cd ~/homostay_app/client
npm run dev
```

Use:

- frontend: `http://localhost:5173`
- backend health check: `http://localhost:3000/up`

## 9. Published Frontend Build Flow

The repo does not use the default Vite `dist/` output.

Actual build flow:

1. `client/vite.config.ts` builds into `client/build`
2. compiled bundles go under `client/build/vite`
3. `scripts/publish_frontend.sh` removes old published files from `server/public`
4. the same script copies the new build into `server/public`

Exact publish commands:

```bash
cd ~/homostay_app
./scripts/publish_frontend.sh production
```

Test publish:

```bash
cd ~/homostay_app
./scripts/publish_frontend.sh test
```

Convenience script from repo root:

```bash
cd ~/homostay_app
npm run publish:frontend
```

## 10. Test / ngrok Flow

If you need the Rails-served test build instead of normal dev mode, use the project runbook:

- `env_run.md`

That file explains:

- development workflow
- test workflow with ngrok
- production environment flow

Exact test preparation command from this repo:

```bash
cd ~/homostay_app
./scripts/prepare_test_env.sh
```

What it does:

- copies the development database into the isolated test database
- publishes the frontend into `server/public`

Then run:

```bash
cd ~/homostay_app/server
bin/rails s -e test
```

## 11. Handy Commands

Backend install and setup:

```bash
cd ~/homostay_app/server
bundle _2.7.2_ install
bin/rails db:prepare
bin/rails db:seed
```

Frontend install:

```bash
cd ~/homostay_app/client
npm install
```

Run backend:

```bash
cd ~/homostay_app/server
bin/rails s
```

Run frontend:

```bash
cd ~/homostay_app/client
npm run dev
```

Publish frontend into Rails public folder:

```bash
cd ~/homostay_app
./scripts/publish_frontend.sh production
```

Prepare test environment:

```bash
cd ~/homostay_app
./scripts/prepare_test_env.sh
```

## 12. Common Errors And What They Usually Mean

### `VITE_API_BASE_URL is not configured`

Usually means the frontend is running in a non-development mode without a usable `VITE_API_BASE_URL`.

Check:

- `client/.env.test`
- `client/.env.production`

### `Vite dev server is unavailable. Start it with npm run dev.`

This message is returned by `SpaController` in development when Rails tries to load Vite assets but the Vite server is not running.

Start:

```bash
cd ~/homostay_app/client
npm run dev
```

### PostgreSQL database does not exist / connection errors

Run:

```bash
cd ~/homostay_app/server
bin/rails db:prepare
```

### Built frontend changes are not showing in Rails-served mode

Republish the frontend:

```bash
cd ~/homostay_app
./scripts/publish_frontend.sh production
```

or for test mode:

```bash
cd ~/homostay_app
./scripts/prepare_test_env.sh
```

### Redis-related production issues

Redis matters for:

- Action Cable production config
- the provided Sidekiq production service example

Local development does not explicitly configure Redis as the Active Job adapter in the current repo.

## 13. Deployment

For Hostinger VPS deployment, use:

- `README_DEPLOYMENT_HOSTINGER.md`
