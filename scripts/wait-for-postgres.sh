#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Using DATABASE_URL for PostgreSQL connection."

  host=$(ruby -ruri -e 'puts URI.parse(ENV["DATABASE_URL"]).host')
  port=$(ruby -ruri -e 'puts URI.parse(ENV["DATABASE_URL"]).port')
  user=$(ruby -ruri -e 'puts URI.parse(ENV["DATABASE_URL"]).user')
  db=$(ruby -ruri -e 'puts URI.parse(ENV["DATABASE_URL"]).path.sub(%r{^/}, "")')
else
  echo "Using DATABASE_HOST for PostgreSQL connection."

  host="${DATABASE_HOST:-postgres}"
  port="${DATABASE_PORT:-5432}"
  user="${DATABASE_USER:-homostay_app}"
  db="${DATABASE_NAME:-homostay_app_production}"
fi

echo "Waiting for PostgreSQL at ${host}:${port}..."

until pg_isready -h "$host" -p "$port" -U "$user" -d "$db" >/dev/null 2>&1; do
  sleep 2
done

echo "PostgreSQL is ready."
