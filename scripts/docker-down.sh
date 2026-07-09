#!/usr/bin/env bash
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  compose_cmd=(docker compose)
else
  compose_cmd=(docker-compose)
fi

"${compose_cmd[@]}" -f docker-compose.yml -f docker-compose.production.yml down
