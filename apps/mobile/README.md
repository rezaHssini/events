# @event/mobile

Android app shell for the Event platform, built with [Capacitor](https://capacitorjs.com/).

The UI comes from **`@event/mobile-ui`** — the original mobile-first app with bottom tabs and phone layout.  
The desktop website is **`@event/web`** (separate codebase).

## Requirements

- Node.js 20+
- Java 21 (Gradle / Android build)
- Android SDK

## Build APK

From the repository root:

```bash
npm install
npm run apk:debug
```

Output: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

Release (unsigned):

```bash
npm run apk:release
```

## Open in Android Studio

```bash
npm run sync -w @event/mobile
npm run open -w @event/mobile
```

## Device support

- **minSdk 24** — Android 7.0+
- **ABIs** — armeabi-v7a, arm64-v8a, x86, x86_64
