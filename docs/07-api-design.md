# 07 — API Design

REST API with `/api/v1` prefix. JSON request/response. OpenAPI (Swagger) documentation auto-generated from NestJS decorators.

## Conventions

### Authentication
```
Authorization: Bearer <access_token>
```

Refresh token: `POST /api/v1/auth/refresh` (httpOnly cookie on web)

### Response Envelope
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Format
```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "One or more selected seats are no longer available",
    "details": { "seatIds": ["uuid-1", "uuid-2"] }
  }
}
```

### Pagination
- Cursor-based for feeds: `?cursor=<opaque>&limit=20`
- Offset for admin lists: `?page=1&limit=20`

### Idempotency
Payment and order endpoints accept:
```
Idempotency-Key: <uuid>
```

---

## Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Email + password signup |
| POST | `/auth/login` | Login, returns tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/oauth/:provider` | Google, Apple |
| POST | `/auth/magic-link` | Send magic link email |
| GET | `/auth/magic-link/verify` | Verify magic link token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/2fa/enable` | Enable 2FA (creator) |

---

## Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile |
| GET | `/users/:username` | Public profile |
| GET | `/users/me/tickets` | My ticket wallet |
| GET | `/users/me/saved-events` | Bookmarked events |
| GET | `/users/me/notifications` | Notifications list |
| PATCH | `/users/me/notifications/:id/read` | Mark read |
| POST | `/users/me/device-tokens` | Register push token |
| GET | `/users/me/following` | Pages and users I follow |

---

## Pages (Creator)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/pages` | Create page |
| GET | `/pages/:handle` | Public page profile |
| PATCH | `/pages/:id` | Update page (owner/admin) |
| GET | `/pages/:id/events` | Page events (upcoming/past) |
| GET | `/pages/:id/posts` | Page posts |
| POST | `/pages/:id/follow` | Follow page |
| DELETE | `/pages/:id/follow` | Unfollow |
| GET | `/pages/:id/followers` | Follower list |
| GET | `/pages/:id/analytics` | Analytics dashboard |
| POST | `/pages/:id/members` | Invite team member |
| PATCH | `/pages/:id/members/:userId` | Update role |
| DELETE | `/pages/:id/members/:userId` | Remove member |
| POST | `/pages/:id/payout/connect` | Start Stripe Connect onboarding |
| GET | `/pages/:id/payout/status` | Payout account status |

---

## Events

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events` | Create event (draft) |
| GET | `/events/:id` | Event detail |
| GET | `/events/slug/:pageHandle/:slug` | Public SEO URL |
| PATCH | `/events/:id` | Update event |
| DELETE | `/events/:id` | Soft delete |
| POST | `/events/:id/publish` | Publish event |
| POST | `/events/:id/cancel` | Cancel event |
| GET | `/events/:id/attendees` | Attendee list (staff) |
| GET | `/events/:id/stats` | Stats (creator) |
| POST | `/events/:id/media` | Attach media |
| POST | `/events/:id/duplicate` | Duplicate as draft |

### Discovery

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feed` | Personalized feed |
| GET | `/discover` | For You algorithmic |
| GET | `/events` | List with filters |
| GET | `/events/map` | Bounding box query |
| GET | `/search` | Full-text search |
| GET | `/categories` | Category list |
| GET | `/collections/:slug` | Editorial collection |

**Query params for `/events` and `/events/map`:**
```
?category=music
&dateFrom=2026-07-10
&dateTo=2026-07-20
&price=free|paid
&format=standing|seated
&lat=40.7&lng=-74.0&radius=10
&bbox=-74.1,40.6,-73.9,40.8
&q=techno
```

---

