# 08 — UX/UI Direction

## Design Vision

**"Social discovery meets game-level polish."**

The app should feel alive — not a static list of events. Think: the satisfaction of unlocking something in a game, applied to discovering and attending real-world events.

### Reference Inspirations (Mood, Not Copy)

| Reference | What to Borrow |
|-----------|----------------|
| **Instagram** | Feed cards, stories, profile pages |
| **Airbnb** | Map + list dual view, filters |
| **Duolingo / Apple Fitness** | Micro-animations, progress, celebrations |
| **Rive / Lottie** | Character animations, loading states |
| **Stripe** | Clean checkout, trust signals |
| **Dice / Resident Advisor** | Event culture aesthetic |

---

## Design System Foundations

### Typography
- **Display:** Bold geometric sans (e.g., Clash Display, Satoshi, or custom)
- **Body:** Clean readable sans (e.g., Inter, Geist)
- **Mono:** Ticket codes, order numbers

### Color Palette (Dark-First)

```
Background:     #0A0A0F (deep space black)
Surface:        #14141F (cards, elevated)
Surface-2:      #1E1E2E (modals, sheets)
Primary:        #7C3AED (electric violet) — CTAs, active states
Secondary:      #06B6D4 (cyan) — accents, map pins
Success:        #10B981 — valid ticket, confirmed
Warning:        #F59E0B — low tickets, hold expiring
Error:          #EF4444 — sold out, invalid scan
Text-primary:   #F8FAFC
Text-muted:     #94A3B8
Gradient hero:  violet → cyan → pink (event covers overlay)
```

Light mode: Phase 2 (dark-first for nightlife/culture positioning)

### Spacing & Radius
- Base unit: 4px
- Card radius: 16px
- Button radius: 12px (pill for primary CTAs)
- Bottom sheets: 24px top radius

### Motion Principles
1. **Purposeful** — animation communicates state change
2. **Fast** — 200–300ms for UI; 400–600ms for celebrations
3. **Spring physics** — slight overshoot on cards and buttons
4. **Stagger** — list items animate in sequence
5. **Haptics** — light impact on like, medium on purchase success, heavy on check-in

---

## App Views & Navigation

### Attendee App (Mobile) — Tab Bar

```
┌─────────────────────────────────────────┐
│                                         │
│              [Screen Content]           │
│                                         │
├─────────┬─────────┬─────────┬───────────┤
│  Home   │   Map   │ Explore │  Tickets  │  Profile
│  (Feed) │         │ (Search)│  (Wallet) │
└─────────┴─────────┴─────────┴───────────┘
```

### Creator Mode Toggle
- Profile → "Switch to Creator" → different tab bar:
  - **Dashboard** | **Events** | **Create (+)** | **Analytics** | **Page**

### Staff Scanner App
- Minimal: **Scan** | **Guest List** | **Stats**
- High contrast, large tap targets, works in dark venues

---

## Key Screens

### 1. Home Feed
- Vertical scroll of event cards and posts
- Card anatomy:
  - Full-bleed cover image/video (auto-play muted)
  - Gradient overlay bottom
  - Creator avatar + name (tap → page)
  - Event title, date, location pill
  - Price badge (FREE / $25)
  - Action row: Like | Comment | Share | Save
- Pull-to-refresh with custom animation
- "Friends going" avatars stacked on card

### 2. Map View
- Full-screen map, dark styled
- Clustered pins animate on zoom
- Category color coding
- Bottom sheet preview on pin tap (half height)
- Filter chips floating top
- "List" toggle → split or full list view

### 3. Event Detail
- Parallax hero (cover scrolls slower than content)
- Sticky bottom CTA: "Get Tickets" / "RSVP Free"
- Tabs: About | Menu | Lineup | Location | Memories | Comments
- **Menu tab** — food photo grid, dietary filter chips, "Pre-order" FAB
- **Memories tab** (past events) — masonry gallery of attendee photos/videos, rating summary
- **Social proof block** (future events) — "★ 4.8 from 240 attendees" + highlight carousel from creator's past events
- Sections: About | Lineup | Location (mini map)
- Countdown timer to event start (animated flip digits)
- Share button → beautiful share card generator (image for Instagram Stories)
- Similar events carousel at bottom

### 4. Seat Map (Seated Events)
- Pinch-zoom interactive venue map
- Seats: available (outline), selected (filled primary), sold (muted), held (pulsing)
- Section quick-jump chips
- Selected seats tray at bottom with total
- Hold timer bar (depleting animation, turns red < 2min)

### 5. Checkout
- Step indicator (animated progress)
- Order summary card
- Custom questions inline
- Promo code expandable
- Payment: Apple Pay / Google Pay prominent
- Success: **celebration animation** (confetti, ticket flip reveal, haptic burst)

### 6. Ticket Wallet
- Stack of ticket cards (swipeable)
- QR code large, brightness boost on tap
- Ticket flip animation: front = art, back = QR + details
- **Perk cards** below ticket — drink tokens with animated "pop" on redeem
- **Pre-orders** section — pickup code, status pill (Preparing / Ready 🔔)
- Add to Apple Wallet button
- Transfer / refund actions in overflow menu

