import { media } from './media'
import type { EventRecurrence } from '../types/recurrence'

export interface Creator {
  id: string
  name: string
  handle: string
  avatar: string
  banner: string
  verified: boolean
  followers: number
  bio: string
  rating: number
  reviewCount: number
}

export interface EventMediaItem {
  type: 'image' | 'video'
  src: string
  poster?: string
}

export interface Event {
  id: string
  title: string
  slug: string
  cover: string
  /** Gallery images and promo clips shown on event cards */
  media?: EventMediaItem[]
  creator: Creator
  date: string
  time: string
  endTime: string
  location: string
  address: string
  lat: number
  lng: number
  category: string
  format: 'standing' | 'seated' | 'hybrid'
  price: number | 'free'
  capacity: number
  sold: number
  likes: number
  comments: number
  friendsGoing: number
  description: string
  ageRestriction: string
  status: 'upcoming' | 'live' | 'past'
  recurrence?: EventRecurrence
  /** ISO date anchor for recurrence (defaults to parsing `date`) */
  seriesStart?: string
}

export function getEventMedia(event: Event): EventMediaItem[] {
  if (event.media && event.media.length > 0) return event.media
  return [{ type: 'image', src: event.cover }]
}

export interface MenuItem {
  id: string
  name: string
  description: string
  longDescription?: string
  ingredients?: string[]
  price: number
  image: string
  images?: string[]
  category: string
  tags: string[]
  popular?: boolean
  ageRestricted?: boolean
}

export interface TicketType {
  id: string
  name: string
  price: number
  perks: string[]
  available: number
}

export interface Memory {
  id: string
  user: { name: string; avatar: string }
  rating: number
  body: string
  media: string[]
  likes: number
  verified: boolean
  eventTitle: string
  date: string
}

export interface Perk {
  id: string
  name: string
  icon: string
  total: number
  used: number
  expiresAt: string
}

export interface MenuOrder {
  id: string
  code: string
  status: 'placed' | 'preparing' | 'ready' | 'picked_up'
  items: { name: string; qty: number }[]
  total: number
}

