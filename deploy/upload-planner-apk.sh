#!/usr/bin/env bash
# Build and upload Planner Studio APK.
#
# Usage:
#   DEPLOY_HOST=root@65.109.221.245 npm run deploy:planner-apk

set -euo pipefail

HOST="${1:-${DEPLOY_HOST:-}}"
if [ -z "$HOST" ]; then
  echo "Usage: DEPLOY_HOST=user@host npm run deploy:planner-apk"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="${REMOTE_DIR:-/opt/events}"
APK_SRC="${ROOT}/apps/planner-mobile/android/app/build/outputs/apk/release/app-release.apk"

cd "${ROOT}"

echo "==> Building signed Planner Studio release APK..."
npm run apk:planner:release

echo "==> Uploading planner APK ($(du -h "${APK_SRC}" | awk '{print $1}'))..."
ssh "${HOST}" "mkdir -p ${REMOTE_DIR}/apps/api/data"
scp "${APK_SRC}" "${HOST}:${REMOTE_DIR}/apps/api/data/planner.apk"

echo "==> Verifying download..."
ssh "${HOST}" "ls -lh ${REMOTE_DIR}/apps/api/data/planner.apk"
curl -fsI "http://$(echo "${HOST}" | cut -d@ -f2):3040/downloads/planner.apk" | head -5 || true

echo "==> Done: http://$(echo "${HOST}" | cut -d@ -f2):3040/downloads/planner.apk"
