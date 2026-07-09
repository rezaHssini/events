#!/usr/bin/env bash
# Remove Event platform from a remote server.
#
# Usage:
#   DEPLOY_HOST=user@host bash deploy/remote-uninstall.sh
#   bash deploy/remote-uninstall.sh user@host

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host bash deploy/remote-uninstall.sh"
  echo "   or: bash deploy/remote-uninstall.sh user@host"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Uninstalling Event platform from ${HOST}..."
scp "${SCRIPT_DIR}/server-uninstall.sh" "${HOST}:/tmp/events-server-uninstall.sh"
ssh "${HOST}" "bash /tmp/events-server-uninstall.sh"
ssh "${HOST}" "rm -f /tmp/events-server-uninstall.sh"

echo "==> Remote uninstall complete."
