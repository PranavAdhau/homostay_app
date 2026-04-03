# Environment Run Guide

This file is the exact runbook for this project in all 3 environments:

- `development` -> local React + Rails workflow
- `test` -> Rails test mode + built frontend + ngrok
- `production` -> future VPS deployment flow

It also lists the values you must change after VPS hosting is ready.

## How API Base URL Works

The frontend resolves API URLs by environment:

- `development` -> always `http://localhost:3000`
- `test` -> uses `window.location.origin` by default, so the current ngrok domain is picked up automatically
- `test` optional override -> if you explicitly set `VITE_API_BASE_URL`, test mode can use that instead
- `production` -> uses `VITE_API_BASE_URL`

This means:

- dev works without ngrok
- test works without editing frontend env files every time ngrok changes
- production uses the final deployed domain from env

## 1. Development

Use this when you are building features locally.

### Files used

- `server/.env`
- `server/.env.development`
- `client/.env.development`

### Expected URLs

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Start backend

Open terminal 1:

```bash
cd /home/pranav/homostay_app/server
bin/rails s
```

### Start frontend

Open terminal 2:

```bash
cd /home/pranav/homostay_app/client
npm run dev
```

### How development works

- Rails runs on `localhost:3000`
- Vite runs on `localhost:5173`
- Frontend API calls automatically resolve to `http://localhost:3000` in development mode
- No ngrok is needed
- Do not run a frontend build during normal development

### If you change backend gems or database

Run from `server/`:

```bash
bundle install
bin/rails db:migrate
```

### If you change frontend packages

Run from `client/`:

```bash
npm install
```

## 2. Test Environment with ngrok

Use this when you want to test the Rails-served app externally through ngrok.

### Files used

- `server/.env`
- `server/.env.test`
- `client/.env.test`

### How test mode now works

- Frontend API calls do not use a hardcoded ngrok URL
- In test builds, frontend API calls use `window.location.origin`
- This means the same build will follow the active ngrok URL automatically
- You do not need to edit `client/.env.test` every time ngrok changes
- If you need a custom test override, you can still set `VITE_API_BASE_URL` manually
- No manual ngrok replacement is required for normal frontend testing

### When you should update `server/.env.test`

Update `server/.env.test` only when you want Rails-generated absolute URLs to use your live ngrok domain.

Examples:

- ActiveStorage URLs
- mailer URLs
- future webhook/callback URLs

If `server/.env.test` still contains the placeholder, Rails safely ignores it.

### Step 1: Build frontend for test mode

Open terminal 1:

```bash
cd /home/pranav/homostay_app
./scripts/prepare_test_env.sh
```

This mirrors the development database into the isolated test database and publishes the Rails-served frontend build in one step.

### Step 2: Start Rails in test mode

Open terminal 2:

```bash
cd /home/pranav/homostay_app/server
bin/rails s -e test
```

### Step 3: Start ngrok

Open terminal 3:

```bash
ngrok http 3000
```

### How test works

- React is built as static files
- Rails restores the development database into the isolated `homostay_app_test` database
- Static files are copied into `server/public/`
- Compiled Vite bundles are served from `/vite/*`
- Public downloadable files remain under `/assets/*`
- Rails serves the frontend and API together from port `3000`
- ngrok exposes the Rails app externally
- Frontend API calls use the current ngrok origin automatically
- Rails host authorization allows ngrok test domains
- Rails URL helpers and ActiveStorage use `NGROK_URL` only when you set a real value in `server/.env.test`

### Important rule for test mode

Whenever you need the test environment refreshed, run again:

```bash
cd /home/pranav/homostay_app
./scripts/prepare_test_env.sh
```

This safely refreshes the test database and republishes the frontend without touching development data.

Important note:

- If ngrok shows old UI or empty data, run `./scripts/prepare_test_env.sh`
- Test data is isolated from development but mirrored from it through dump/restore

### Exact test database mirror

The test setup now uses PostgreSQL dump/restore instead of seeds:

```bash
cd /home/pranav/homostay_app
./scripts/restore_test_db_from_dev.sh
```

What it does:

- dumps `homostay_app_development`
- recreates `homostay_app_test`
- restores the dump into test
- keeps development and test as separate databases

### If you only changed backend code in test mode

Usually restart Rails:

```bash
cd /home/pranav/homostay_app/server
bin/rails s -e test
```

## 3. Production on VPS

