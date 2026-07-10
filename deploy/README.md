# Server deployment

Event runs on **port 3040 only**. Deploy scripts do **not** modify nginx or port 80.

## Deploy

Builds locally, uploads artifacts, starts the API on the server:

```bash
DEPLOY_HOST=root@65.109.221.245 npm run deploy:remote
```

Open **TCP 3040** in Hetzner/cloud firewall if needed.

| Resource | URL |
|----------|-----|
| Web | `http://65.109.221.245:3040` |
| APK | `http://65.109.221.245:3040/downloads/event.apk` |

[Finwise](http://65.109.221.245/) stays on port 80 — unchanged.
