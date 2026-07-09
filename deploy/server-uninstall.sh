#!/usr/bin/env bash
# Remove Event platform from a server and undo all deploy changes.
# Does NOT remove nginx, Node.js, git, or other system packages.
#
# Run on the server as root:
#   bash deploy/server-uninstall.sh
#
# Or from your machine (after setting DEPLOY_HOST):
#   DEPLOY_HOST=user@your-server bash deploy/remote-uninstall.sh

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"
EVENTS_DIR="${EVENTS_DIR:-/opt/events}"

echo "==> Uninstalling Event platform (port ${EVENTS_PORT})..."

if systemctl is-active --quiet events-api 2>/dev/null; then
  systemctl stop events-api
fi
systemctl disable events-api 2>/dev/null || true
rm -f /etc/systemd/system/events-api.service
systemctl daemon-reload

echo "==> Removing nginx changes (if any)..."
rm -f /etc/nginx/conf.d/events-app.conf
for f in /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default; do
  if [ -f "$f" ]; then
    sed -i '/events-app\.conf/d' "$f"
  fi
done
if command -v nginx >/dev/null 2>&1; then
  nginx -t
  systemctl reload nginx
fi

echo "==> Removing firewall rules for port ${EVENTS_PORT} (if added by deploy)..."
if command -v ufw >/dev/null 2>&1; then
  ufw delete allow "${EVENTS_PORT}/tcp" 2>/dev/null || true
fi
if command -v iptables >/dev/null 2>&1; then
  while iptables -C INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT 2>/dev/null; do
    iptables -D INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT
  done
fi
if command -v netfilter-persistent >/dev/null 2>&1; then
  netfilter-persistent save 2>/dev/null || true
elif [ -d /etc/iptables ]; then
  iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
fi

echo "==> Removing application files..."
rm -rf "${EVENTS_DIR}"
rm -f /tmp/events-server-setup.sh /tmp/events-fix-nginx.sh

echo "==> Verifying cleanup..."
issues=0
for check in \
  "events-api service|systemctl is-active events-api 2>/dev/null" \
  "events-app nginx conf|test -f /etc/nginx/conf.d/events-app.conf" \
  "events dir|test -d ${EVENTS_DIR}" \
  "port ${EVENTS_PORT} listener|ss -tlnp | grep -q ':${EVENTS_PORT} '"; do
  label="${check%%|*}"
  cmd="${check#*|}"
  if eval "$cmd"; then
    echo "    WARNING: still present — ${label}"
    issues=$((issues + 1))
  fi
done

if [ "$issues" -eq 0 ]; then
  echo "==> Uninstall complete. Server config restored (nginx/Node/git left untouched)."
else
  echo "==> Uninstall finished with ${issues} warning(s) — review above."
  exit 1
fi
