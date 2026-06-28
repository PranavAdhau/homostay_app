# README

This README documents key configuration required for external services.

## WhatsApp Business Cloud API

The app sends WhatsApp notifications via the Meta WhatsApp Business Cloud API
from background jobs (`WhatsappBookingJob`, `WhatsappGuestAcknowledgementJob`,
`WhatsappUserConfirmationJob`, `WhatsappUserRejectionJob`) through the
`WhatsappService`.

Incoming Meta webhook calls are handled at:

- `GET /webhooks/whatsapp` for webhook verification
- `POST /webhooks/whatsapp` for signed inbound events

The webhook flow is intentionally lightweight:

1. Validate request signature and payload
2. Enqueue `WhatsappWebhookEventJob`
3. Return `200 OK` immediately

Any parsing, duplicate suppression, and event logging happens asynchronously in
the job layer.

### Required environment variables

Set these in your deployment environment (e.g. `.env`, systemd unit, or host
environment):

- `WHATSAPP_PHONE_NUMBER_ID` – Phone number ID from the Meta Business dashboard.
- `WHATSAPP_ACCESS_TOKEN` – Access token used for the `Authorization: Bearer` header.
- `WHATSAPP_BUSINESS_ACCOUNT_ID` – Expected WABA id for webhook payload validation.
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` – Verify token used by Meta during webhook setup.
- `WHATSAPP_APP_SECRET` – Meta app secret used for `X-Hub-Signature-256` verification.
- `ADMIN_WHATSAPP_NUMBER` – Destination number for owner/admin booking alerts.

The legacy Twilio variables (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`TWILIO_WHATSAPP_NUMBER`) are no longer used and can be safely removed.

## Environment Workflows

### Development

Run Rails and Vite separately for the fastest local feedback loop:

- `cd server && bin/rails s`
- `cd client && npm run dev`

Environment files:

- `server/.env.development`
- `client/.env.development`

Expected URLs:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Test (ngrok)

Use the Rails test environment with a built frontend copied into `server/public`:

- `cd /home/pranav/homostay_app && ./scripts/prepare_test_env.sh`
- `cd server && bin/rails s -e test`
- `ngrok http 3000`

Environment files:

- `server/.env.test`
- `client/.env.test`

Set `NGROK_URL` in `server/.env.test` only when Rails needs to generate absolute
URLs. Leave `client/.env.test` empty for normal test builds so the frontend uses
`window.location.origin` automatically.

The test database remains isolated from development. `./scripts/prepare_test_env.sh`
runs `./scripts/restore_test_db_from_dev.sh`, which dumps the development
database and restores it into the separate test database. This gives ngrok the
exact same records as development without sharing a single database.

Frontend bundles are published under `/vite/*`, while static public downloads
like PDFs remain under `/assets/*`. Rails has explicit published-file routes for
both paths outside development so the built frontend assets resolve correctly in
test/ngrok mode.

### Production (future VPS)

Production is prepared to read environment-specific host settings from:

- `server/.env.production`
- `client/.env.production`

Expected URLs:

- Backend: `https://your-real-domain.com`
- Frontend: `https://your-real-domain.com`

On a VPS, build the frontend, copy `build/*` into `server/public/`, and serve
Rails as the single public entrypoint.

- `npm run publish:frontend`
