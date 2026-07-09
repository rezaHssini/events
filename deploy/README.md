# Server deployment

Deploy scripts install the Event app on a **dedicated port only** (default **3040**). They do **not** modify nginx or port 80.

Set the target server with `DEPLOY_HOST`:

```bash
export DEPLOY_HOST=user@your-server
```

## Deploy

```bash
npm run deploy:remote
```

Or on the server as root (after cloning the repo):

```bash
bash deploy/server-setup.sh
```

Open **TCP 3040** in your cloud provider firewall.

| Resource | URL |
|----------|-----|
| Web | `http://YOUR_SERVER:3040` |
| APK | `http://YOUR_SERVER:3040/downloads/event.apk` |

## Uninstall (remove from a server)

Removes `/opt/events`, the `events-api` systemd unit, nginx snippets we may have added, and firewall rules for port 3040. Does **not** remove nginx, Node.js, or git.

From your machine:

```bash
DEPLOY_HOST=user@your-server npm run deploy:uninstall
```

Or on the server as root (one-liner, no repo needed):

```bash
curl -fsSL https://raw.githubusercontent.com/rezaHssini/events/main/deploy/server-uninstall.sh | bash
```

## Undo nginx changes only

If an older deploy touched nginx on port 80:

```bash
bash deploy/fix-nginx.sh
```
