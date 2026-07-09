# Server deployment

Event runs on a **dedicated port** (default `3040`) via systemd — it does not modify nginx or other projects.

## Prerequisites

- SSH access to the server as `root` (or a user with sudo)
- Your SSH public key added to the server
- GitHub deploy key or SSH access to `git@github.com:rezaHssini/events.git`

## One-command deploy (from your Mac)

```bash
npm run deploy:remote
# or: ./deploy/remote-deploy.sh root@5.78.98.154
```

This will:

1. Clone/pull into `/opt/events`
2. `npm ci && npm run build`
3. Install `events-api` systemd service on port **3040**
4. Upload the Android APK to `/downloads/event.apk`

## Manual steps on server

```bash
bash deploy/server-setup.sh
```

## Upload APK only

```bash
npm run apk:debug
npm run deploy:apk
```

## URLs after deploy

| Resource | URL |
|----------|-----|
| Web (port 80) | `http://5.78.98.154/events/` |
| Web (direct) | `http://5.78.98.154:3040` |
| Health | `http://5.78.98.154/events/api/health` |
| Android APK | `http://5.78.98.154/events/downloads/event.apk` |

Port **3040** is opened in ufw/iptables. If your **cloud firewall** only allows 80/443, use the `/events/` URL on port 80 (nginx proxy — does not affect other sites).

## Server console (no SSH from your Mac)

Paste on the server as **root**:

```bash
apt-get update && apt-get install -y git curl
git clone https://github.com/rezaHssini/events.git /opt/events
cd /opt/events && bash deploy/server-setup.sh
```

Open port only (if already deployed):

```bash
cd /opt/events && bash deploy/open-port.sh
```
