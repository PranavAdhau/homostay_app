#!/usr/bin/env bash
set -euo pipefail

required_vars=()

if [[ -n "${DATABASE_URL:-}" ]]; then
  :
else
  required_vars+=(DATABASE_HOST DATABASE_PORT DATABASE_NAME DATABASE_USER HOMOSTAY_APP_DATABASE_PASSWORD)
fi

required_vars+=(SECRET_KEY_BASE REDIS_URL)

missing=()
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing required production environment variables:" >&2
  for var in "${missing[@]}"; do
    echo "  - $var" >&2
  done
  exit 1
fi

echo "Production environment variables look complete."
