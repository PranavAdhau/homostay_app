#!/usr/bin/env bash
set -euo pipefail
out_dir="${BACKUP_OUTPUT_DIR:-./backup/config}"
mkdir -p "$out_dir"
stamp="$(date +%Y%m%d_%H%M%S)"
tar -czf "${out_dir}/config_${stamp}.tar.gz" \
  docker-compose.yml docker-compose.production.yml docker-compose.override.yml docker .env.example server/.env.production.example .env.development.example .env.test.example \
  deploy/hostinger README_DEPLOYMENT_HOSTINGER.md DOCKER.md DEPLOYMENT.md SECRETS.md BACKUP.md RESTORE.md ARCHITECTURE.md TROUBLESHOOTING.md
echo "${out_dir}/config_${stamp}.tar.gz"
