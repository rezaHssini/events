#!/usr/bin/env bash
# Full remote deploy from your machine: clone/pull, build, restart on server.
#
# Usage:
#   ./deploy/remote-deploy.sh [user@host]

set -euo pipefail

HOST="${1:-root@5.78.98.154}"
REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Restoring nginx (port 80 for other projects)..."
scp "${SCRIPT_DIR}/fix-nginx.sh" "${HOST}:/tmp/events-fix-nginx.sh"
ssh "${HOST}" "bash /tmp/events-fix-nginx.sh" || true

echo "==> Running server setup on ${HOST}..."
scp "${SCRIPT_DIR}/server-setup.sh" "${HOST}:/tmp/events-server-setup.sh"
ssh "${HOST}" "bash /tmp/events-server-setup.sh"

echo "==> Uploading APK..."
bash "${SCRIPT_DIR}/upload-apk.sh" "${HOST}"

echo "==> Remote deploy complete."
