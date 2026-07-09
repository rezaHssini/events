#!/usr/bin/env bash
# Build APK locally and upload to a server.
#
# Usage:
#   DEPLOY_HOST=user@host npm run deploy:apk
#   bash deploy/upload-apk.sh user@host

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:apk"
  echo "   or: bash deploy/upload-apk.sh user@host"
  exit 1
fi

REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
APK_SRC="${ROOT}/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk"

cd "${ROOT}"

if [ ! -f "${APK_SRC}" ]; then
  echo "==> Building APK..."
  npm run apk:debug
fi

echo "==> Uploading APK to ${HOST}:${REMOTE_DIR}/apps/api/data/event.apk"
ssh "${HOST}" "mkdir -p ${REMOTE_DIR}/apps/api/data"
scp "${APK_SRC}" "${HOST}:${REMOTE_DIR}/apps/api/data/event.apk"

echo "==> Restarting API (if service exists)..."
ssh "${HOST}" "systemctl restart events-api 2>/dev/null || true"

echo "==> Done. APK available at /downloads/event.apk on the server."
