# 05 — Technical Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Mobile App   │  │ Web App      │  │ Staff Scanner│  │ Admin Panel │ │
│  │ (Attendee)   │  │ (Public +    │  │ (Mobile)     │  │ (Web)       │ │
│  │              │  │  Dashboard)  │  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └────────────────┬┴─────────────────┴─────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                      │
│                    (rate limiting, TLS, routing)                         │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                      NESTJS APPLICATION (Monolith → Modules)             │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Auth    │ │ Users   │ │ Pages    │ │ Events  │ │ Social  │          │
│  │ Module  │ │ Module  │ │ Module   │ │ Module  │ │ Module  │          │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Tickets │ │ Seating │ │ Payments │ │ Media   │ │ Search  │          │
│  │ Module  │ │ Module  │ │ Module   │ │ Module  │ │ Module  │          │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐                       │
│  │ Notify  │ │ Admin   │ │ Analytics│ │ WebSocket│                       │
│  │ Module  │ │ Module  │ │ Module   │ │ Gateway  │                       │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘                       │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────────────────┘
       │          │          │          │          │
┌──────▼──┐ ┌─────▼────┐ ┌───▼───┐ ┌────▼────┐ ┌───▼────┐ ┌────────────┐
│PostgreSQL│ │  Redis   │ │  S3   │ │Meilisearch│ │ Stripe │ │ Bull Queue │
│ (Primary)│ │ (Cache,  │ │ (CDN) │ │ (Search) │ │ Connect│ │ (Jobs)     │
│ +Replica │ │  Locks)  │ │       │ │          │ │        │ │            │
└──────────┘ └──────────┘ └───────┘ └─────────┘ └────────┘ └────────────┘
```

## Recommended Repository Structure (Monorepo)

```
event/
├── apps/
│   ├── api/                 # NestJS backend
│   ├── web/                 # Next.js (public + dashboard)
│   ├── mobile/              # React Native or Flutter
│   └── admin/               # Admin panel (or part of web)
├── packages/
│   ├── shared-types/        # TypeScript types shared across apps
│   ├── shared-utils/        # Validation schemas (Zod), constants
│   └── ui/                  # Shared component library (optional)
├── docs/                    # Planning (this folder)
├── docker/
├── scripts/
├── docker-compose.yml
├── turbo.json               # Turborepo (optional)
└── package.json
```

## NestJS Module Breakdown

### Core Modules

| Module | Responsibility |
|--------|----------------|
| **Auth** | JWT, refresh tokens, OAuth, magic links, 2FA |
| **Users** | Profiles, preferences, settings, blocks |
| **Pages** | Creator pages, team, followers |
| **Events** | CRUD, states, scheduling, location |
| **Social** | Likes, comments, shares, follows, feed |
| **Tickets** | Types, orders, QR codes, transfers |
| **Seating** | Venues, layouts, seats, holds, availability |
| **Payments** | Stripe checkout, webhooks, payouts, refunds |
| **Media** | Upload URLs, processing jobs, CDN URLs |
| **Search** | Index sync, query API |
| **Notifications** | Push, email, SMS, in-app |
| **CheckIn** | Scan validation, offline sync |
| **F&B** | Menu, pre-orders, perks, bar/kitchen queue |
| **Memories** | UGC reviews, photos, videos, social proof |
| **Analytics** | Event tracking, aggregations |
| **Admin** | Moderation, platform config |

### Cross-Cutting Concerns

- **Guards** — JWT, roles, page permissions, rate limit
- **Interceptors** — Logging, transform response, cache
- **Pipes** — Validation (class-validator / Zod)
- **Filters** — Global exception handling
- **Middleware** — Request ID, correlation ID

## Database Strategy

### PostgreSQL as Primary Store
- All transactional data
- JSONB for flexible fields (custom questions, seat layout metadata)
- **PostGIS** extension for geospatial queries (map, nearby)

### Read Replicas
- Feed and discovery queries → replica
- Writes → primary

### Redis Use Cases

| Use Case | Pattern |
|----------|---------|
| Session / refresh token blacklist | Key-value TTL |
| Seat holds during checkout | Key with TTL + Lua atomic decrement |
| Rate limiting | Sliding window |
| Feed cache | Sorted sets, TTL |
| Real-time seat map | Pub/sub + cache |
| Job queues | Bull/BullMQ backing store |

## Search Architecture

**Meilisearch** (recommended for MVP — simpler ops than Elasticsearch)

Indexed entities:
- Events (title, description, tags, location, date)
- Pages (name, handle, bio)
- Venues

Sync strategy:
- On event create/update/delete → queue indexing job
- Nightly full reindex (safety net)

## Media Pipeline

```
Client → Presigned S3 URL → Direct upload
                ↓
         Webhook / S3 event
                ↓
         Bull job: transcode video / resize images
                ↓
         Update media record with CDN URLs
                ↓
         Optional: moderation scan (AWS Rekognition / custom)
