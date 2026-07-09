#!/usr/bin/env bash
set -euo pipefail
cat <<'EOF'
1. Restore version-controlled infrastructure files from git.
2. Restore real runtime secrets from your secret manager or host env file.
3. Restore Docker volumes or host-mounted directories as needed.
4. Validate docker-compose config.
5. Boot rails, sidekiq, postgres, redis, and nginx.
EOF
