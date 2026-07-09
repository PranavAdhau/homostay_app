#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_PUBLIC_DIR="$ROOT_DIR/server/public"
BUILD_MODE="${1:-production}"
SKIP_FRONTEND_BUILD="${SKIP_FRONTEND_BUILD:-0}"

cd "$CLIENT_DIR"

export VITE_FRONTEND_URL="${VITE_FRONTEND_URL:-${FRONTEND_URL:-}}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-${BACKEND_URL:-}}"

if [[ "$SKIP_FRONTEND_BUILD" != "1" ]]; then
  case "$BUILD_MODE" in
    production)
      npm run build:production
      ;;
    test)
      npm run build:test
      ;;
    *)
      echo "Unsupported frontend publish mode: $BUILD_MODE" >&2
      echo "Expected one of: production, test" >&2
      exit 1
      ;;
  esac
fi

rm -f "$SERVER_PUBLIC_DIR/index.html"
rm -rf "$SERVER_PUBLIC_DIR/assets" "$SERVER_PUBLIC_DIR/vite"

cp -r "$CLIENT_DIR/build/." "$SERVER_PUBLIC_DIR/"

echo "Frontend published to $SERVER_PUBLIC_DIR using $BUILD_MODE mode"
