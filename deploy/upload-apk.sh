#!/usr/bin/env bash
# Build (if needed) and upload APK to the server.
#
# Usage:
#   DEPLOY_HOST=root@65.109.221.245 npm run deploy:apk

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:apk"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
APK_SRC="${ROOT}/apps/mobile/android/app/build/outputs/apk/release/app-release.apk"

cd "${ROOT}"

echo "==> Building signed release APK..."
npm run apk:release

echo "==> Uploading APK ($(du -h "${APK_SRC}" | awk '{print $1}'))..."
ssh "${HOST}" "mkdir -p ${REMOTE_DIR}/apps/api/data"
scp "${APK_SRC}" "${HOST}:${REMOTE_DIR}/apps/api/data/event.apk"

echo "==> Verifying download..."
ssh "${HOST}" "ls -lh ${REMOTE_DIR}/apps/api/data/event.apk"
curl -fsI "http://$(echo "${HOST}" | cut -d@ -f2):3040/downloads/event.apk" | head -5 || true

echo "==> Done: http://$(echo "${HOST}" | cut -d@ -f2):3040/downloads/event.apk"
