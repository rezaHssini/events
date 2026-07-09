#!/usr/bin/env bash
# Deploy Event platform to a Linux server on a dedicated port only.
# Does NOT modify nginx or port 80.
#
# Usage (on server as root):
#   bash deploy/server-setup.sh
#
# Env overrides:
#   EVENTS_PORT=3040
#   EVENTS_DIR=/opt/events
#   EVENTS_REPO=git@github.com:rezaHssini/events.git

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"
EVENTS_DIR="${EVENTS_DIR:-/opt/events}"
EVENTS_REPO="${EVENTS_REPO:-git@github.com:rezaHssini/events.git}"
NODE_MAJOR="${NODE_MAJOR:-20}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Event platform deploy (port ${EVENTS_PORT} only — will NOT touch nginx/port 80)"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js ${NODE_MAJOR}..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs git
fi

mkdir -p "${EVENTS_DIR}"
cd "${EVENTS_DIR}"

if [ ! -d .git ]; then
  echo "==> Cloning repository..."
  git clone "${EVENTS_REPO}" .
else
  echo "==> Pulling latest..."
  git pull --ff-only
fi

echo "==> Installing dependencies..."
npm ci

echo "==> Building web + API..."
unset VITE_BASE
npm run build

mkdir -p apps/api/data
if [ ! -f apps/api/data/event.apk ]; then
  echo "==> Note: No APK at apps/api/data/event.apk yet."
  echo "    Upload with: bash deploy/upload-apk.sh root@this-server"
fi

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
ExecStart=$(command -v npm) run start:prod -w @event/api
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
  echo "ERROR: events-api failed to start. Logs:"
  journalctl -u events-api -n 40 --no-pager
  exit 1
fi

echo "==> Opening port ${EVENTS_PORT}..."
bash "${SCRIPT_DIR}/open-port.sh"

IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "==> Deployed successfully (port ${EVENTS_PORT} only)."
echo "    Web: http://${IP}:${EVENTS_PORT}/"
echo "    APK: http://${IP}:${EVENTS_PORT}/downloads/event.apk"
systemctl status events-api --no-pager -l || true
