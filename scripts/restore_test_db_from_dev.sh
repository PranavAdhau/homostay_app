#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"
TMP_DUMP="$(mktemp /tmp/homostay_app_dev_dump.XXXXXX.dump)"

cleanup() {
  rm -f "$TMP_DUMP"
}
trap cleanup EXIT

database_name_for() {
  local environment="$1"
  ruby - "$SERVER_DIR/config/database.yml" "$environment" <<'RUBY'
require "erb"
require "yaml"

config_path = ARGV[0]
environment = ARGV[1]
config = YAML.safe_load(ERB.new(File.read(config_path)).result, aliases: true)
db_name = config.fetch(environment).fetch("database")
puts db_name
RUBY
}

DEV_DB="$(database_name_for development)"
TEST_DB="$(database_name_for test)"

if [[ "$DEV_DB" == "$TEST_DB" ]]; then
  echo "Development and test databases must be different." >&2
  exit 1
fi

echo "Dumping development database: $DEV_DB"
pg_dump --format=custom --no-owner --no-privileges --file="$TMP_DUMP" "$DEV_DB"

echo "Recreating test database: $TEST_DB"
psql postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TEST_DB' AND pid <> pg_backend_pid();" >/dev/null
dropdb --if-exists "$TEST_DB"
createdb "$TEST_DB"

echo "Restoring development dump into test database"
pg_restore --no-owner --no-privileges --dbname="$TEST_DB" "$TMP_DUMP"

echo "Development data restored into isolated test database"
