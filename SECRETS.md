# Secrets

Source of truth files:
- `.env.example`
- `.env.production`
- `server/.env.production.example`
- `.env.development.example`
- `.env.test.example`

Key runtime variables:
- `SECRET_KEY_BASE`: Rails secret used by web and worker
- `HOMOSTAY_APP_DATABASE_PASSWORD`: PostgreSQL password used by Rails and Postgres
- `REDIS_URL`: Redis connection URL used by Rails, Sidekiq, and Action Cable
- `BACKEND_URL`: canonical backend origin
- `FRONTEND_URL`: canonical frontend origin
- `APP_HOSTS`: allowed hostnames in production
- `WHATSAPP_*`: WhatsApp integration secrets used by Rails jobs and webhooks
- `ADMIN_WHATSAPP_NUMBER`: destination for admin WhatsApp notifications
- `ICAL_DOMAIN`: calendar URL domain

Secret rotation plan after this repository cleanup:
1. Rotate WhatsApp access token
2. Rotate WhatsApp webhook verify token
3. Rotate WhatsApp app secret
4. Rotate PostgreSQL password
5. Rotate Rails `SECRET_KEY_BASE` if it was ever committed or shared insecurely

Do not store real secrets in committed `.env` files.
