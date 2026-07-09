#!/usr/bin/env bash
# One-liner for server console (paste as root):
#
#   curl -fsSL https://raw.githubusercontent.com/rezaHssini/events/main/deploy/console-bootstrap.sh | bash
#
# Or if repo already cloned:
#   cd /opt/events && git pull && bash deploy/server-setup.sh

set -euo pipefail

EVENTS_DIR="${EVENTS_DIR:-/opt/events}"
REPO="${EVENTS_REPO:-https://github.com/rezaHssini/events.git}"

apt-get update -qq
apt-get install -y git curl

mkdir -p "${EVENTS_DIR}"
if [ ! -d "${EVENTS_DIR}/.git" ]; then
  git clone "${REPO}" "${EVENTS_DIR}"
fi

cd "${EVENTS_DIR}"
git pull --ff-only
bash deploy/server-setup.sh