### 6b. Menu & Pre-Order
- Full-screen menu with category sticky nav
- Item cards: photo, price, dietary icons, "Add" button with micro-bounce
- Cart bottom sheet with pickup time slot picker
- Checkout merges with ticket or standalone
- Order tracking: progress bar (Placed → Preparing → Ready)
- "Ready!" notification → pulsing pickup code screen

### 6c. Post Memory (After Event)
- Triggered after check-in or push "Share your night"
- Star rating with haptic per star
- Sub-rating sliders (Vibe, Venue, Value, Food)
- Photo/video picker with reels-style trim
- "Verified attendee" badge on preview
- Post success → confetti + "Your memory is live"
- Memory card in feed: media carousel, like/comment row

### 7. Creator Page
- Banner + avatar (Instagram-like)
- Follow button with follower count animation on tap
- Tabs: Events | Posts | Community | About
- **Community tab** — aggregated memories, avg rating, top photos grid
- Verified badge shimmer

### 8. Creator Event Editor (Web + Mobile)
- Step wizard: Details → Media → Tickets → Menu → Perks → Seating → Publish
- Live preview panel (web)
- Drag-drop media upload with progress orbs
- Seating: visual editor with snap grid

### 9. Scanner View (Staff)
- Full-screen camera viewfinder
- Scan frame with animated corners
- Result overlay:
  - ✅ Green flash + name + ticket type (0.5s, auto-dismiss)
  - ⚠️ Yellow: already scanned + timestamp
  - ❌ Red shake: invalid
- **Perks panel** — tap to redeem welcome drink / tokens
- **Pre-orders panel** — mark order picked up
- Vibration patterns per result
- Attendance counter top-right (live updating)

### 9b. Bar / Kitchen Display (Staff Tablet)
- Kanban columns: New | Preparing | Ready
- Large order cards with item list and modifiers
- New order ping animation + sound
- Tap to bump status
- Sold-out quick action on menu items
- Dark high-contrast theme for venue lighting

### 10. Analytics Dashboard (Creator Web)
- Cards with animated number count-up on load
- Charts: revenue line, ticket sales bar, traffic sources donut
- Real-time pulse dot during live on-sale

---

## Animation Catalog

| Interaction | Animation |
|-------------|-----------|
| Like button | Heart scale pop + particle burst |
| Follow | Button morph + count increment roll |
| Card appear | Fade up + stagger 50ms |
| Tab switch | Shared element transition (hero image) |
| Pull refresh | Custom loader (bouncing pin or logo) |
| Ticket purchase success | Confetti + ticket card 3D flip |
| Check-in valid | Green ripple from scan point |
| Sold out | Gray wash + subtle lock icon shake |
| Countdown | Flip clock digits |
| Map pin select | Bounce + pulse ring |
| Bottom sheet | Spring slide up |
| Perk redeemed | Token "pop" + count decrement roll |
| Order ready | Bell shake + pickup code glow pulse |
| Memory posted | Camera shutter + card fly into feed |
| Star rating | Stars fill with stagger + haptic per star |
| Menu add to cart | Item flies to cart icon (shared element) |

**Tooling:** Rive (interactive animations), Lottie (one-shots), Framer Motion (web), React Native Reanimated (mobile)

---

## Gamification UI Elements

| Element | Implementation |
|---------|----------------|
| Attendance badges | Collectible card design, foil effect on rare |
| Creator levels | XP bar in profile, level-up modal |
| Streaks | Fire icon with day count |
| Event countdown | Urgency without anxiety — playful not aggressive |
| "Going" social proof | Friend avatar stack with +N |

---

## Accessibility

- WCAG 2.1 AA minimum
- All animations respect `prefers-reduced-motion`
- QR codes have alt text + manual code fallback
- Seat map keyboard navigable (web)
- Color not sole indicator (icons + labels for seat status)
- Min touch target 44×44pt
- Screen reader labels on all interactive elements

---

## Responsive Breakpoints (Web)

| Breakpoint | Layout |
|------------|--------|
| Mobile < 768px | Single column, bottom nav |
| Tablet 768–1024px | Two column, side nav collapsed |
| Desktop > 1024px | Side nav, creator dashboard multi-panel |

---

## Share & Viral Assets

Auto-generated share images (OG + Stories format):
- Event cover + title + date + creator logo
- "I'm going!" variant with user avatar
- QR code to event page
- Branded frame (platform watermark subtle)

---

## Empty States

Never boring placeholders — use illustration/animation:
- Feed empty: "Follow creators to fill your feed" + suggestions
- No tickets: Animated empty wallet + discover CTA
- Map empty area: "No events here — try expanding search"
- Creator no events: Onboarding wizard to create first event

---

## Sound Design (Optional, Off by Default)

- Purchase success: subtle chime
- Check-in valid: soft ping
- User enables in settings

---

## Design Deliverables (Pre-Development)

1. **Figma design system** — tokens, components, icons
2. **Key screen mockups** — 10 screens above
3. **Prototype** — feed scroll + checkout + scan flow
4. **Rive files** — loader, success, like animation
5. **Icon set** — custom or Phosphor / Lucide extended
