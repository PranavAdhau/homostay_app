#!/usr/bin/env bash

set -e

echo "===================================="
echo "Configuring Production Environment"
echo "===================================="

# ==========================
# Remove old Compose variables
# ==========================
unset DATABASE_HOST
unset DATABASE_PORT
unset DATABASE_NAME
unset DATABASE_USER
unset HOMOSTAY_APP_DATABASE_PASSWORD

# ==========================
# Rails
# ==========================
export RAILS_ENV=production
export PORT=8080

# ==========================
# PostgreSQL (Railway)
# ==========================
export DATABASE_URL='postgresql://postgres:PgNUCaRxylyNssYOpaSPccSjQzjNUPpN@hayabusa.proxy.rlwy.net:21244/railway'

# ==========================
# Redis (Upstash)
# ==========================
export REDIS_URL='rediss://default:gQAAAAAAAnqUAAIgcDEzYmFhMWQ0YTc1ZTU0ZmUwYmY3N2I4NmMzMzgxODc1OA@glowing-jaybird-162452.upstash.io:6379'

# ==========================
# Application URLs
# ==========================
export BACKEND_URL='https://thesacredhomes.com'
export FRONTEND_URL='https://thesacredhomes.com'
export VITE_FRONTEND_URL='https://thesacredhomes.com'
export VITE_API_BASE_URL='https://thesacredhomes.com'

export APP_HOSTS='thesacredhomes.com,www.thesacredhomes.com,homostayapp-production.up.railway.app,localhost,127.0.0.1'

# ==========================
# Rails Configuration
# ==========================
export RAILS_SERVE_STATIC_FILES=1
export RAILS_LOG_LEVEL=info
export RAILS_FORCE_SSL=false
export RAILS_MAX_THREADS=3
export RAILS_MIN_THREADS=1

# ==========================
# Telegram
# ==========================
export TELEGRAM_BOT_TOKEN='8973463220:AAFjUcc2v9z9_XZ7n7V6n6Qko8tfQ1pS8_g'
export TELEGRAM_CHAT_ID='8570271964'

# ==========================
# Secret Key
# ==========================
export SECRET_KEY_BASE='<YOUR_SECRET_KEY_BASE>'

echo
echo "===================================="
echo "Current Runtime Environment"
echo "===================================="

env | sort | grep -E 'DATABASE|REDIS|RAILS|PORT|BACKEND|FRONTEND|VITE|APP_HOSTS|SECRET|TELEGRAM'

echo
echo "===================================="
echo "Starting Sidekiq..."
echo "===================================="

bundle exec sidekiq -e production &

SIDEKIQ_PID=$!

echo "Sidekiq PID: ${SIDEKIQ_PID}"

echo
echo "===================================="
echo "Starting Puma..."
echo "===================================="

exec bundle exec puma -C config/puma.rb
