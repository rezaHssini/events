# 10 — Event Hospitality, Pre-Orders & Attendee Memories

The platform is not only ticketing — it is a **full event lifestyle app**. Attendees discover, pre-order food & drinks, redeem perks at the door, share the night in real time, and leave social proof that fuels the creator's next event.

---

## Vision: Events as a Social Lifecycle

```
BEFORE EVENT          DURING EVENT           AFTER EVENT
─────────────         ─────────────          ────────────
Discover & follow  →  Check in & redeem  →  Rate & post
Pre-order menu        Live stories           Photos & videos
See past memories     On-site ordering       Reviews & highlights
Hype in comments      Share moments          Social proof for
Friends going         Included perks         next event page
```

Every phase generates **content and commerce** — the flywheel that makes this a social network dedicated to events, not a transactional ticket site.

---

## A. Event Menus (Bar, Café, Restaurant)

### Menu Types

| Type | Typical Use | Features |
|------|-------------|----------|
| **Bar** | Clubs, concerts, parties | Drinks, tokens, age-gated items |
| **Café** | Workshops, brunches, meetups | Coffee, pastries, light bites |
| **Restaurant** | Dinners, galas | Multi-course, table service |
| **Food vendor** | Festivals, markets | Multiple vendors per event |
| **Concessions** | Sports, theaters | Snacks, combos |

Creators choose one or combine (e.g., bar + food vendor for a festival).

### Menu Builder (Creator)

- **Reuse templates** — "Standard bar menu", "Wine tasting" saved to page library
- **Categories** — Cocktails, Beer, Wine, Zero-proof, Starters, Mains, Desserts
- **Items** per category:
  - Name, description, photo
  - Price (or "included" / "complimentary")
  - Dietary tags: vegan, vegetarian, gluten-free, halal, kosher, nut-free
  - Allergen list (structured)
  - Age restriction (21+ for alcohol)
  - Prep time estimate
  - Max quantity per order / per person
  - Daily or event-wide stock limit
- **Modifiers** — Size (S/M/L), add-ons ("extra shot +$3"), removals ("no ice")
- **Availability windows** — "Kitchen open 7–10pm", "Happy hour 8–9pm" with dynamic pricing
- **Sold out / 86'd** — manual or auto when inventory hits zero
- **Multi-language** — item names/descriptions (Phase 3)

### Menu Display (Attendee)

- Dedicated **Menu** tab on event detail page
- Visual grid/list toggle (food photos are social content)
- Filter by dietary needs
- "Popular" badge on high pre-order items
- Pairing suggestions ("Goes well with…")
- Estimated pickup/wait time based on order volume

---

## B. Pre-Orders & On-Site Commerce

### Pre-Order Flow

```
Browse menu → Add to cart → Checkout (standalone or with ticket)
     → Payment → Confirmation → Pickup QR / order number
     → Redeem at bar/kitchen → Mark fulfilled
```

| Step | Detail |
|------|--------|
| **Cart** | Separate F&B cart or unified with ticket checkout |
| **Pickup slot** | Optional time window ("8:00–8:30pm") to smooth kitchen load |
| **Payment** | Pay now (Stripe) or "Pay at venue" (creator setting) |
| **Link to ticket** | Order tied to attendee ticket QR — one scan for entry + orders |
| **Confirmation** | Push + email with order summary and pickup code |
| **Reminders** | "Your order is ready for pickup" (staff marks ready) |

### Order States

```
placed → confirmed → preparing → ready → picked_up
                  ↘ cancelled / refunded
```

### On-Site Ordering (Without Pre-Order)

- Order from app **during** event (after check-in)
- Optional table/zone number ("Bar area", "Table 12")
- Real-time queue position: "~8 min wait"
- Re-order favorites from pre-event cart
- Close ordering X minutes before event ends

### Group Orders

- One person places order for table/group
- Split payment or single payer
- Assign items to attendees in group
- Shared cart for "friends going" group

### Bundles & Packages