## Social

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events/:id/like` | Like event |
| DELETE | `/events/:id/like` | Unlike |
| GET | `/events/:id/comments` | List comments |
| POST | `/events/:id/comments` | Add comment |
| PATCH | `/comments/:id` | Edit own comment |
| DELETE | `/comments/:id` | Delete comment |
| POST | `/events/:id/share` | Record share |
| POST | `/events/:id/save` | Bookmark |
| DELETE | `/events/:id/save` | Remove bookmark |
| GET | `/events/:id/memories` | List attendee memories (photos, videos, reviews) |
| GET | `/pages/:handle/memories` | Aggregated memories across creator events |
| GET | `/pages/:handle/rating` | Aggregate rating + social proof summary |
| POST | `/users/:id/follow` | Follow user |
| DELETE | `/users/:id/follow` | Unfollow |

---

## Ticketing & Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/:id/ticket-types` | Available ticket types |
| POST | `/events/:id/orders` | Create order (checkout start) |
| GET | `/orders/:id` | Order status |
| POST | `/orders/:id/confirm` | Confirm free RSVP |
| POST | `/orders/:id/payment-intent` | Create Stripe PaymentIntent |
| POST | `/orders/:id/apply-promo` | Apply promo code |
| POST | `/tickets/:id/transfer` | Transfer ticket |
| POST | `/tickets/:id/refund-request` | Request refund |
| GET | `/tickets/:id` | Ticket detail + QR |

### Checkout Flow (Paid)
```
1. POST /events/:id/orders
   Body: { ticketTypeId, quantity, seatIds?, attendeeInfo, customAnswers }

2. POST /orders/:id/payment-intent
   Returns: { clientSecret }

3. Client confirms payment with Stripe SDK

4. Webhook payment_intent.succeeded → tickets issued

5. GET /orders/:id → { status: "paid", tickets: [...] }
```

---

## Seating

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/:id/seat-map` | Layout + availability |
| POST | `/events/:id/seats/hold` | Hold seats (TTL 10min) |
| DELETE | `/events/:id/seats/hold` | Release holds |
| GET | `/venues` | Creator's venues |
| POST | `/venues` | Create venue |
| POST | `/venues/:id/layouts` | Create layout |
| PATCH | `/layouts/:id` | Update layout editor state |
| POST | `/layouts/:id/sections` | Add section |
| POST | `/sections/:id/seats` | Bulk create seats |

**WebSocket:** `ws://api/ws/events/:id/seats` — real-time availability updates

---

---

## Event Menus & Pre-Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/:id/menu` | Full menu with categories, items, availability |
| POST | `/events/:id/menu` | Create/attach menu (creator) |
| PATCH | `/events/:id/menu` | Update menu settings |
| POST | `/menu-templates` | Save reusable template |
| GET | `/pages/:id/menu-templates` | List page menu templates |
| PATCH | `/menu-items/:id` | Update item (price, 86 sold out) |
| POST | `/events/:id/menu-orders` | Place pre-order or on-site order |
| GET | `/menu-orders/:id` | Order status + pickup code |
| PATCH | `/menu-orders/:id/status` | Staff: preparing → ready → picked_up |
| GET | `/events/:id/menu-orders/queue` | Staff order queue (filtered by status) |

**Pre-order body:**
```json
{
  "items": [
    { "menuItemId": "uuid", "quantity": 2, "modifiers": { "size": "large" } }
  ],
  "ticketId": "uuid",
  "pickupSlotStart": "2026-07-10T20:00:00Z",
  "pickupSlotEnd": "2026-07-10T20:30:00Z",
  "tipCents": 200,
  "payAtVenue": false
}
```

---

## Ticket Perks (Included Benefits)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ticket-types/:id/perks` | Perks attached to ticket type |
| POST | `/ticket-types/:id/perks` | Add perk (creator) |
| GET | `/tickets/:id/perks` | Attendee perk balances |
| POST | `/perks/redeem` | Staff redeem perk |
| Body | `{ ticketId, perkId, menuItemId?, quantity: 1 }` | |

