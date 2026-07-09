#!/usr/bin/env bash
# Open port 3040 and ensure Event app is running.
# Run on the server as root: bash deploy/open-port.sh

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"

echo "==> Opening port ${EVENTS_PORT} (ufw + iptables)..."

if command -v ufw >/dev/null 2>&1; then
  ufw allow "${EVENTS_PORT}/tcp" || true
  ufw reload || true
  ufw status | grep "${EVENTS_PORT}" || true
fi

if command -v iptables >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT 2>/dev/null \
    || iptables -I INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT
  echo "==> iptables rule added for ${EVENTS_PORT}"
fi

# Persist iptables on Debian/Ubuntu if possible
if command -v netfilter-persistent >/dev/null 2>&1; then
  netfilter-persistent save || true
elif [ -d /etc/iptables ]; then
  iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
fi

echo "==> Restarting events-api..."
systemctl daemon-reload 2>/dev/null || true
systemctl enable events-api 2>/dev/null || true
systemctl restart events-api 2>/dev/null || true
systemctl status events-api --no-pager -l 2>/dev/null | head -12 || echo "(events-api service not installed yet — run deploy/server-setup.sh)"

echo "==> Local listen check..."
ss -tlnp | grep ":${EVENTS_PORT} " || echo "WARNING: nothing listening on ${EVENTS_PORT}"

echo ""
echo "==> Done. Test from outside:"
echo "    curl -I http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'):${EVENTS_PORT}/"
echo ""
echo "If still blocked, open TCP ${EVENTS_PORT} in your cloud provider firewall (Hetzner/AWS/etc.)."
