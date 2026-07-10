#!/usr/bin/env bash
# Install/start Event API on server (expects pre-built dist/ and public/).
# Does NOT modify nginx or port 80.
#
# Usage (on server as root):
#   bash deploy/server-install.sh

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"
EVENTS_DIR="${EVENTS_DIR:-/opt/events}"
EVENTS_REPO="${EVENTS_REPO:-https://github.com/rezaHssini/events.git}"
NODE_MAJOR="${NODE_MAJOR:-20}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Event platform install (port ${EVENTS_PORT} only — will NOT touch nginx/port 80)"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js ${NODE_MAJOR}..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs git
fi

mkdir -p "${EVENTS_DIR}/apps/api/data"
cd "${EVENTS_DIR}"

if [ ! -d .git ]; then
  git clone "${EVENTS_REPO}" .
fi

if [ ! -f apps/api/dist/main.js ]; then
  echo "ERROR: apps/api/dist/main.js missing — deploy build artifacts first."
  exit 1
fi

echo "==> Installing production API dependencies..."
npm ci --omit=dev -w @event/api

echo "==> Installing systemd service..."
cat > /etc/systemd/system/events-api.service << EOF
[Unit]
Description=Event Platform (web + API)
After=network.target

[Service]
Type=simple
WorkingDirectory=${EVENTS_DIR}
Environment=PORT=${EVENTS_PORT}
Environment=NODE_ENV=production
ExecStart=$(command -v node) apps/api/dist/main.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable events-api
systemctl restart events-api
sleep 2

if ! systemctl is-active --quiet events-api; then
  echo "ERROR: events-api failed to start:"
  journalctl -u events-api -n 40 --no-pager
  exit 1
fi

bash "${SCRIPT_DIR}/open-port.sh"

IP="$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo ""
echo "==> Running on port ${EVENTS_PORT}."
echo "    Web: http://${IP}:${EVENTS_PORT}/"
echo "    APK: http://${IP}:${EVENTS_PORT}/downloads/event.apk"
