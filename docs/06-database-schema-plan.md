# 06 — Database Schema Plan

PostgreSQL with PostGIS. UUIDs for primary keys. All tables include `created_at`, `updated_at`; soft delete via `deleted_at` where noted.

---

## Entity Relationship Overview

```
users ──────────────┬────────────── pages ────────────── events
  │                 │                  │                    │
  │                 │                  │                    ├── event_media
  │                 │                  │                    ├── ticket_types
  │                 │                  │                    ├── orders
  │                 │                  │                    └── venue_layouts
  │                 │                  │
  ├── follows ──────┤                  └── page_members
  ├── likes         │
  ├── comments      └── page_follows
  └── notifications

orders ─── order_items ─── tickets ─── check_ins
                │              │
                └── payments   ├── perk_redemptions
                               └── menu_orders

events ─── menus ─── menu_items
       ├── memories (UGC reviews, photos, videos)
       ├── ticket_perks
       └── menu_orders
```

---

## Core Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| phone | VARCHAR UNIQUE | nullable |
| password_hash | VARCHAR | nullable if OAuth |
| display_name | VARCHAR | |
| username | VARCHAR UNIQUE | @handle |
| avatar_url | VARCHAR | |
| bio | TEXT | |
| location | GEOGRAPHY(POINT) | PostGIS |
| email_verified_at | TIMESTAMPTZ | |
| phone_verified_at | TIMESTAMPTZ | |
| settings | JSONB | notification prefs, privacy |
| deleted_at | TIMESTAMPTZ | soft delete |

### `user_oauth_accounts`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| provider | ENUM | google, apple |
| provider_user_id | VARCHAR | |
| UNIQUE(provider, provider_user_id) | | |

### `pages` (Creator Pages)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| owner_id | UUID FK → users | |
| name | VARCHAR | |
| handle | VARCHAR UNIQUE | @pagehandle |
| description | TEXT | |
| avatar_url | VARCHAR | |
| banner_url | VARCHAR | |
| location | GEOGRAPHY(POINT) | |
| website | VARCHAR | |
| social_links | JSONB | |
| is_verified | BOOLEAN | |
| stripe_account_id | VARCHAR | Stripe Connect |
| settings | JSONB | branding, policies |
| deleted_at | TIMESTAMPTZ | |

### `page_members`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK | |
| user_id | UUID FK | |
| role | ENUM | admin, editor, manager, scanner, promoter |
| event_ids | UUID[] | nullable; scope to specific events |
| UNIQUE(page_id, user_id) | | |

### `page_follows`
| Column | Type | Notes |
|--------|------|-------|
| follower_id | UUID FK → users | |
| page_id | UUID FK → pages | |
| created_at | TIMESTAMPTZ | |
| PRIMARY KEY(follower_id, page_id) | | |

### `user_follows`
| Column | Type | Notes |
|--------|------|-------|
| follower_id | UUID FK | |
| following_id | UUID FK | |
| PRIMARY KEY(follower_id, following_id) | | |

---

## Events

### `events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK → pages | |
| slug | VARCHAR | unique per page |
| title | VARCHAR | |
| description | TEXT | markdown |
| status | ENUM | draft, scheduled, published, live, ended, cancelled, archived |
| visibility | ENUM | public, unlisted, followers, private, password |
| password_hash | VARCHAR | if visibility=password |
| category_id | UUID FK | |
| tags | VARCHAR[] | |
| start_at | TIMESTAMPTZ | stored UTC |
| end_at | TIMESTAMPTZ | |
| timezone | VARCHAR | IANA e.g. America/Los_Angeles |
| location_name | VARCHAR | |
| address | TEXT | |
| location | GEOGRAPHY(POINT) | PostGIS |
| format | ENUM | standing, seated, hybrid |
| age_restriction | ENUM | all, 18, 21 |
| capacity | INT | for standing |
| cover_media_id | UUID FK → media | |
| settings | JSONB | refund policy, custom fields, etc. |
| published_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| UNIQUE(page_id, slug) | | |

**Indexes:** `(status, start_at)`, `(location)` GIST, `(page_id, status)`, full-text on title+description.

### `event_media`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| media_id | UUID FK → media | |
| sort_order | INT | |
| type | ENUM | image, video, cover |

### `event_lineup`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| name | VARCHAR | |
| role | VARCHAR | DJ, Speaker, etc. |
| image_url | VARCHAR | |
| sort_order | INT | |

