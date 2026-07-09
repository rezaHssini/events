# 03 — Core Features Specification

## Feature Map

```
Discovery          Social              Commerce           Operations
─────────          ──────              ────────           ──────────
Feed               Follow              Free events        QR check-in
Map view           Like                Paid tickets       Guest lists
Search             Comment             Reservations       Staff roles
Filters            Share               Seated layouts     Door sales
Trending           Stories             Promo codes        Analytics
Nearby             DMs                 Refunds            Payouts
Calendar sync      Memories (UGC)      Event menus        Bar/kitchen queue
Past event proof   Live stories        Pre-orders         Perk redemption
                   Ratings/reviews     Included perks       F&B staff view
```

---

## A. Creator Pages (Social Profile for Events)

The central identity for organizers — analogous to an Instagram profile but event-native.

### Page Profile
- Display name, handle (@username), avatar, banner
- Bio, location, website, social links
- Verification badge
- Follower / following counts
- Pinned event or announcement

### Page Content
- **Events tab** — upcoming, past, drafts (owner view)
- **Posts tab** — updates, behind-the-scenes, announcements
- **Media tab** — photo/video grid from events
- **About** — description, venue info, policies

### Page Management
- Team member invites with roles
- Notification preferences
- Payout settings
- Page analytics overview

---

## B. Events

### Event Content
| Field | Description |
|-------|-------------|
| Title & slug | SEO-friendly URL |
| Description | Rich text (markdown) with embeds |
| Cover image / video | Hero media, autoplay loop on detail |
| Gallery | Multiple images and videos |
| Category & tags | Music, art, food, sports, etc. |
| Date & time | Start, end, timezone, multi-day support |
| Location | Venue name, address, lat/lng, indoor/outdoor |
| Lineup | Performers, speakers with photos and links |
| Agenda | Schedule blocks within multi-hour/day events |
| Age restriction | All ages, 18+, 21+ |
| Dress code, FAQs | Optional structured fields |

### Event Types
- **Standing (GA)** — general admission, capacity number
- **Seated** — interactive seat map (see Section E)
- **Hybrid** — GA + VIP seated sections

### Event States
```
Draft → Scheduled → Published → Live → Ended → Archived
                  ↘ Cancelled
```

### Ticketing Modes
| Mode | Behavior |
|------|----------|
| **Free** | RSVP or open registration |
| **Free + reservation** | RSVP holds a spot, limited capacity |
| **Paid** | Checkout flow, Stripe |
| **Paid + reservation** | Pay to reserve, seat hold timer |
| **Donation** | Pay what you want (min optional) |
| **Invite only** | Approval workflow or invite codes |

---

## C. Social Features

### Feed
- **Home feed** — events and posts from followed pages + friends activity
- **For You** — algorithmic discovery (interests, location, engagement)
- **Event post format** — card with media, date, location, price, social actions

### Engagement
- **Like** — events, posts, comments
- **Comment** — threaded, @mentions, emoji reactions
- **Share** — in-app, copy link, native share sheet (WhatsApp, iMessage, etc.)
- **Save** — bookmark for later

### Follow Graph
- Follow creator pages
- Follow other users (see their public activity)
- Followers see new events in feed

### Stories (Phase 2)
- 24h ephemeral content from creators
- Event countdown stickers, poll stickers, link stickers

### Direct Messages (Phase 2)
- Creator ↔ attendee (optional setting)
- Attendee ↔ attendee (mutual follow or event-based)

### Post-Event Memories (Attendee-Generated Content)
Full spec: [10-hospitality-memories-social.md](10-hospitality-memories-social.md)