Use this after your VPS and domain are ready.

### Files used

- `server/.env`
- `server/.env.production`
- `client/.env.production`

### Values you must change after VPS/domain setup

Update these files with your real domain:

- `server/.env.production`
- `client/.env.production`

Replace:

```env
https://your-real-domain.com
```

with your real domain, for example:

```env
https://sacredhomes.in
```

### Production build steps

Build frontend:

```bash
cd /home/pranav/homostay_app/client
npm install
cd /home/pranav/homostay_app
./scripts/publish_frontend.sh production
```

Prepare Rails:

```bash
cd /home/pranav/homostay_app/server
bundle install
RAILS_ENV=production bin/rails db:migrate
RAILS_ENV=production bin/rails assets:precompile
```

Start Rails in production:

```bash
cd /home/pranav/homostay_app/server
RAILS_ENV=production bin/rails s
```

### How production is intended to work

- Rails serves the built frontend from `server/public/`
- Rails also serves the API
- Domain-based URLs come from `BACKEND_URL` and `VITE_API_BASE_URL`
- No ngrok is used

## 4. Exact File Changes Needed After VPS Hosting

After you buy the VPS and connect the domain, update these files.

### A. Update backend production URL

File:

- `server/.env.production`

Set:

```env
FRONTEND_URL=https://your-real-domain.com
BACKEND_URL=https://your-real-domain.com
```

### B. Update frontend production API URL

File:

- `client/.env.production`

Set:

```env
VITE_API_BASE_URL=https://your-real-domain.com
```

### C. Update test ngrok URL whenever ngrok changes

File:

- `server/.env.test`

Only update this when you need Rails-generated absolute URLs to point to the live ngrok domain.

You do not need to update `client/.env.test` for normal test browsing, because the frontend uses `window.location.origin` in test mode.

### D. Keep secrets in server `.env`

File:

- `server/.env`

Keep your existing private keys and secrets there, such as:

- WhatsApp keys
- Gmail credentials
- any other server-only secrets

Do not move these into client env files.

## 5. Daily Command Reference

### Local development

```bash
cd /home/pranav/homostay_app/server
bin/rails s
```

```bash
cd /home/pranav/homostay_app/client
npm run dev
```

### ngrok test

```bash
cd /home/pranav/homostay_app
./scripts/prepare_test_env.sh
```

```bash
cd /home/pranav/homostay_app/server
bin/rails s -e test
```

```bash
ngrok http 3000
```

### production build

```bash
cd /home/pranav/homostay_app
./scripts/publish_frontend.sh production
```

```bash
cd /home/pranav/homostay_app/server
RAILS_ENV=production bin/rails db:migrate
RAILS_ENV=production bin/rails s
```

## 6. Troubleshooting

### Common Issues

- stale UI or empty data in ngrok -> rerun `./scripts/prepare_test_env.sh`
- API failure in test -> confirm Rails test server is running and ngrok is pointing to port `3000`
- wrong image or absolute URL host -> set a real `NGROK_URL` in `server/.env.test`

### ngrok shows old frontend

Run:

```bash
cd /home/pranav/homostay_app
./scripts/prepare_test_env.sh
```

Then restart Rails test server if needed.

### Admin credentials in test

- Test now uses the exact admin users from the development database mirror
- Use the same admin credentials you already use in development

### Final Validation Checklist

- development works without building the frontend
- test works without editing the frontend env for every ngrok tunnel
- ngrok keeps working without rebuild unless frontend code changed
- admin panel loads correctly
- blog pages still load correctly
- booking flow remains unaffected

### frontend cannot reach backend locally

Check:

- `client/.env.development`
- `server/.env.development`

They should still point to:

- `http://localhost:5173`
- `http://localhost:3000`

### images or generated URLs use wrong host

Check:

- `server/.env.test`
- `server/.env.production`

For test mode:

- if you need Rails-generated absolute URLs, set `NGROK_URL` in `server/.env.test`
- if `server/.env.test` still contains `REPLACE_WITH_NGROK_URL`, Rails will ignore it safely

For production:

- `BACKEND_URL` and `FRONTEND_URL` must match the real public domain

### Final Validation Checklist

- dev works without building the frontend
- test works without editing frontend env files for each ngrok tunnel
- ngrok works without rebuild unless frontend code changed
- admin panel loads correctly
- blog pages still load correctly
- booking flow remains unaffected