### `event_agenda`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| title | VARCHAR | |
| start_at | TIMESTAMPTZ | |
| end_at | TIMESTAMPTZ | |
| description | TEXT | |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR | |
| slug | VARCHAR UNIQUE | |
| icon | VARCHAR | |
| parent_id | UUID FK | nullable, for subcategories |

---

## Social

### `likes`
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID FK | |
| target_type | ENUM | event, comment, post |
| target_id | UUID | |
| PRIMARY KEY(user_id, target_type, target_id) | | |

### `comments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| event_id | UUID FK | nullable |
| post_id | UUID FK | nullable |
| parent_id | UUID FK | threaded |
| body | TEXT | |
| deleted_at | TIMESTAMPTZ | |

### `shares`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| event_id | UUID FK | |
| channel | ENUM | in_app, link, native |

### `saved_events`
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID FK | |
| event_id | UUID FK | |
| PRIMARY KEY(user_id, event_id) | | |

### `posts` (Page announcements, non-event content)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK | |
| body | TEXT | |
| media_ids | UUID[] | |
| pinned | BOOLEAN | |

---

## Ticketing & Commerce

### `ticket_types`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| name | VARCHAR | GA, VIP, Early Bird |
| description | TEXT | |
| price_cents | INT | 0 = free |
| currency | CHAR(3) | USD, EUR |
| quantity_total | INT | nullable = unlimited |
| quantity_sold | INT | denormalized |
| sales_start_at | TIMESTAMPTZ | |
| sales_end_at | TIMESTAMPTZ | |
| min_per_order | INT | default 1 |
| max_per_order | INT | default 10 |
| sort_order | INT | |
| is_visible | BOOLEAN | hidden ticket types |
| section_id | UUID FK | nullable, for seated |

### `promo_codes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | nullable (page-wide) |
| page_id | UUID FK | |
| code | VARCHAR | |
| discount_type | ENUM | percent, fixed |
| discount_value | INT | |
| max_uses | INT | |
| uses_count | INT | |
| valid_from / valid_until | TIMESTAMPTZ | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_number | VARCHAR UNIQUE | human-readable |
| user_id | UUID FK | nullable (guest) |
| event_id | UUID FK | |
| email | VARCHAR | for guest |
| status | ENUM | pending, paid, failed, refunded, partial_refund |
| subtotal_cents | INT | |
| discount_cents | INT | |
| fees_cents | INT | platform fee |
| total_cents | INT | |
| currency | CHAR(3) | |
| stripe_payment_intent_id | VARCHAR | |
| promo_code_id | UUID FK | |
| custom_answers | JSONB | registration questions |
| created_at | TIMESTAMPTZ | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_id | UUID FK | |
| ticket_type_id | UUID FK | |
| seat_id | UUID FK | nullable |
| quantity | INT | usually 1 |
| unit_price_cents | INT | |

### `tickets`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_item_id | UUID FK | |
| event_id | UUID FK | denormalized for fast scan |
| ticket_type_id | UUID FK | |
| seat_id | UUID FK | nullable |
| attendee_name | VARCHAR | |
| attendee_email | VARCHAR | |
| qr_code | VARCHAR UNIQUE | or rotating token |
| status | ENUM | valid, used, transferred, refunded, cancelled |
| transferred_to_user_id | UUID FK | |
| created_at | TIMESTAMPTZ | |

### `check_ins`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK | |
| scanned_by_user_id | UUID FK | staff |
| scanned_at | TIMESTAMPTZ | |
| method | ENUM | qr, manual, nfc |
| device_id | VARCHAR | |
| location | GEOGRAPHY(POINT) | optional |
| notes | TEXT | override reason |

---

## Seating

### `venues`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK | owner |
| name | VARCHAR | |
| address | TEXT | |
| location | GEOGRAPHY(POINT) | |
| capacity | INT | |

### `venue_layouts`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| venue_id | UUID FK | |
| event_id | UUID FK | nullable; event-specific override |
| name | VARCHAR | |
| background_image_url | VARCHAR | |
| width | INT | canvas units |
| height | INT | |
| metadata | JSONB | editor state |

### `sections`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| layout_id | UUID FK | |
| name | VARCHAR | Orchestra, VIP |
| color | VARCHAR | hex |
| price_cents | INT | default for section |
| sort_order | INT | |

