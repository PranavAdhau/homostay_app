#!/usr/bin/env bash
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  compose_cmd=(docker compose)
else
  compose_cmd=(docker-compose)
fi

out_dir="${BACKUP_OUTPUT_DIR:-./backup/postgres}"
mkdir -p "$out_dir"
stamp="$(date +%Y%m%d_%H%M%S)"
"${compose_cmd[@]}" -f docker-compose.yml exec -T postgres pg_dump -U "${DATABASE_USER:-homostay_app}" "${DATABASE_NAME:-homostay_app_production}" | gzip > "${out_dir}/postgres_${stamp}.sql.gz"
echo "${out_dir}/postgres_${stamp}.sql.gz"
