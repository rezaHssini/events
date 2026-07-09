#!/usr/bin/env bash
# Open app port in firewall and verify the service is listening.
# Run on the server as root: bash deploy/open-port.sh

set -euo pipefail

EVENTS_PORT="${EVENTS_PORT:-3040}"

if command -v ufw >/dev/null 2>&1; then
  ufw allow "${EVENTS_PORT}/tcp" || true
  ufw reload || true
fi

if command -v iptables >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT 2>/dev/null \
    || iptables -I INPUT -p tcp --dport "${EVENTS_PORT}" -j ACCEPT
fi

if ! ss -tlnp | grep -q ":${EVENTS_PORT} "; then
  echo "ERROR: nothing listening on ${EVENTS_PORT}"
  journalctl -u events-api -n 30 --no-pager || true
  exit 1
fi

curl -fsI "http://127.0.0.1:${EVENTS_PORT}/" | head -3
echo "==> Port ${EVENTS_PORT} is open and serving."