```

## Real-Time Requirements

| Feature | Technology |
|---------|------------|
| Seat availability updates | WebSocket rooms per event |
| Live check-in count (staff) | WebSocket |
| Notifications | Push (FCM/APNs) + in-app WebSocket |
| Chat (Phase 2) | WebSocket or dedicated service |

NestJS: `@nestjs/websockets` with Socket.io or native WS.

## Payment Flow (Stripe Connect)

```
Attendee pays → Stripe Checkout / Payment Intent
                      ↓
              Platform fee deducted
                      ↓
              Creator Connect account credited
                      ↓
              Webhook: payment_intent.succeeded
                      ↓
              Create order + tickets + send email
```

- **Connect type:** Express or Standard accounts for creators
- **Webhooks:** Idempotent handlers with Stripe event ID dedup
- **Refunds:** Initiated by creator or admin, synced via webhook

## Feed Algorithm (MVP → Advanced)

### MVP (Chronological + followed)
```sql
SELECT * FROM feed_items
WHERE (source_page_id IN (followed_pages) OR source_user_id IN (followed_users))
ORDER BY created_at DESC
LIMIT 20
```

### Phase 2 (Scored)
Score = `w1 * recency + w2 * engagement + w3 * proximity + w4 * friend_activity`

Precompute scores in background job; cache per user.

## Security Architecture

| Layer | Measure |
|-------|---------|
| Transport | TLS 1.3 everywhere |
| Auth | Short-lived JWT (15m) + refresh token (httpOnly cookie web) |
| API | Rate limiting per IP and per user |
| Data | Row-level security patterns in services |
| Payments | PCI via Stripe (no card data on our servers) |
| Uploads | Presigned URLs, type validation, size limits |
| Secrets | Vault / env injection, never in repo |

## Deployment (Recommended)

| Component | Platform |
|-----------|----------|
| API | Railway, Fly.io, AWS ECS, or DigitalOcean |
| PostgreSQL | Managed (RDS, Supabase, Neon) |
| Redis | Upstash or ElastiCache |
| S3 | AWS S3 + CloudFront |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (errors), Datadog/Grafana (metrics) |

### Environments
- `development` — local Docker Compose
- `staging` — preview deployments per PR
- `production` — blue/green or rolling deploys

## Scalability Considerations

### Hot Paths
1. **On-sale moment** — Queue system (virtual waiting room) for ultra-high demand
2. **Seat locking** — Redis atomic operations, not DB row locks
3. **Feed** — Cache + pagination, fan-out on write for followed users (Phase 2)
4. **Check-in** — Read-heavy; cache attendee list on device

### Horizontal Scaling
- Stateless API instances behind load balancer
- WebSocket sticky sessions or Redis adapter for Socket.io
- Background workers separate from API process

## Observability

- **Structured JSON logs** with `requestId`, `userId`
- **OpenTelemetry** traces (optional Phase 2)
- **Health endpoints:** `/health`, `/health/ready`
- **Alerts:** Error rate, payment webhook failures, queue depth

## Third-Party Integrations

| Service | Purpose |
|---------|---------|
| Stripe Connect | Payments & payouts |
| Mapbox / Google Maps | Maps, geocoding |
| FCM + APNs | Push notifications |
| Resend / SendGrid | Transactional email |
| Twilio | SMS (optional) |
| Sentry | Error tracking |
| PostHog / Mixpanel | Product analytics |

## API Style Decision

**Recommendation: REST for MVP** with OpenAPI (Swagger) docs.

- Predictable for mobile and web teams
- GraphQL optional later for flexible feed queries
- Version prefix: `/api/v1/`

## Mobile vs Web Technical Notes

| Concern | Mobile | Web |
|---------|--------|-----|
| Auth token storage | Secure storage (Keychain) | httpOnly cookies |
| Offline | Ticket wallet, scanner cache | Limited (PWA optional) |
| Maps | Native SDK | Mapbox GL JS |
| Animations | Reanimated / Rive | Framer Motion / Rive |
| Deep links | Universal links | Standard URLs |
