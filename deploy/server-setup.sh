#!/usr/bin/env bash
# Deploy Event platform to a Linux server (isolated port, won't touch other apps).
#
# Usage (on server as root):
#   bash deploy/server-setup.sh
#
# Env overrides:
#   EVENTS_PORT=3040
#   EVENTS_DIR=/opt/events
#   EVENTS_PUBLIC_PATH=/events   # nginx path on port 80 (empty to skip nginx)
#   EVENTS_REPO=git@github.com:rezaHssini/events.git

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"
EVENTS_DIR="${EVENTS_DIR:-/opt/events}"
EVENTS_PUBLIC_PATH="${EVENTS_PUBLIC_PATH:-/events}"
EVENTS_REPO="${EVENTS_REPO:-git@github.com:rezaHssini/events.git}"
NODE_MAJOR="${NODE_MAJOR:-20}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Event platform deploy (port ${EVENTS_PORT}, dir ${EVENTS_DIR})"

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

echo "==> Building web + API (public path: ${EVENTS_PUBLIC_PATH})..."
export VITE_BASE="${EVENTS_PUBLIC_PATH%/}/"
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

echo "==> Opening port ${EVENTS_PORT}..."
bash "${SCRIPT_DIR}/open-port.sh"

if [ -n "${EVENTS_PUBLIC_PATH}" ] && command -v nginx >/dev/null 2>&1; then
  echo "==> Configuring nginx reverse proxy on port 80 (${EVENTS_PUBLIC_PATH}/)..."
  INCLUDE_FILE="/etc/nginx/conf.d/events-app.conf"
  cat > "${INCLUDE_FILE}" << NGINX
# Event app — auto-generated, proxies to localhost:${EVENTS_PORT}
location ${EVENTS_PUBLIC_PATH%/}/ {
    proxy_pass http://127.0.0.1:${EVENTS_PORT}/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}

location = ${EVENTS_PUBLIC_PATH%/} {
    return 301 ${EVENTS_PUBLIC_PATH%/}/;
}
NGINX

  DEFAULT_SITE="/etc/nginx/sites-available/default"
  if [ -f "${DEFAULT_SITE}" ] && ! grep -q "events-app.conf" "${DEFAULT_SITE}"; then
    sed -i '/listen .*80;/a\    include /etc/nginx/conf.d/events-app.conf;' "${DEFAULT_SITE}"
  fi

  nginx -t && systemctl reload nginx
  echo "==> nginx: http://$(hostname -I | awk '{print $1}')${EVENTS_PUBLIC_PATH}/"
fi

IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "==> Deployed successfully."
echo "    Direct:  http://${IP}:${EVENTS_PORT}/"
echo "    Via 80:  http://${IP}${EVENTS_PUBLIC_PATH}/"
echo "    APK:     http://${IP}${EVENTS_PUBLIC_PATH}/downloads/event.apk"
systemctl status events-api --no-pager -l || true
