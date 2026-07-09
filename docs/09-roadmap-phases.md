# 09 — Roadmap & Phases

## Overview

```
Phase 0 ──► Phase 1 (MVP) ──► Phase 2 ──► Phase 3 ──► Phase 4
Foundation   Launch Core      Growth        Monetize      Scale
(2-3 wks)    (8-10 wks)       (6-8 wks)     (6-8 wks)     (ongoing)
```

---

## Phase 0: Foundation (Weeks 1–3)

**Goal:** Development environment, core infrastructure, auth.

### Backend
- [ ] NestJS project scaffold with module structure
- [ ] PostgreSQL + PostGIS via Docker Compose
- [ ] Prisma ORM + initial migrations (users, pages)
- [ ] Redis setup
- [ ] Auth module: register, login, JWT, refresh tokens
- [ ] OAuth: Google, Apple
- [ ] Global validation, error handling, logging
- [ ] Swagger/OpenAPI docs
- [ ] Health checks
- [ ] CI pipeline (lint, test, build)

### Frontend (Parallel Setup)
- [ ] Choose stack: Next.js (web) + React Native (mobile) recommended
- [ ] Monorepo setup (Turborepo)
- [ ] Shared types package
- [ ] Design tokens from UX doc
- [ ] Basic auth screens

### Deliverable
Deployable API with auth; empty web/mobile shells connected to API.

---

## Phase 1: MVP — Launch Core (Weeks 4–13)

**Goal:** End-to-end flow — creator publishes event, attendee discovers, buys/RSVPs, staff scans.

### 1A: Creator Pages & Events (Weeks 4–6)
- [ ] Pages CRUD, public profile view
- [ ] Events CRUD with draft/publish workflow
- [ ] Media upload (presigned S3, image processing)
- [ ] Categories and tags
- [ ] Event detail page (web + mobile)
- [ ] Rich description, location with geocoding

### 1B: Discovery (Weeks 6–7)
- [ ] Event list with filters (date, category, price)
- [ ] Map view with bounding box query (PostGIS)
- [ ] Basic search (Meilisearch)
- [ ] Public SEO-friendly event URLs
- [ ] Open Graph meta tags

### 1C: Social Core (Weeks 7–8)
- [ ] Follow pages
- [ ] Like events
- [ ] Comments (threaded)
- [ ] Share (link + record)
- [ ] Save/bookmark events
- [ ] Home feed (chronological, followed pages)

### 1D: Ticketing — Standing (Weeks 8–10)
- [ ] Ticket types (free, paid)
- [ ] RSVP / checkout flow
- [ ] Stripe Connect onboarding for creators
- [ ] Stripe PaymentIntent checkout
- [ ] Order confirmation email
- [ ] Ticket wallet with QR code
- [ ] Guest checkout (email delivery)
- [ ] Basic promo codes

### 1E: Check-In (Weeks 10–11)
- [ ] Staff role assignment
- [ ] QR scan endpoint
- [ ] Scanner mobile view
- [ ] Guest list search
- [ ] Check-in stats

### 1F: Polish & Launch Prep (Weeks 11–13)
- [ ] Push notifications (event reminders, new event from followed)
- [ ] Report content flow
- [ ] Rate limiting, basic moderation
- [ ] Creator analytics (basic: views, sales, check-ins)
- [ ] Onboarding flows (attendee + creator)
- [ ] Beta test with 10–20 creators

### MVP Feature Cut (Explicitly NOT in Phase 1)
- Seated events / seat maps
- Stories, DMs
- Attendee memories (UGC reviews/photos)
- Event menus & pre-orders
- Included perks / drink tokens
- Waitlists
- Ticket transfers
- Offline scanner sync
- Advanced feed algorithm
- Gamification badges

### MVP Success Criteria
- 20 creators, 100 events in pilot city
- 500 registered attendees
- 200 tickets sold (paid + free RSVP)
- Check-in working at 5 live events
- < 3s page load, < 1% payment failure (excl. user error)

---

## Phase 2: Growth Features (Weeks 14–21)

**Goal:** Seating, richer social, retention, creator tools.

### Seated Events
- [ ] Venue and layout editor (web)
- [ ] Section and seat management
- [ ] Interactive seat map (mobile + web)
- [ ] Redis seat holds with TTL
- [ ] WebSocket seat availability
- [ ] Best-available seat selection

### Social & Retention
- [ ] "Friends going" (with privacy controls)
- [ ] User follow (not just pages)
- [ ] **Attendee memories** — verified check-in required; photos, videos, reviews
- [ ] **Social proof on future events** — past memories carousel + aggregate rating
- [ ] **Creator Community tab** — aggregated UGC across events
- [ ] Stories (24h content)
- [ ] Group booking
- [ ] Calendar sync (.ics, Google Calendar)
- [ ] Waitlist → auto-offer flow

