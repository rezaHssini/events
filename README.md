# Event Platform

Social events platform — discover, create, and attend events with menus, tickets, perks, and attendee memories.

Monorepo containing the **web client**, **Android app**, and **API server**.

## Repository structure

| Path | Package | Description |
|------|---------|-------------|
| [`apps/web/`](apps/web/) | `@event/web` | React + Vite **desktop web** client |
| [`apps/mobile-ui/`](apps/mobile-ui/) | `@event/mobile-ui` | **Mobile-first** UI (bottom tabs) |
| [`apps/mobile/`](apps/mobile/) | `@event/mobile` | Capacitor Android shell |
| [`apps/api/`](apps/api/) | `@event/api` | NestJS API + static hosting |
| [`docs/`](docs/) | — | Product & architecture docs |

## Quick start

```bash
npm install

# Web dev server (port 5174)
npm run dev

# API dev server (port 3000) — run web build first for static assets
npm run build:web
npm run dev:api

# Web + API together
npm run dev:all
```

Open http://localhost:5174 (dev) or http://localhost:3000 (production-style after `build:web`).

## Build for production

```bash
npm run build          # web → apps/api/public, then compile API
npm run start:prod -w @event/api
```

## Android APK

Builds the **mobile UI** (`apps/mobile-ui`), not the desktop web app:

```bash
npm run apk:debug      # installable debug APK
npm run apk:release    # unsigned release APK
```

APK output: `apps/mobile/android/app/build/outputs/apk/`

Requires Java 21 and Android SDK. See [`apps/mobile/README.md`](apps/mobile/README.md).

## Stack

| Layer | Technology |
|-------|------------|
| Web (desktop) | React 19, Vite, Tailwind CSS, Framer Motion |
| Mobile UI | React 19, mobile-first layout (`apps/mobile-ui`) |
| Mobile shell | Capacitor 8 (Android 7.0+) |
| API | NestJS 11 |
| E2E | Playwright |

## Documentation

Planning docs live in [`docs/`](docs/) — vision, features, architecture, roadmap.

## Legacy

The local `mock-web/` folder was merged into `apps/mobile-ui/`. Use `apps/web/` for desktop and `apps/mobile-ui/` for the Android app.
