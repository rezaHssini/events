#!/usr/bin/env bash
# Full remote deploy from your machine: clone/pull, build, restart on server.
# Does NOT modify nginx or port 80.
#
# Usage:
#   DEPLOY_HOST=user@host npm run deploy:remote
#   bash deploy/remote-deploy.sh user@host

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:remote"
  echo "   or: bash deploy/remote-deploy.sh user@host"
  exit 1
fi

REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Running server setup on ${HOST}..."
scp "${SCRIPT_DIR}/server-setup.sh" "${HOST}:/tmp/events-server-setup.sh"
ssh "${HOST}" "bash /tmp/events-server-setup.sh && rm -f /tmp/events-server-setup.sh"

echo "==> Uploading APK..."
bash "${SCRIPT_DIR}/upload-apk.sh" "${HOST}"

echo "==> Remote deploy complete."
