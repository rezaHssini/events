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
| Web app | `http://5.78.98.154:3040` |
| Health | `http://5.78.98.154:3040/api/health` |
| Android APK | `http://5.78.98.154:3040/downloads/event.apk` |

The **Google Play** badge in the web UI downloads this APK directly.

## Environment

| Variable | Default |
|----------|---------|
| `EVENTS_PORT` | `3040` |
| `EVENTS_DIR` | `/opt/events` |

## Firewall

If the port is blocked externally:

```bash
ufw allow 3040/tcp
```
