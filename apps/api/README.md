# @event/api

NestJS backend for the Event platform. Serves the web app from `public/` and exposes REST endpoints under `/api`.

## Development

```bash
# From repo root — build web first so public/ exists
npm run build:web
npm run dev:api
```

Server: http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev -w @event/api` | Watch mode |
| `npm run build -w @event/api` | Compile to `dist/` |
| `npm run start:prod -w @event/api` | Run compiled server |

## Environment

Copy `.env.example` to `.env` and adjust as needed.