### `seats`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| section_id | UUID FK | |
| row_label | VARCHAR | A, B, 1, 2 |
| seat_number | VARCHAR | |
| x, y | FLOAT | position on layout |
| status | ENUM | available, held, sold, blocked |
| price_cents | INT | override section price |
| is_accessible | BOOLEAN | |
| metadata | JSONB | obstructed view, etc. |
| UNIQUE(section_id, row_label, seat_number) | | |

### `seat_holds` (Redis primary; DB audit optional)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| seat_id | UUID FK | |
| user_id | UUID FK | |
| session_id | VARCHAR | |
| expires_at | TIMESTAMPTZ | |
| order_id | UUID FK | nullable, after checkout start |

---

## Media

### `media`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| uploader_id | UUID FK → users | |
| type | ENUM | image, video |
| original_url | VARCHAR | S3 |
| processed_urls | JSONB | thumbnails, qualities |
| mime_type | VARCHAR | |
| size_bytes | BIGINT | |
| width, height | INT | |
| duration_seconds | INT | video |
| status | ENUM | uploading, processing, ready, failed |

---

## Notifications

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| type | VARCHAR | |
| title | VARCHAR | |
| body | TEXT | |
| data | JSONB | deep link payload |
| read_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### `device_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| token | VARCHAR | FCM/APNs |
| platform | ENUM | ios, android, web |

---

## Reviews & Moderation

### `reviews` (legacy simple rating — superseded by `memories` for rich UGC)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| user_id | UUID FK | |
| rating | SMALLINT | 1-5 |
| body | TEXT | |
| UNIQUE(event_id, user_id) | | |

### `memories` (Attendee post-event content)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| user_id | UUID FK | |
| ticket_id | UUID FK | verified attendee link |
| check_in_id | UUID FK | eligibility proof |
| type | ENUM | review, photo, video, quick_reaction |
| rating | SMALLINT | 1-5, nullable for media-only |
| sub_ratings | JSONB | vibe, venue, value, food_drinks |
| body | TEXT | review text |
| status | ENUM | published, hidden, pending, removed |
| likes_count | INT | denormalized |
| comments_count | INT | denormalized |
| creator_reply | TEXT | nullable |
| creator_reply_at | TIMESTAMPTZ | |
| pinned | BOOLEAN | creator pinned |
| UNIQUE(event_id, user_id) | | one memory post per user per event |

### `memory_media`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| memory_id | UUID FK | |
| media_id | UUID FK → media | |
| sort_order | INT | |

### `memory_likes`
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID FK | |
| memory_id | UUID FK | |
| PRIMARY KEY(user_id, memory_id) | | |

### `page_ratings` (denormalized aggregate)
| Column | Type | Notes |
|--------|------|-------|
| page_id | UUID PK | |
| avg_rating | DECIMAL(3,2) | |
| total_reviews | INT | |
| sub_rating_avgs | JSONB | |
| updated_at | TIMESTAMPTZ | |

---

## Event Menus & Pre-Orders

### `menu_templates`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK | |
| name | VARCHAR | "Standard bar menu" |
| type | ENUM | bar, cafe, restaurant, vendor, concessions |
| settings | JSONB | |

### `event_menus`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK | |
| template_id | UUID FK | nullable |
| type | ENUM | bar, cafe, restaurant, vendor, concessions |
| name | VARCHAR | |
| is_active | BOOLEAN | |
| preorder_enabled | BOOLEAN | |
| onsite_ordering_enabled | BOOLEAN | |
| pay_at_venue_enabled | BOOLEAN | |
| settings | JSONB | pickup slots, ordering hours |

### `menu_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| menu_id | UUID FK | |
| name | VARCHAR | Cocktails, Mains |
| sort_order | INT | |
| available_from | TIMESTAMPTZ | nullable, happy hour |
| available_until | TIMESTAMPTZ | nullable |

### `menu_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| category_id | UUID FK | |
| name | VARCHAR | |
| description | TEXT | |
| image_media_id | UUID FK | nullable |
| price_cents | INT | 0 = free/included |
| currency | CHAR(3) | |
| dietary_tags | VARCHAR[] | vegan, gluten_free, etc. |
| allergens | VARCHAR[] | |
| age_restricted | BOOLEAN | alcohol |
| stock_total | INT | nullable |
| stock_sold | INT | denormalized |
| max_per_order | INT | |
| max_per_person | INT | |
| prep_time_minutes | INT | |
| modifiers | JSONB | sizes, add-ons |
| is_available | BOOLEAN | manual 86 |
| sort_order | INT | |