| Bundle | Example |
|--------|---------|
| Ticket + meal | "GA + Burger combo" — single checkout |
| Ticket + drink tokens | "VIP includes 3 drinks" |
| Tasting flight | Pre-order 5 wines as one SKU |
| Table package | "Table for 4 with bottle service" |

---

## C. Included Perks (Entry Benefits)

Creators attach **complimentary benefits** to ticket tiers — redeemed on entry or anytime during the event.

### Perk Types

| Perk | Example | Redemption |
|------|---------|------------|
| **Welcome drink** | 1 cocktail on arrival | Bar scan |
| **Drink tokens** | 3 tokens, any beer/wine | Token deducted per scan |
| **Food item** | Free appetizer | Kitchen scan |
| **Merch** | Event t-shirt | Merch desk scan |
| **VIP access** | Backstage, lounge | Secondary QR or wristband |
| **Parking** | Free parking pass | Parking scan |
| **Credit** | $15 bar tab included | Balance decrements per item |

### Configuration (Creator)

- Attach perks to **ticket type** (GA = 1 drink, VIP = 3 drinks + merch)
- Define eligible menu items or categories ("Any beer or house wine")
- Set redemption window ("Welcome drink: first 2 hours only")
- Allow **partial redemption** (used 2 of 3 tokens)
- Transfer unused perks? (creator policy — usually no)

### Attendee Experience

- **Ticket wallet** shows perk cards with remaining balance
  - "🍹 Welcome drink — Available"
  - "🎟️ Drink tokens — 2 of 3 left"
- Tap perk → show redemption QR (or auto-attach to main ticket scan)
- Haptic + animation on successful redeem
- History: what was redeemed, when, where

### Staff Redemption

- Scanner mode: after valid ticket, show **included perks**
- Tap perk to redeem → decrements balance
- Prevents double redemption (server-side lock)
- Override with manager PIN (disputes)
- Bar display: "Jane D. — House wine (included)"

---

## D. Bar, Kitchen & F&B Staff Views

Dedicated operational UI (tablet/phone) for venue staff.

### Order Queue (Kitchen Display / Bar Display)

- Columns: New → Preparing → Ready → Picked up
- Order number, name, items, modifiers, pickup slot
- Sound/ping on new order
- Bump order to next stage
- Filter: bar only / kitchen only

### Redemption Scanner

- Scan ticket → show perks + pre-orders
- Fulfill pre-order or redeem perk in one flow
- Manual lookup by name

### Inventory Quick Actions

- Mark item sold out (86) — syncs to menu instantly
- Adjust remaining stock

### Shift Report

- Orders fulfilled, perks redeemed, revenue (pre-paid vs at-venue)
- Export for venue accounting

---

## E. Attendee Memories (Post-Event Social Content)

**The social proof engine.** Past attendees rate, review, and publish photos/videos that appear on the event archive and on **future events from the same creator**.

### Who Can Post

| Rule | Rationale |
|------|-----------|
| **Checked-in attendees only** | Verified authentic experiences |
| **Window opens at check-in** | Live content during event |
| **Window closes X days after** | Fresh memories, moderation window |
| Creator can extend or close early | Control for sensitive events |

### Content Types

| Type | Spec |
|------|------|
| **Star rating** | 1–5 overall + optional sub-ratings (Vibe, Venue, Value, Food & Drinks, Organization) |
| **Written review** | Text, @mentions, emoji |
| **Photos** | Multiple per review, gallery |
| **Videos** | Short clips (15–60s), reels-style vertical |
| **Quick reaction** | "🔥 Would go again" one-tap (low friction) |

### Memory Post Anatomy

- User avatar + "Verified attendee" badge
- Star rating + text
- Media carousel (swipe photos/video)
- Event name + date (linked)
- Like, comment, share
- Timestamp ("Posted 2 days after event")

### Where Memories Appear

