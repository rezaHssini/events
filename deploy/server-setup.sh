#!/usr/bin/env bash
# Deploy Event platform to a Linux server (isolated port, won't touch other apps).
#
# Usage (on server as root or deploy user):
#   curl -fsSL ... | bash
#   or: bash deploy/server-setup.sh
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

echo "==> Event platform deploy (port ${EVENTS_PORT}, dir ${EVENTS_DIR})"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js ${NODE_MAJOR}..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
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
npm run build

mkdir -p apps/api/data
if [ ! -f apps/api/data/event.apk ]; then
  echo "==> Note: No APK at apps/api/data/event.apk yet."
  echo "    Upload with: scp event.apk ${EVENTS_DIR}/apps/api/data/event.apk"
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

echo ""
echo "==> Deployed successfully."
echo "    URL: http://$(hostname -I | awk '{print $1}'):${EVENTS_PORT}"
echo "    APK: http://$(hostname -I | awk '{print $1}'):${EVENTS_PORT}/downloads/event.apk"
systemctl status events-api --no-pager -l || true