**Perk balance response:**
```json
{
  "perks": [
    {
      "id": "uuid",
      "name": "Welcome drink",
      "type": "drink",
      "total": 1,
      "used": 0,
      "available": 1,
      "expiresAt": "2026-07-10T22:00:00Z"
    }
  ]
}
```

---

## Attendee Memories (UGC)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events/:id/memories` | Create memory (requires check-in) |
| GET | `/memories/:id` | Single memory detail |
| PATCH | `/memories/:id` | Edit own memory |
| DELETE | `/memories/:id` | Delete own memory |
| POST | `/memories/:id/like` | Like memory |
| DELETE | `/memories/:id/like` | Unlike |
| GET | `/memories/:id/comments` | Comments on memory |
| POST | `/memories/:id/comments` | Comment on memory |
| POST | `/memories/:id/reply` | Creator public reply |
| POST | `/memories/:id/pin` | Creator pin memory |
| POST | `/memories/:id/hide` | Creator hide memory |
| GET | `/events/:id/memories/highlights` | Top photos/videos for social proof |
| GET | `/events/:id/social-proof` | Aggregate rating + highlight carousel for future event page |

**Create memory body:**
```json
{
  "type": "review",
  "rating": 5,
  "subRatings": { "vibe": 5, "venue": 4, "value": 5, "foodDrinks": 5 },
  "body": "Best night of the summer!",
  "mediaIds": ["uuid-1", "uuid-2"]
}
```

---

## Check-In (Staff)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/check-in/scan` | Validate QR code |
| Body | `{ code, eventId, deviceId }` | |
| GET | `/events/:id/check-in/sync` | Download attendee list (offline) |
| POST | `/check-in/batch` | Batch sync offline scans |
| GET | `/events/:id/check-in/stats` | Live attendance count |
| POST | `/check-in/manual` | Manual lookup check-in |

**Scan Response:**
```json
{
  "valid": true,
  "ticket": {
    "id": "uuid",
    "attendeeName": "Jane Doe",
    "ticketType": "VIP",
    "seat": "A-12"
  },
  "alreadyCheckedIn": false,
  "perks": [
    { "id": "uuid", "name": "Welcome drink", "available": 1 }
  ],
  "menuOrders": [
    { "id": "uuid", "pickupCode": "A42", "status": "ready", "items": ["House wine x1"] }
  ]
}
```

---

## Media

| Method | Path | Description |
|--------|------|-------------|
| POST | `/media/upload-url` | Get presigned S3 URL |
| Body | `{ filename, mimeType, size }` | |
| GET | `/media/:id` | Media status + URLs |
| DELETE | `/media/:id` | Delete (if unused) |

---

## Webhooks (Inbound)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/stripe` | Stripe events |
| POST | `/webhooks/media` | Transcoding complete |

---

## Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/reports` | Moderation queue |
| PATCH | `/admin/reports/:id` | Resolve report |
| POST | `/admin/users/:id/verify` | Verify creator |
| POST | `/admin/users/:id/suspend` | Suspend user |
| GET | `/admin/events` | All events with filters |
| POST | `/admin/collections` | Create editorial collection |

---

## Rate Limits (Suggested)

| Endpoint Group | Limit |
|----------------|-------|
| Auth (login) | 5/min per IP |
| General API | 100/min per user |
| Search | 30/min per user |
| Checkout | 10/min per user |
| Check-in scan | 120/min per device |

---

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `seat:updated` | Server → Client | `{ seatId, status }` |
| `checkin:count` | Server → Client | `{ eventId, count }` |
| `menu_order:updated` | Server → Client | `{ orderId, status }` |
| `menu_item:availability` | Server → Client | `{ itemId, isAvailable }` |
| `notification` | Server → Client | `{ notification }` |

---

## API Versioning & Deprecation

- Breaking changes → `/api/v2`
- Sunset header on deprecated endpoints: `Sunset: Sat, 01 Jan 2028 00:00:00 GMT`
- Minimum 6-month deprecation window
