#!/usr/bin/env bash
# Full fix: restore nginx on 80, deploy Event app on 3040.
# Run on the server as root (one command):
#   curl -fsSL https://raw.githubusercontent.com/rezaHssini/events/main/deploy/server-fix.sh | bash

set -euo pipefail

EVENTS_DIR="${EVENTS_DIR:-/opt/events}"
REPO="${EVENTS_REPO:-https://github.com/rezaHssini/events.git}"

echo "==> Installing git/curl if needed..."
apt-get update -qq
apt-get install -y git curl

mkdir -p "${EVENTS_DIR}"
if [ ! -d "${EVENTS_DIR}/.git" ]; then
  git clone "${REPO}" "${EVENTS_DIR}"
fi

cd "${EVENTS_DIR}"
git pull --ff-only

bash deploy/fix-nginx.sh
bash deploy/server-setup.sh

echo ""
echo "==> Final check"
ss -tlnp | grep ':3040 ' || { echo "ERROR: nothing on 3040"; exit 1; }
curl -fsI http://127.0.0.1:3040/ | head -3
echo ""
echo "==> Event app should be live at http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'):3040/"
