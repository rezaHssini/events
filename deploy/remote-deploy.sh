#!/usr/bin/env bash
# Build locally, upload artifacts, install on server.
#
# Usage:
#   DEPLOY_HOST=root@65.109.221.245 npm run deploy:remote

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:remote"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building locally..."
cd "${ROOT}"
npm run build

echo "==> Preparing server directory..."
ssh "${HOST}" "mkdir -p ${REMOTE_DIR}/apps/api/dist ${REMOTE_DIR}/apps/api/public ${REMOTE_DIR}/apps/api/data"

echo "==> Uploading build artifacts..."
rsync -avz --delete \
  "${ROOT}/apps/api/dist/" "${HOST}:${REMOTE_DIR}/apps/api/dist/"
rsync -avz --delete \
  "${ROOT}/apps/api/public/" "${HOST}:${REMOTE_DIR}/apps/api/public/"
scp "${ROOT}/package.json" "${ROOT}/package-lock.json" "${HOST}:${REMOTE_DIR}/"
scp "${ROOT}/apps/api/package.json" "${HOST}:${REMOTE_DIR}/apps/api/"

echo "==> Installing on server..."
scp "${SCRIPT_DIR}/server-install.sh" "${SCRIPT_DIR}/open-port.sh" "${HOST}:/tmp/"
ssh "${HOST}" "bash /tmp/server-install.sh && rm -f /tmp/server-install.sh /tmp/open-port.sh"

if [ -f "${ROOT}/apps/mobile/android/app/build/outputs/apk/release/app-release.apk" ]; then
  echo "==> Uploading APK..."
  bash "${SCRIPT_DIR}/upload-apk.sh" "${HOST}"
fi

echo "==> Deploy complete."
