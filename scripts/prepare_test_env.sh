#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/restore_test_db_from_dev.sh"

cd "$ROOT_DIR"
"$ROOT_DIR/scripts/build_test.sh"

echo "Test environment prepared"
