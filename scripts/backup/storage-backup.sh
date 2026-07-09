#!/usr/bin/env bash
set -euo pipefail
out_dir="${BACKUP_OUTPUT_DIR:-./backup/storage}"
mkdir -p "$out_dir"
stamp="$(date +%Y%m%d_%H%M%S)"
tar -czf "${out_dir}/storage_${stamp}.tar.gz" server/storage
echo "${out_dir}/storage_${stamp}.tar.gz"
