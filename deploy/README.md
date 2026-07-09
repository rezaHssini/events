# Server deployment

Event runs on **port 3040 only**. Deploy scripts do **not** modify nginx or port 80.

## Fix nginx (if port 80 was affected)

Run on the server as **root**:

```bash
cd /opt/events && git pull
bash deploy/fix-nginx.sh
```

This removes `/etc/nginx/conf.d/events-app.conf` and the include line from the default site, then reloads nginx.

## Deploy / update Event app

```bash
cd /opt/events && git pull
bash deploy/fix-nginx.sh    # only needed once, to undo nginx changes
bash deploy/server-setup.sh
```

Open **TCP 3040** in your cloud provider firewall, then:

| Resource | URL |
|----------|-----|
| Web | `http://5.78.98.154:3040` |
| APK | `http://5.78.98.154:3040/downloads/event.apk` |

## From your Mac

```bash
npm run deploy:remote
```

Requires SSH key on the server.
