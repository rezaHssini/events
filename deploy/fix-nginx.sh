#!/usr/bin/env bash
# Remove Event app changes from nginx — restores port 80 for your other project.
# Run on the server as root:
#   bash deploy/fix-nginx.sh

set -euo pipefail

echo "==> Removing Event app nginx config..."

rm -f /etc/nginx/conf.d/events-app.conf

for f in /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default; do
  if [ -f "$f" ]; then
    sed -i '/events-app\.conf/d' "$f"
    echo "    cleaned $f"
  fi
done

if command -v nginx >/dev/null 2>&1; then
  nginx -t
  systemctl reload nginx
  echo "==> nginx reloaded — port 80 restored for your existing project."
else
  echo "==> nginx not installed, nothing to reload."
fi

echo "==> Done. Event app should only use port 3040 (no nginx proxy)."