| Surface | Content |
|---------|---------|
| **Past event page** | Memories tab — full gallery + reviews |
| **Creator page** | "Community" tab — aggregated memories across events |
| **Future event page** | **"From [Creator]'s past events"** — carousel of best photos, avg rating, video highlights |
| **Feed** | Memories from friends and followed creators |
| **Search** | Discover events with high-rated memories |

### Social Proof on Future Events

When browsing a **new** event from a creator who has run events before:

```
┌─────────────────────────────────────────┐
│  ★ 4.8  from 240 verified attendees   │
│  "Amazing vibe every time" — @user    │
│  [photo] [photo] [video thumb] →      │
│  See 89 memories from past events     │
└─────────────────────────────────────────┘
```

- Aggregate rating across creator's events (weighted recent)
- Highlight reel (creator-curated or auto top engagement)
- Video testimonial clips
- "X% would attend again" (from quick reaction)

### Engagement on Memories

- Like, comment, share (in-app + external)
- Creator **reply** to reviews (public)
- Creator **pin** best memories to page or next event
- Creator **feature** on event announcement
- Attendees tag friends in photos (with consent flow)
- "Helpful" vote on reviews (like Amazon)

### Feed Integration

- Memories appear in home feed as rich media cards
- "Sarah posted a video from Neon Nights" → tap to view
- Algorithm boosts high-engagement memories from followed creators
- **Memory streaks** — badge for contributing to 5 event albums

---

## F. Live Event Social (During the Event)

Bridge between pre-order and post-event memories.

| Feature | Description |
|---------|-------------|
| **Live stories** | Attendees with check-in post 24h stories (creator moderation) |
| **Live photo wall** | Opt-in photos appear on venue screen / event page |
| **Live reactions** | Emoji rain during headline moment (synced optional) |
| **Event chat** | Ticket holders only, pre/during event |
| **"I'm here"** | Check-in post to feed with optional photo |
| **Song/ moment tagging** | "This track!" timestamped (music events) |

---

## G. Creator Tools for Hospitality & Memories

### Menu Analytics
- Top pre-ordered items
- Revenue: F&B vs tickets
- Peak order times → staffing insights
- Perk redemption rate ("60% used welcome drink")
- Waste insight: pre-ordered but not picked up

### Memories Analytics
- Average rating trend over events
- Sentiment breakdown (sub-ratings)
- Most liked attendee content
- Review response rate
- Conversion lift: "users who viewed memories → 2x more likely to book"

### Moderation
- Hide individual memory posts
- Disable memories for specific event (private gala)
- Require approval before publish (optional)
- Block users from posting
- Report queue integration

---

## H. Enriched Ideas (Full List)

### Hospitality & Commerce

| Idea | Description | Phase |
|------|-------------|-------|
| **Menu templates** | Reuse across events, share between page team | 2 |
| **Vendor accounts** | Food truck owns their menu slice, split payout | 3 |
| **Open tab** | Run a tab on ticket, settle at end of night | 4 |
| **Cashless wristband** | Top-up balance, tap to pay (festival) | 4 |
| **Tip on pre-order** | Optional tip for bar staff | 2 |
| **Allergen quiz** | Attendee saves allergen profile, menu filters auto | 2 |
| **Chef's special** | Creator pushes limited item notification mid-event | 2 |
| **Recipe card** | Post-event: share cocktail recipe as memory | 3 |
| **Sustainability** | Mark reusable cup discount, local sourcing badges | 3 |
| **Nutritional info** | Calories, macros per item | 3 |
| **Subscription coffee** | Monthly café event pass (creator loyalty) | 3 |
| **Corporate catering** | Bulk pre-order for team events | 3 |
| **Waitlist for items** | Notify when sold-out item returns | 2 |
| **Price surge awareness** | Show "high demand" on popular items | 2 |
| **Kitchen load balancer** | Suggest alternate pickup slot when busy | 2 |
| **POS integration** | Square/Toast sync for venues with existing POS | 4 |
| **Print queue** | Auto-print orders to bar printer | 2 |
| **Commission on F&B** | Platform fee on menu sales (revenue stream) | 2 |

