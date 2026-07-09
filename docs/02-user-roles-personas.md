# 02 — User Roles & Personas

## Role Hierarchy

```
Platform Admin
    └── Creator (Page Owner)
            ├── Page Admin
            ├── Page Editor
            ├── Event Manager
            ├── Door Staff / Scanner
            └── Promoter (affiliate)
    └── Attendee (default user)
            └── VIP / Guest (event-specific, no account required)
```

## Detailed Roles

### 1. Attendee (Default User)

**Who:** Anyone who discovers and attends events.

**Capabilities:**
- Browse feed, map, search
- Follow creator pages and other users
- Like, comment, share events and posts
- RSVP / purchase tickets
- Manage ticket wallet, transfers, refunds (per policy)
- Receive notifications
- Direct message creators (if enabled) or other attendees (opt-in)
- Post-event reviews and upload photos/videos (if enabled by creator, check-in required)
- Pre-order from event menu; view order status and pickup code
- View and redeem included perks (welcome drink, tokens) from ticket wallet
- Save/bookmark events
- Set discovery preferences (types, distance, date range)

**Personas:**

| Persona | Age | Behavior |
|---------|-----|----------|
| **The Explorer** | 22–28 | Map-first, tries new venues weekly |
| **The Loyal Fan** | 25–35 | Follows 5–10 creators, buys early |
| **The Social Planner** | 24–32 | Checks "friends going", coordinates groups |
| **The Casual** | 18–45 | Occasional, needs strong social proof |

---

### 2. Creator (Page Owner)

**Who:** Individuals or organizations that publish events.

**Capabilities:**
- Create and manage **Event Page** (like a profile)
- Publish events (draft → scheduled → live → ended → archived)
- Upload images, videos, descriptions, lineup, agenda
- Configure ticketing: free, paid, donation, invite-only
- Set up seated layouts (venue map, sections, pricing tiers)
- **Configure event menus** (bar, café, restaurant) with pre-order settings
- **Attach included perks** to ticket tiers (welcome drink, tokens, merch)
- Manage reservations / capacity / waitlists
- Assign staff roles per event
- View analytics: views, followers, sales, check-ins, revenue
- Connect payout account (Stripe Connect)
- Customize page branding (banner, colors, links)
- Pin posts, create stories/highlights
- Export attendee lists (GDPR-compliant)
- Set refund policies and promo codes

**Personas:**

| Persona | Type | Needs |
|---------|------|-------|
| **Indie DJ** | Solo creator | Simple paid events, promo, follower growth |
| **Gallery Owner** | Venue | Recurring events, seated exhibitions, staff scanning |
| **Workshop Host** | Educator | RSVP, small capacity, calendar series |
| **Festival Org** | Team | Multi-day, multiple stages, complex seating |

---

### 3. Page Team Members

Sub-roles on a creator page with granular permissions.

| Role | Permissions |
|------|-------------|
| **Page Admin** | Full page control except delete page / change payout |
| **Page Editor** | Create/edit events, media, posts; no payouts |
| **Event Manager** | Assigned events only: edit, view sales, manage waitlist |
| **Door Staff** | Scan tickets, view guest list, manual check-in, sell at door |
| **Bar / Kitchen Staff** | F&B order queue, perk redemption, mark orders ready, 86 menu items |
| **Promoter** | Unique referral links, view their conversion stats |

---

### Bar / Kitchen Staff

**Who:** Bartenders, servers, kitchen staff fulfilling pre-orders and perks.

**Dedicated app view:**
- Order queue (New → Preparing → Ready → Picked up)
- Sound/ping on new pre-orders
- Mark items sold out — instant sync to attendee menus
- Redeem included perks (welcome drink, tokens) via ticket scan
- Shift summary: orders fulfilled, perks redeemed, F&B revenue

---

### 4. Ticket Scanner / Door Staff

**Who:** On-site personnel checking attendees in.

**Dedicated app view:**
- Fast QR/barcode scanning (camera + manual code entry)
- Offline mode with sync when back online
- Guest list search (name, email, order ID)
- Override check-in (with reason log)
- At-door sales (if enabled)
- VIP list vs GA separation
- Real-time capacity counter
- Flag duplicate scans / invalid tickets

**Personas:**
- Club door staff (high volume, speed-critical)
- Gallery volunteer (low volume, needs search)
- Festival multi-gate (assigned zones)

---

### 5. Platform Admin

**Who:** Internal team operating the platform.

**Capabilities:**
- User/creator verification and suspension
- Content moderation queue
- Featured events and editorial collections
- Platform analytics dashboard
- Fee configuration
- Dispute resolution (refunds, chargebacks)
- Category/tag management
- System health monitoring

---

### 6. Guest / Walk-in (No Account)

**Who:** Attendees without app accounts.

**Capabilities:**
- Receive ticket via email (QR code)
- Apple Wallet / Google Pay pass
- RSVP via magic link
- Limited: cannot follow, comment, or earn badges

---

## Permission Model (RBAC)

```
Resource: Page
  - page:read (public)
  - page:write
  - page:delete
  - page:payout
  - page:team:manage

Resource: Event
  - event:read (public / followers / ticket-holders)
  - event:write
  - event:delete
  - event:tickets:manage
  - event:attendees:export
  - event:scan
  - event:menu:manage
  - event:orders:fulfill
  - event:memories:moderate

Resource: Ticket
  - ticket:read (own)
  - ticket:transfer
  - ticket:refund (own, per policy)

Resource: Social
  - post:comment
  - post:like
  - user:follow
  - user:dm
```

## Account Types

| Type | Description |
|------|-------------|
| **Personal** | Individual attendee or solo creator |
| **Creator Page** | Public-facing page (can be claimed by org) |
| **Organization** | Multiple pages under one billing entity |
| **Verified** | Badge after identity/business verification |

## Authentication Requirements

- Email + password or social login (Google, Apple)
- Phone verification for paid event purchases (fraud reduction)
- 2FA optional for creators with payout accounts
- Staff accounts: invite-only, scoped to page/event
- Magic links for guest ticket access

## Privacy Levels for Events

| Visibility | Who Can See |
|------------|-------------|
| **Public** | Everyone, indexed, shareable |
| **Unlisted** | Anyone with link |
| **Followers only** | Page followers |
| **Private / Invite** | Invited users only |
| **Password** | Link + password |