- **Verified attendee only** — must check in to rate, review, or post media
- **Ratings** — 1–5 stars + sub-ratings (Vibe, Venue, Value, Food & Drinks)
- **Reviews** — text with @mentions
- **Photos & videos** — reels-style clips, multi-photo posts
- **Social proof loop** — memories surface on **future events** from same creator
- **Engagement** — like, comment, share on memory posts; creator can reply and pin
- **Surfaces** — past event "Memories" tab, creator "Community" tab, feed cards
- **Aggregate display** — "★ 4.8 from 240 verified attendees" on new event pages
- **Auto highlight reel** — best UGC carousel for repeat events

### Live Event Social (During)
- Attendee stories (24h) after check-in
- "I'm here" check-in posts to feed
- Live photo wall (opt-in, venue display)
- Event chat for ticket holders

---

## D. Discovery & Map

### Map View
- Clustered pins by zoom level
- Pin color by category or price (free vs paid)
- Tap pin → event preview card → detail
- "Search this area" on pan
- User location dot with permission

### Filters
| Filter | Options |
|--------|---------|
| Date | Today, this weekend, this week, custom range |
| Type / category | Music, art, food, tech, sports, etc. |
| Price | Free, paid, price range |
| Format | Standing, seated |
| Distance | Radius from user or map center |
| Age | All ages, 18+, 21+ |
| Availability | Not sold out, has waitlist |

### Search
- Full-text: event title, creator, venue, tags
- Autocomplete suggestions
- Recent searches

### Lists & Collections
- Editorial: "Best this weekend in [city]"
- Creator-curated playlists of events
- Seasonal collections

---

## E. Seated Events & Venue Layout

### Venue Setup (Creator)
1. Choose template: theater, club tables, stadium, custom
2. Upload background image OR use drag-drop editor
3. Define **sections** (Orchestra, Balcony, VIP)
4. Place **seats** with row/number labels
5. Set **price tiers** per section or per seat
6. Mark accessible seats, obstructed view, etc.

### Seat Map (Attendee)
- Interactive pan/zoom map
- Color-coded availability (available, held, sold, selected)
- Multi-seat selection for groups
- **Hold timer** — 10–15 min reservation during checkout
- Best-available option for users who don't care about exact seat

### Inventory Rules
- Real-time availability (WebSocket updates)
- Prevent double-booking with row-level locking
- Release held seats on timeout or abandoned cart

---

## F. Ticketing & Checkout

### Ticket Types
- General Admission
- Early Bird / Tiered pricing (time-based automatic switch)
- VIP / Backstage
- Group bundles (4 tickets for price of 3)
- Add-ons: parking, merch, drink tokens
- F&B bundles: ticket + meal, ticket + drink package

### Checkout Flow
1. Select tickets / seats
2. Attendee info (name, email; optional custom questions)
3. Promo code
4. Payment (Stripe) or confirm free RSVP
5. Confirmation + email + wallet pass

### Ticket Delivery
- In-app ticket wallet
- QR code (rotating for fraud prevention — optional)
- PDF download
- Apple Wallet / Google Pay pass
- Email with calendar attachment (.ics)

### Post-Purchase
- Transfer to another user (if allowed)
- Request refund (per creator policy)
- Upgrade ticket (if available)
- Add to calendar

---

## G. Reservations & Capacity

### Standing Events
- Max capacity number
- Optional oversell % (creator setting, advanced)
- Waitlist when sold out → auto-offer on cancellation

### Reservation Settings
- Require account vs guest checkout
- Approval required (manual RSVP approve)
- Plus-ones limit
- Registration deadline

---

## H. Check-In & On-Site (Staff View)

### Scanner App
- Camera QR scan (primary)
- Manual code entry fallback
- NFC tap (future)
- Search by name/email/order ID

### Check-In States
- Valid → green, admit
- Already used → yellow, show time of first scan
- Invalid / refunded → red
- Wrong event / wrong day → red with explanation

### Door Operations
- Walk-up ticket sales (if enabled)
- Comp list / guest list (non-ticket holders)
- VIP separate queue view
- Live attendance count

### Offline Mode
- Download attendee list before event
- Scan offline, queue syncs when online
- Conflict resolution on sync

