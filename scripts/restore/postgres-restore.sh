#!/usr/bin/env bash
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  compose_cmd=(docker compose)
else
  compose_cmd=(docker-compose)
fi

archive="${1:?usage: postgres-restore.sh path/to/postgres.sql.gz}"
gunzip -c "$archive" | "${compose_cmd[@]}" -f docker-compose.yml exec -T postgres psql -U "${DATABASE_USER:-homostay_app}" "${DATABASE_NAME:-homostay_app_production}"
