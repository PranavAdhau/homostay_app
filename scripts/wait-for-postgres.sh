#!/usr/bin/env bash
set -euo pipefail

host="${DATABASE_HOST:-}"
port="${DATABASE_PORT:-5432}"
user="${DATABASE_USER:-}"
db="${DATABASE_NAME:-}"

if [[ -z "$host" && -n "${DATABASE_URL:-}" ]]; then
  if [[ "$DATABASE_URL" =~ ^[A-Za-z][A-Za-z0-9+.-]*://([^:/@]+)(:([^@/]+))?@([^/:]+)(:([0-9]+))?/([^?]+) ]]; then
    user="${user:-${BASH_REMATCH[1]}}"
    host="${host:-${BASH_REMATCH[4]}}"
    port="${port:-${BASH_REMATCH[6]}}"
    db="${db:-${BASH_REMATCH[7]}}"
  fi
fi

host="${host:-postgres}"
port="${port:-5432}"
user="${user:-homostay_app}"
db="${db:-homostay_app_production}"

until pg_isready -h "$host" -p "$port" -U "$user" -d "$db" >/dev/null 2>&1; do
  echo "Waiting for PostgreSQL at ${host}:${port}..."
  sleep 2
done

echo "PostgreSQL is ready."
