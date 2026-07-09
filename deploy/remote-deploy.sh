#!/usr/bin/env bash
# Remote deploy from your machine.
#
# Usage:
#   DEPLOY_HOST=root@65.109.221.245 npm run deploy:remote
#   bash deploy/remote-deploy.sh root@65.109.221.245

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:remote"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Deploying to ${HOST} (dedicated port only, no nginx changes)..."
scp "${SCRIPT_DIR}/server-setup.sh" "${SCRIPT_DIR}/open-port.sh" "${HOST}:/tmp/"
ssh "${HOST}" "bash /tmp/server-setup.sh && rm -f /tmp/server-setup.sh /tmp/open-port.sh"

echo "==> Done. Open TCP 3040 in cloud firewall if needed."