export const creators: Creator = {
  id: '1',
  name: 'Neon Collective',
  handle: 'neoncollective',
  avatar: media.avatarNeon,
  banner: media.bannerConcert,
  verified: true,
  followers: 12400,
  bio: 'Underground electronic events. Immersive visuals. Unforgettable nights.',
  rating: 4.8,
  reviewCount: 240,
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Neon Nights: Summer Solstice',
    slug: 'neon-nights-summer',
    cover: media.concert,
    creator: creators,
    date: 'Jul 18, 2026',
    time: '9:00 PM',
    endTime: '3:00 AM',
    location: 'The Warehouse',
    address: '42 Industrial Ave, Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    category: 'Music',
    format: 'standing',
    price: 35,
    capacity: 800,
    sold: 612,
    likes: 1842,
    comments: 128,
    friendsGoing: 5,
    media: [
      { type: 'video', src: media.eventVideoConcert, poster: media.concert },
      { type: 'image', src: media.crowd },
      { type: 'image', src: media.memory1 },
    ],
    description:
      'An immersive electronic night featuring top DJs, laser shows, and a rooftop terrace. Dress code: neon optional but encouraged.',
    ageRestriction: '21+',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Rooftop Jazz & Wine',
    slug: 'rooftop-jazz',
    cover: media.jazz,
    creator: creators,
    date: 'Jul 12, 2026',
    time: '7:00 PM',
    endTime: '11:00 PM',
    location: 'Skyline Terrace',
    address: '100 Sunset Blvd, Los Angeles',
    lat: 34.09,
    lng: -118.38,
    category: 'Music',
    format: 'seated',
    price: 55,
    capacity: 120,
    sold: 98,
    likes: 456,
    comments: 34,
    friendsGoing: 2,
    media: [
      { type: 'video', src: media.eventVideoJazz, poster: media.jazz },
      { type: 'image', src: media.skyline },
      { type: 'image', src: media.cocktail },
    ],
    description: 'Intimate seated evening with live jazz quartet and curated wine pairings.',
    ageRestriction: '21+',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Brunch & Beats Workshop',
    slug: 'brunch-beats',
    cover: media.workshop,
    creator: creators,
    date: 'Jul 5, 2026',
    time: '11:00 AM',
    endTime: '3:00 PM',
    location: 'Café Meridian',
    address: '15 Arts District, Los Angeles',
    lat: 34.04,
    lng: -118.23,
    category: 'Workshop',
    format: 'standing',
    price: 'free',
    capacity: 50,
    sold: 50,
    likes: 289,
    comments: 67,
    friendsGoing: 0,
    description: 'Learn beat-making over brunch. Past attendees rated this 4.9★',
    ageRestriction: 'All ages',
    status: 'past',
  },
  {
    id: '4',
    title: 'Sunset Jazz Sessions',
    slug: 'sunset-jazz-sessions',
    cover: media.jazz,
    creator: creators,
    date: 'Every Thu & Fri',
    time: '19:00',
    endTime: '11:00 PM',
    location: 'Skyline Terrace',
    address: '100 Sunset Blvd, Los Angeles',
    lat: 34.09,
    lng: -118.38,
    category: 'Music',
    format: 'seated',
    price: 45,
    capacity: 80,
    sold: 62,
    likes: 890,
    comments: 54,
    friendsGoing: 3,
    media: [
      { type: 'video', src: media.eventVideoJazz, poster: media.jazz },
      { type: 'image', src: media.skyline },
      { type: 'image', src: media.cocktail },
    ],
    description: 'Weekly rooftop jazz with curated wine pairings. Same magic, new guests every night.',
    ageRestriction: '21+',
    status: 'upcoming',
    seriesStart: '2026-07-10',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [4, 5],
      daysOfMonth: [1, 15],
      end: { type: 'never' },
    },
  },
  {
    id: '5',
    title: 'After Hours Warehouse',
    slug: 'after-hours-warehouse',
    cover: media.warehouse,
    creator: creators,
    date: 'Every night',
    time: '22:00',
    endTime: '4:00 AM',
    location: 'The Warehouse',
    address: '42 Industrial Ave, Los Angeles',
    lat: 34.0407,
    lng: -118.2322,
    category: 'Nightlife',
    format: 'standing',
    price: 25,
    capacity: 500,
    sold: 320,
    likes: 2100,
    comments: 89,
    friendsGoing: 8,
    media: [
      { type: 'video', src: media.eventVideoDj, poster: media.warehouse },
      { type: 'image', src: media.crowd },
      { type: 'image', src: media.concertWide },
    ],
    description: 'Nightly underground sets. Rotating residents, surprise guests, no two nights alike.',
    ageRestriction: '21+',
    status: 'live',
    seriesStart: '2026-07-01',
    recurrence: {
      frequency: 'daily',
      interval: 1,
      daysOfWeek: [5, 6],
      daysOfMonth: [1, 15],
      end: { type: 'on_date', date: '2026-12-31' },
    },
  },
]

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Neon Mule',
    description: 'Vodka, ginger beer, lime, glow ice',
    longDescription:
      'Our signature cocktail served in a frosted copper mug with edible glow ice. Bright citrus meets spicy ginger for a drink that looks as good under the lasers as it tastes.',
    ingredients: ['Vodka', 'Ginger beer', 'Fresh lime', 'Glow ice cube', 'Mint'],
    price: 14,
    image: media.cocktail,
    images: [media.cocktail, media.drink, media.concert],
    category: 'Cocktails',
    tags: [],
    popular: true,
    ageRestricted: true,
  },
  {
    id: '2',
    name: 'Electric Lemonade',
    description: 'Gin, blue curaçao, fresh lemon',
    longDescription:
      'A electric-blue gin sour topped with a lemon wheel. Tart, refreshing, and perfect between sets on the terrace.',
    ingredients: ['Gin', 'Blue curaçao', 'Fresh lemon juice', 'Simple syrup', 'Soda'],
    price: 12,
    image: media.drink,
    images: [media.drink, media.cocktail],
    category: 'Cocktails',
    tags: [],
    ageRestricted: true,
  },
  {
    id: '3',
    name: 'Craft IPA',
    description: 'Local brewery, 6.5% ABV',
    longDescription:
      'Rotating tap from a neighborhood brewery. Hoppy, crisp, and served ice-cold in a pint glass.',
    ingredients: ['Malted barley', 'Hops', 'Yeast', 'Water'],
    price: 8,
    image: media.beer,
    images: [media.beer],
    category: 'Beer',
    tags: [],
    ageRestricted: true,
  },
  {
    id: '4',
    name: 'Truffle Fries',
    description: 'Parmesan, truffle oil, herbs',
    longDescription:
      'Shoestring fries tossed in white truffle oil, aged parmesan, and fresh herbs. Best shared — or not.',
    ingredients: ['Potatoes', 'Truffle oil', 'Parmesan', 'Parsley', 'Sea salt'],
    price: 11,
    image: media.fries,
    images: [media.fries, media.food],
    category: 'Food',
    tags: ['vegetarian'],
    popular: true,
  },
  {
    id: '5',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, roasted veg, tahini',
    longDescription:
      'Warm quinoa base with roasted seasonal vegetables, pickled onions, avocado, and creamy tahini dressing.',
    ingredients: ['Quinoa', 'Roasted vegetables', 'Avocado', 'Pickled onion', 'Tahini dressing'],
    price: 15,
    image: media.food,
    images: [media.food, media.fries],
    category: 'Food',
    tags: ['vegan', 'gluten-free'],
  },
  {
    id: '6',
    name: 'Zero-Proof Spritz',
    description: 'Seedlip, elderflower, soda',
    longDescription:
      'A alcohol-free spritz with Seedlip Garden, elderflower cordial, and sparkling soda. All the ceremony, none of the ABV.',
    ingredients: ['Seedlip Garden', 'Elderflower cordial', 'Soda water', 'Orange slice'],
    price: 9,
    image: media.drink,
    images: [media.drink],
    category: 'Zero-proof',
    tags: [],
  },
]