### Memories & Social Proof

| Idea | Description | Phase |
|------|-------------|-------|
| **Verified attendee badge** | On every review and memory | 2 |
| **Review raffle** | Creator: "Review for chance to win free entry" | 2 |
| **Highlight reel auto-gen** | AI selects best clips → promo video for next event | 3 |
| **Creator response** | Public reply to reviews | 2 |
| **Memory contests** | "Best photo wins VIP next event" | 2 |
| **Before/after** | Creator posts setup vs crowd shot; attendees add theirs | 3 |
| **Event hashtag hub** | Aggregate #EventName from in-app posts | 2 |
| **Attendee portfolio** | Public "Events I've been to" on profile | 2 |
| **Reputation score** | Creator aggregate rating visible on page | 2 |
| **Video testimonials** | Pin 15s clips to top of future event page | 2 |
| **Memory reactions** | React with 🔥😍🙌 beyond like | 2 |
| **Collaborative album** | All attendee photos in one shared album | 2 |
| **Year in review** | Creator gets annual recap video (Spotify Wrapped style) | 3 |
| **Cross-event narrative** | "You've been to 3 of their events" on booking | 2 |
| **FOMO counter** | "127 memories from last edition" on repeat event | 2 |
| **Duet/stitch** | React to creator's recap video with your clip | 4 |
| **Memory NFT** | Collectible attendance proof (niche, optional) | 4 |
| **Influencer tagging** | Tag creator partners in memories | 2 |
| **Moderation AI** | Auto-blur faces opt-out, NSFW filter | 2 |
| **GDPR memory removal** | Attendee deletes their content anytime | 1 |

### Social Network Depth

| Idea | Description | Phase |
|------|-------------|-------|
| **Event-centric feed** | Every card is event-related (no generic noise) | 1 |
| **Activity graph** | "Users who liked this also attended…" | 3 |
| **Creator fan tiers** | Superfans badge after N events attended | 3 |
| **Social RSVP** | "I'm thinking of going" lightweight intent | 1 |
| **Polls** | "Which DJ set are you here for?" | 2 |
| **Countdown together** | Followers get synced countdown notification | 1 |
| **Post-event hangout** | Creator schedules afterparty, attendees invited | 2 |
| **Meet people going** | Opt-in networking before event | 3 |
| **Shared playlists** | Collaborative Spotify for event | 2 |
| **Creator broadcast** | Push to all past attendees of similar events | 3 |

---

## I. Trust & Safety

| Concern | Mitigation |
|---------|------------|
| Fake reviews | Check-in required, one review per ticket |
| Inappropriate media | AI + report + creator hide |
| Alcohol to minors | Age verify at ticket + perk redemption |
| Food safety liability | Creator accepts terms; allergen disclaimers |
| Refund on pre-orders | Policy per event; partial if prepared |
| Double perk redemption | Server-side atomic decrement |
| Order fraud | Rate limits, payment verification |

---

## J. Revenue Opportunities

| Stream | Model |
|--------|-------|
| F&B platform fee | % on pre-orders (lower than ticket fee) |
| Featured menu items | Promoted placement on menu |
| Vendor marketplace | Subscription for food vendors on platform |
| Memory marketing | Creator Pro: use UGC in ads/export |
| Sponsored perks | Brand sponsors "free drink" (e.g., Red Bull) |

---

## K. Integration Points

```
events
  ├── menus → menu_categories → menu_items
  ├── menu_orders → menu_order_items
  ├── ticket_perks → perk_redemptions
  └── memories → memory_media

tickets ──► menu_orders (link)
tickets ──► perk_redemptions (link)
check_ins ──► memories (eligibility gate)
pages ──► menu_templates (reuse)
pages ──► aggregate_rating (denormalized)
```

See [06-database-schema-plan.md](06-database-schema-plan.md) and [07-api-design.md](07-api-design.md) for schema and endpoints.
