# @event/web

React web client for the Event platform.

## Development

From the repository root:

```bash
npm install
npm run dev
```

Opens at http://localhost:5174 with API proxy to `http://localhost:3000`.

Run API separately:

```bash
npm run dev:api
```

Or both:

```bash
npm run dev:all
```

## Production build

Builds static assets into `apps/api/public/` for the NestJS server to serve:

```bash
npm run build:web
npm run build:api
```

## Mobile bundle

Legacy-compatible bundle for Capacitor (output: `dist/`):

```bash
npm run build:mobile -w @event/web
```

## E2E tests

```bash
npm run test:e2e
```