### Event Hospitality (F&B)
- [ ] **Event menus** — bar, café, restaurant builder with templates
- [ ] **Pre-orders** — cart, pickup slots, pay now or at venue
- [ ] **Included perks** — welcome drink, tokens per ticket tier
- [ ] **Perk redemption** in scanner flow
- [ ] **Bar/kitchen display** — order queue for staff
- [ ] On-site ordering after check-in
- [ ] Ticket + meal bundles at checkout

### Ticketing Advanced
- [ ] Early bird pricing tiers (auto-switch)
- [ ] Ticket transfers
- [ ] Refund requests + creator approval
- [ ] Custom registration fields
- [ ] Apple Wallet / Google Pay passes
- [ ] Rotating QR codes (anti-fraud)

### Operations
- [ ] Offline scanner with batch sync
- [ ] Door sales (walk-up)
- [ ] At-event chat for ticket holders
- [ ] Email digest (weekly events from followed)

### Discovery
- [ ] "For You" scored feed
- [ ] Similar events recommendations
- [ ] Editorial collections (admin)
- [ ] "Happening now" filter

---

## Phase 3: Monetization & Pro (Weeks 22–29)

**Goal:** Revenue optimization, creator subscriptions, B2B features.

### Revenue
- [ ] Platform fee configuration (admin)
- [ ] Creator Pro subscription (Stripe Billing)
  - Advanced analytics
  - Custom page branding
  - Priority support
  - Reduced fees
- [ ] Promoted events (discovery ads)
- [ ] Affiliate / promoter links

### Commerce
- [ ] Multi-currency support
- [ ] Tax calculation (Stripe Tax)
- [ ] Merch add-ons at checkout
- [ ] Tip jar on free events
- [ ] Partial refunds

### Analytics
- [ ] Funnel analytics (view → purchase)
- [ ] Real-time on-sale dashboard
- [ ] Cohort and repeat attendee reports
- [ ] Export improvements

### Platform
- [ ] Venue claimable pages
- [ ] Event series / recurring events
- [ ] Co-host events
- [ ] Public API + webhooks
- [ ] Embeddable event widget

---

## Phase 4: Scale & Expand (Ongoing)

- Virtual waiting room for high-demand on-sales
- Ticket resale marketplace (face-value cap)
- Livestream tickets
- NFC / wristband integrations
- White-label for venue chains
- Multi-city / international expansion
- AR filters, 360° venue previews
- Enterprise SSO, corporate accounts
- Advanced fraud ML
- A/B testing for creators

---

## Team Recommendations (MVP)

| Role | Count | Focus |
|------|-------|-------|
| Backend (NestJS) | 1–2 | API, payments, search |
| Mobile (RN) | 1–2 | Attendee + scanner app |
| Web (Next.js) | 1 | Public pages + creator dashboard |
| Design (UI/UX) | 1 | Design system, animations |
| Product / PM | 0.5–1 | Prioritization, creator outreach |
| DevOps | 0.5 | Infra, CI/CD (can be backend initially) |

**Minimum viable team:** 3 engineers + 1 designer for ~3 months to MVP.

---

## Tech Decisions to Make Now

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Mobile framework | React Native, Flutter | React Native (share TS with web) |
| Web framework | Next.js, Remix | Next.js (SSR for SEO) |
| ORM | Prisma, TypeORM | Prisma |
| Monorepo | Turborepo, Nx | Turborepo |
| Search | Meilisearch, Elasticsearch | Meilisearch for MVP |
| Maps | Mapbox, Google Maps | Mapbox (styling, cost) |
| Animations | Rive, Lottie | Rive for interactive, Lottie for simple |
| Email | Resend, SendGrid | Resend (DX) |
| File storage | AWS S3, Cloudflare R2 | R2 (cost) or S3 (ecosystem) |

---

## Risk Register by Phase

| Phase | Risk | Mitigation |
|-------|------|------------|
| 0 | Scope creep | Strict MVP cut list |
| 1 | Payment bugs | Stripe test mode, idempotency, webhook tests |
| 1 | Low creator adoption | Manual onboarding, city pilot |
| 2 | Seat map complexity | Start with templates, not freeform editor |
| 2 | Performance on map | Clustering, bbox limits, caching |
| 3 | Fee resistance | Competitive pricing, value via analytics |
| 4 | Infra cost | CDN, read replicas, queue scaling plan |

---

## Definition of Done (Per Feature)

- [ ] API endpoint(s) with validation and auth
- [ ] Unit tests for business logic
- [ ] Integration test for happy path
- [ ] Mobile UI (if attendee-facing)
- [ ] Web UI (if creator/admin-facing)
- [ ] Error states and empty states
- [ ] Analytics event tracked
- [ ] Documentation updated
- [ ] Deployed to staging and QA'd

---

## Immediate Next Actions

1. **Review these planning docs** — confirm scope, cut list, priorities
2. **Decide tech stack** — React Native + Next.js recommended
3. **Set up monorepo** — Phase 0 kickoff
4. **Design system in Figma** — parallel to Phase 0
5. **Identify pilot city + 10 seed creators** — business development
6. **Register Stripe Connect platform account**
7. **Secure domain + branding** (name TBD — "Event" is working title)