export const ticketTypes: TicketType[] = [
  { id: 'ga', name: 'General Admission', price: 35, perks: ['1 welcome drink'], available: 188 },
  { id: 'vip', name: 'VIP', price: 85, perks: ['3 drink tokens', 'VIP lounge access', 'Priority entry'], available: 42 },
  { id: 'early', name: 'Early Bird', price: 25, perks: ['1 welcome drink'], available: 0 },
]

export const memories: Memory[] = [
  {
    id: '1',
    user: { name: 'Sarah K.', avatar: media.avatarSarah },
    rating: 5,
    body: 'Best night of the summer! The visuals were insane and the vibe was unmatched.',
    media: [media.memory1, media.memory2],
    likes: 234,
    verified: true,
    eventTitle: 'Neon Nights: Spring Edition',
    date: '2 weeks ago',
  },
  {
    id: '2',
    user: { name: 'Marcus T.', avatar: media.avatarAlex },
    rating: 5,
    body: 'Pre-ordering drinks saved so much time. Welcome drink perk was a nice touch!',
    media: [media.concert],
    likes: 89,
    verified: true,
    eventTitle: 'Neon Nights: Spring Edition',
    date: '2 weeks ago',
  },
  {
    id: '3',
    user: { name: 'Elena R.', avatar: media.avatarEmma },
    rating: 4,
    body: 'Amazing DJ set. Only wish the bar line was shorter but pre-order helps.',
    media: [],
    likes: 45,
    verified: true,
    eventTitle: 'Warehouse Sessions Vol. 3',
    date: '1 month ago',
  },
]

export const perks: Perk[] = [
  { id: '1', name: 'Welcome Drink', icon: '🍹', total: 1, used: 0, expiresAt: 'First 2 hours' },
  { id: '2', name: 'Drink Tokens', icon: '🎟️', total: 3, used: 1, expiresAt: 'All night' },
  { id: '3', name: 'VIP Lounge', icon: '⭐', total: 1, used: 0, expiresAt: 'All night' },
]

