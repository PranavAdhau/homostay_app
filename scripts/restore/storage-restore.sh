#!/usr/bin/env bash
set -euo pipefail
archive="${1:?usage: storage-restore.sh path/to/storage.tar.gz}"
tar -xzf "$archive"