### `menu_orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_number | VARCHAR UNIQUE | |
| event_id | UUID FK | |
| user_id | UUID FK | |
| ticket_id | UUID FK | nullable |
| status | ENUM | placed, confirmed, preparing, ready, picked_up, cancelled, refunded |
| subtotal_cents | INT | |
| tip_cents | INT | |
| total_cents | INT | |
| currency | CHAR(3) | |
| payment_status | ENUM | pending, paid, pay_at_venue, refunded |
| stripe_payment_intent_id | VARCHAR | nullable |
| pickup_slot_start | TIMESTAMPTZ | nullable |
| pickup_slot_end | TIMESTAMPTZ | nullable |
| pickup_code | VARCHAR | short code for bar |
| notes | TEXT | |
| fulfilled_at | TIMESTAMPTZ | |
| fulfilled_by_user_id | UUID FK | staff |

### `menu_order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| menu_order_id | UUID FK | |
| menu_item_id | UUID FK | |
| quantity | INT | |
| unit_price_cents | INT | snapshot at order time |
| modifiers_selected | JSONB | |
| special_instructions | TEXT | |

---

## Ticket Perks (Included Benefits)

### `ticket_perks`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_type_id | UUID FK | |
| name | VARCHAR | "Welcome drink" |
| perk_type | ENUM | drink, food, token, merch, access, credit, parking |
| quantity | INT | e.g., 3 tokens |
| eligible_menu_item_ids | UUID[] | nullable |
| eligible_category_ids | UUID[] | nullable |
| credit_cents | INT | for bar tab perks |
| redeem_from | TIMESTAMPTZ | nullable |
| redeem_until | TIMESTAMPTZ | nullable |
| description | TEXT | |

### `perk_redemptions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK | |
| ticket_perk_id | UUID FK | |
| quantity_redeemed | INT | usually 1 |
| redeemed_by_staff_id | UUID FK | |
| menu_item_id | UUID FK | nullable, what was redeemed |
| redeemed_at | TIMESTAMPTZ | |
| location | VARCHAR | bar, entry, merch |
| notes | TEXT | override reason |

### `ticket_perk_balances` (denormalized cache)
| Column | Type | Notes |
|--------|------|-------|
| ticket_id | UUID FK | |
| ticket_perk_id | UUID FK | |
| quantity_total | INT | |
| quantity_used | INT | |
| PRIMARY KEY(ticket_id, ticket_perk_id) | | |

---

### `reports`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| reporter_id | UUID FK | |
| target_type | ENUM | user, event, comment, memory |
| target_id | UUID | |
| reason | ENUM | |
| status | ENUM | pending, resolved, dismissed |
| resolved_by | UUID FK | admin |

---

## Analytics (Aggregated)

### `event_stats` (materialized / updated by jobs)
| Column | Type | Notes |
|--------|------|-------|
| event_id | UUID PK | |
| views | INT | |
| unique_views | INT | |
| likes | INT | |
| shares | INT | |
| tickets_sold | INT | |
| revenue_cents | INT | |
| check_ins | INT | |
| menu_revenue_cents | INT | |
| memories_count | INT | |
| avg_rating | DECIMAL(3,2) | |

---

## Key Indexes Summary

```sql
-- Map discovery
CREATE INDEX idx_events_location ON events USING GIST(location);
CREATE INDEX idx_events_upcoming ON events(start_at) WHERE status = 'published';

-- Feed
CREATE INDEX idx_events_page_published ON events(page_id, published_at DESC);

-- Tickets
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_event ON orders(event_id);

-- Memories
CREATE INDEX idx_memories_event ON memories(event_id, created_at DESC);
CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_memories_page_feed ON memories(event_id) WHERE status = 'published';

-- Menu orders
CREATE INDEX idx_menu_orders_event_status ON menu_orders(event_id, status);
CREATE INDEX idx_menu_orders_pickup ON menu_orders(event_id, pickup_slot_start);
```

## Migration Strategy

- **TypeORM** or **Prisma** migrations (recommend Prisma for DX)
- Seed scripts: categories, demo users, sample events
- Never destructive migrations in production without backup