export const menuOrders: MenuOrder[] = [
  {
    id: '1',
    code: 'A42',
    status: 'ready',
    items: [{ name: 'Neon Mule', qty: 1 }, { name: 'Truffle Fries', qty: 1 }],
    total: 25,
  },
]

export const barQueue = [
  { id: '101', name: 'Alex M.', code: 'B12', items: ['Neon Mule', 'Craft IPA'], status: 'new' as const, time: '2m ago' },
  { id: '102', name: 'Jordan P.', code: 'C07', items: ['Truffle Fries x2'], status: 'preparing' as const, time: '5m ago' },
  { id: '103', name: 'Sam L.', code: 'A42', items: ['Neon Mule', 'Truffle Fries'], status: 'ready' as const, time: '8m ago' },
  { id: '104', name: 'Taylor R.', code: 'D33', items: ['Electric Lemonade', 'Vegan Bowl'], status: 'new' as const, time: '1m ago' },
]

export const feedPostsFollowing = [
  { type: 'event' as const, event: events[0], feedTag: 'following' as const },
  { type: 'memory' as const, memory: memories[0], feedTag: 'following' as const },
  { type: 'event' as const, event: events[1], feedTag: 'following' as const },
  { type: 'announcement' as const, creator: creators, text: 'Early bird tickets for Neon Nights are 80% gone! 🚨', feedTag: 'following' as const },
]

export const feedPostsNearby = [
  { type: 'event' as const, event: events[0], distance: '0.8 mi', feedTag: 'nearby' as const },
  { type: 'event' as const, event: events[3], distance: '1.2 mi', feedTag: 'nearby' as const },
  { type: 'event' as const, event: events[4], distance: '0.5 mi', feedTag: 'nearby' as const },
  { type: 'event' as const, event: events[1], distance: '2.1 mi', feedTag: 'nearby' as const },
  { type: 'event' as const, event: { ...events[2], title: 'Block Party LA', cover: media.festival, price: 'free' as const, likes: 892, media: [{ type: 'video' as const, src: media.eventVideoFestival, poster: media.festival }, { type: 'image' as const, src: media.crowd }] }, distance: '0.3 mi', feedTag: 'nearby' as const },
]

export const feedPostsTrending = [
  { type: 'event' as const, event: events[0], trendingRank: 1, feedTag: 'trending' as const },
  { type: 'event' as const, event: { ...events[1], likes: 2340, sold: 118, capacity: 120 }, trendingRank: 2, feedTag: 'trending' as const },
  { type: 'memory' as const, memory: { ...memories[0], likes: 1204 }, feedTag: 'trending' as const },
  { type: 'event' as const, event: { ...events[0], id: '5', title: 'Sunset Sessions', cover: media.crowd, likes: 3102, friendsGoing: 18 }, trendingRank: 3, feedTag: 'trending' as const },
]

/** @deprecated use feedPostsFollowing */
export const feedPosts = feedPostsFollowing

export const draftEvents = [
  {
    id: 'draft-1',
    title: 'Autumn Warehouse Party',
    cover: media.festival,
    lastEdited: '2 hours ago',
    completion: 65,
    scheduledPublish: 'Jul 12, 2026 · 10:00 AM',
  },
  {
    id: 'draft-2',
    title: 'Untitled Event',
    cover: media.warehouse,
    lastEdited: 'Yesterday',
    completion: 20,
    scheduledPublish: null,
  },
]

export const categories = ['Music', 'Art', 'Food & Drink', 'Workshop', 'Sports', 'Nightlife', 'Community']
export const menuTypes = ['Bar', 'Café', 'Restaurant', 'Food vendor', 'None']
export const visibilityOptions = ['Public', 'Unlisted', 'Followers only', 'Private / Invite']
export const ageOptions = ['All ages', '18+', '21+']
export const formatOptions = ['Standing (GA)', 'Seated', 'Hybrid'] as const

export const mapPins = events.map((e) => ({
  id: e.id,
  title: e.title,
  lat: e.lat,
  lng: e.lng,
  price: e.price,
  category: e.category,
}))

export const mainEvent = events[0]
