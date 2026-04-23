#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/homostay_app/postgres"
DB_NAME="homostay_app_production"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"

find "$BACKUP_DIR" -type f -name "${DB_NAME}_*.sql.gz" -mtime +14 -delete