---

## I. Notifications

| Trigger | Channels |
|---------|----------|
| New event from followed page | Push, in-app, email (digest) |
| Friend going / booked | Push, in-app |
| Event reminder (24h, 1h) | Push, email |
| Ticket purchase confirmation | Email, in-app |
| Price drop / last tickets | Push |
| Waitlist offer | Push, email (time-limited) |
| Comment reply / @mention | Push, in-app |
| Event cancelled / changed | Push, email, SMS |
| Payout processed | Email (creator) |
| Pre-order confirmed | Push, email |
| Order ready for pickup | Push |
| Memory liked / commented | Push, in-app |
| Creator replied to your review | Push, in-app |
| Review window opening | Push (after check-in) |

---

## J. Creator Analytics

### Dashboard Metrics
- Page views, profile visits
- Follower growth over time
- Event impressions, click-through, conversion
- Ticket sales: revenue, units, by type
- Check-in rate vs tickets sold
- Traffic sources (feed, map, share, direct)
- Demographics (age range, location — aggregated)
- Top performing events and posts

### Exports
- Attendee CSV (name, email, ticket type, check-in status)
- Revenue report for accounting

---

## K. Web vs Mobile Views

### Mobile App (Primary — Attendees)
- Feed, map, event detail, checkout, ticket wallet
- Social actions, notifications, profile
- Lightweight creator: quick post, view sales

### Mobile App (Staff)
- Dedicated scanner mode
- Minimal UI, maximum speed

### Web App
- **Public** — event pages (SEO), creator pages, discovery
- **Attendee** — full experience, responsive
- **Creator Dashboard** — event editor, seating designer, analytics, payouts (desktop-optimized)
- **Admin** — moderation, platform config

---

## L. Media Handling

- Image upload: JPEG, PNG, WebP; auto-resize, compression
- Video upload: MP4; transcode to multiple qualities
- Max file sizes per tier (free vs pro creator)
- CDN delivery
- Moderation: auto-scan for prohibited content
- Alt text for accessibility

---

## M. Platform Admin

- User search, ban, verify
- Report queue (events, comments, users)
- Feature flags
- Category management
- Financial overview
- Creator application review

---

## N. Event Menus & Pre-Orders

Full spec: [10-hospitality-memories-social.md](10-hospitality-memories-social.md)

### Menu Types
Bar, café, restaurant, food vendor, concessions — one or combined per event.

### Creator Menu Builder
- Categories and items with photos, prices, dietary/allergen tags
- Modifiers (size, add-ons), availability windows, stock limits
- Reusable menu templates across events
- Happy hour / time-based pricing
- Mark items sold out (86) — syncs live to attendees

### Attendee Experience
- **Menu tab** on event detail — browse, filter by dietary needs
- **Pre-order** — cart, pickup time slot, pay now or at venue
- **On-site order** — order during event after check-in
- Order linked to ticket QR; confirmation + "ready for pickup" push

### Bundles
- Ticket + meal combos, ticket + drink tokens, tasting flights, table packages

### F&B Staff View
- Order queue: New → Preparing → Ready → Picked up
- Kitchen/bar display mode
- Inventory quick actions (sold out)
- Shift revenue report

---

## O. Included Perks (Entry Benefits)

Creators attach complimentary benefits to ticket tiers, redeemed at bar/entry.

### Perk Types
- Welcome drink, drink tokens, free food item, merch, VIP access, parking, bar tab credit

### Configuration
- Per ticket type (GA vs VIP different perks)
- Eligible menu categories/items
- Redemption window (e.g., welcome drink first 2 hours)
- Partial redemption (2 of 3 tokens used)

### Attendee Ticket Wallet
- Perk cards with remaining balance
- Redemption QR per perk or bundled with ticket scan
- Redemption history

### Staff
- Scanner shows perks after valid ticket
- One-tap redeem with fraud prevention (no double redeem)
- Manager override for disputes
