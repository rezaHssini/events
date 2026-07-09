# Server deployment

Event runs on **port 3040 only**. Deploy scripts do **not** modify nginx or port 80.

## Deploy

```bash
DEPLOY_HOST=root@65.109.221.245 npm run deploy:remote
```

Or on the server as root:

```bash
curl -fsSL https://raw.githubusercontent.com/rezaHssini/events/main/deploy/server-setup.sh -o /tmp/server-setup.sh
curl -fsSL https://raw.githubusercontent.com/rezaHssini/events/main/deploy/open-port.sh -o /tmp/open-port.sh
bash /tmp/server-setup.sh
```

Open **TCP 3040** in your cloud firewall.

| Resource | URL |
|----------|-----|
| Web | `http://65.109.221.245:3040` |
| APK | `http://65.109.221.245:3040/downloads/event.apk |

Finwise stays on port 80: `http://65.109.221.245/`
