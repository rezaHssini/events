# Event Mobile UI

Original **mobile-first** Event app — bottom tab bar, iOS-style layout, `max-w-md` phone shell.

This is what ships inside the Android APK. The desktop site lives in [`apps/web/`](../web/).

## Dev

```bash
npm run dev -w @event/mobile-ui
```

## Build for Capacitor

```bash
npm run build -w @event/mobile-ui
```

Output: `apps/mobile-ui/dist/` → synced into `apps/mobile/android/`.
