import { media } from './media'
import { events, draftEvents } from './mockData'
import type { EventRecurrence } from '../types/recurrence'

export type PlannerEventStatus = 'live' | 'upcoming' | 'past' | 'draft' | 'scheduled'

export interface EventStaffAssignment {
  security: { id: string; name: string; avatar: string }[]
  bar: { id: string; name: string; avatar: string }[]
}

export interface PlannerManagedEvent {
  id: string
  title: string
  cover: string
  category: string
  location: string
  address: string
  city: string
  date: string
  time: string
  status: PlannerEventStatus
  sold: number
  capacity: number
  revenue: number
  menuType: string
  menuItemCount: number
  staff: EventStaffAssignment
  scheduledPublish?: string | null
  recurrence?: EventRecurrence
  seriesStart?: string
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: 'co-organizer' | 'security' | 'bar' | 'volunteer'
  eventsAssigned: number
}

export const defaultClubProfile = {
  name: 'Neon Collective',
  handle: 'neoncollective',
  bio: 'Underground electronic events. Immersive visuals. Unforgettable nights across LA.',
  banner: media.concert,
  avatar: media.avatarNeon,
  categories: ['Music', 'Nightlife', 'Workshop'],
  cities: ['Los Angeles', 'Arts District', 'Downtown'],
  website: 'neoncollective.com',
  verified: true,
  followers: 12400,
  rating: 4.8,
  reviewCount: 240,
  eventsHosted: 52,
  totalAttendees: 10800,
}

export const plannerManagedEvents: PlannerManagedEvent[] = [
  {
    id: events[0].id,
    title: events[0].title,
    cover: events[0].cover,
    category: events[0].category,
    location: events[0].location,
    address: events[0].address,
    city: 'Los Angeles',
    date: events[0].date,
    time: events[0].time,
    status: 'live',
    sold: events[0].sold,
    capacity: events[0].capacity,
    revenue: 21420,
    menuType: 'Bar',
    menuItemCount: 12,
    staff: {
      security: [
        { id: '2', name: 'Jordan P.', avatar: media.avatarAlex },
        { id: '8', name: 'Alex M.', avatar: media.avatarMarcus },
      ],
      bar: [
        { id: '3', name: 'Sarah K.', avatar: media.avatarSarah },
      ],
    },
  },
  {
    id: events[1].id,
    title: events[1].title,
    cover: events[1].cover,
    category: events[1].category,
    location: events[1].location,
    address: events[1].address,
    city: 'West Hollywood',
    date: events[1].date,
    time: events[1].time,
    status: 'upcoming',
    sold: events[1].sold,
    capacity: events[1].capacity,
    revenue: 5390,
    menuType: 'Restaurant',
    menuItemCount: 8,
    staff: {
      security: [{ id: '8', name: 'Alex M.', avatar: media.avatarMarcus }],
      bar: [],
    },
  },
  {
    id: events[2].id,
    title: events[2].title,
    cover: events[2].cover,
    category: events[2].category,
    location: events[2].location,
    address: events[2].address,
    city: 'Arts District',
    date: events[2].date,
    time: events[2].time,
    status: 'past',
    sold: events[2].sold,
    capacity: events[2].capacity,
    revenue: 0,
    menuType: 'Café',
    menuItemCount: 6,
    staff: { security: [], bar: [] },
  },
  {
    id: events[4].id,
    title: events[4].title,
    cover: events[4].cover,
    category: events[4].category,
    location: events[4].location,
    address: events[4].address,
    city: 'Los Angeles',
    date: events[4].date,
    time: events[4].time,
    status: 'live',
    sold: events[4].sold,
    capacity: events[4].capacity,
    revenue: 8000,
    menuType: 'Bar',
    menuItemCount: 10,
    recurrence: events[4].recurrence,
    seriesStart: events[4].seriesStart,
    staff: {
      security: [{ id: '2', name: 'Jordan P.', avatar: media.avatarAlex }],
      bar: [{ id: '3', name: 'Sarah K.', avatar: media.avatarSarah }],
    },
  },
  {
    id: 'draft-1',
    title: draftEvents[0].title,
    cover: draftEvents[0].cover!,
    category: 'Nightlife',
    location: 'The Warehouse',
    address: '42 Industrial Ave, Los Angeles',
    city: 'Los Angeles',
    date: 'Aug 22, 2026',
    time: '10:00 PM',
    status: 'scheduled',
    sold: 0,
    capacity: 600,
    revenue: 0,
    menuType: 'Bar',
    menuItemCount: 0,
    scheduledPublish: draftEvents[0].scheduledPublish,
    staff: { security: [], bar: [] },
  },
  {
    id: 'draft-2',
    title: draftEvents[1].title,
    cover: media.workshop,
    category: 'Food & Drink',
    location: 'Rooftop Garden',
    address: '88 Sunset Blvd, Los Angeles',
    city: 'Hollywood',
    date: 'TBD',
    time: 'TBD',
    status: 'draft',
    sold: 0,
    capacity: 200,
    revenue: 0,
    menuType: 'Food vendor',
    menuItemCount: 0,
    staff: { security: [], bar: [] },
  },
]

export const clubTeamMembers: TeamMember[] = [
  {
    id: 'me',
    name: 'Reza',
    avatar: media.avatarReza,
    role: 'co-organizer',
    eventsAssigned: 5,
  },
  {
    id: '2',
    name: 'Jordan P.',
    avatar: media.avatarAlex,
    role: 'security',
    eventsAssigned: 2,
  },
  {
    id: '3',
    name: 'Sarah K.',
    avatar: media.avatarSarah,
    role: 'bar',
    eventsAssigned: 1,
  },
  {
    id: '8',
    name: 'Alex M.',
    avatar: media.avatarMarcus,
    role: 'security',
    eventsAssigned: 2,
  },
]

export const clubAnalytics = {
  totalRevenue: 26810,
  ticketsSold: 760,
  avgAttendance: 152,
  followerGrowth: 12.4,
  topCategory: 'Music',
  topVenue: 'The Warehouse',
  monthlyRevenue: [
    { month: 'Mar', value: 4200 },
    { month: 'Apr', value: 6100 },
    { month: 'May', value: 5800 },
    { month: 'Jun', value: 7200 },
    { month: 'Jul', value: 3510 },
  ],
  eventsByCategory: [
    { category: 'Music', count: 18 },
    { category: 'Nightlife', count: 14 },
    { category: 'Workshop', count: 8 },
    { category: 'Food & Drink', count: 6 },
    { category: 'Art', count: 6 },
  ],
}

export const eventMenuPreview: Record<string, { name: string; price: number; category: string }[]> = {
  '1': [
    { name: 'Neon Mule', price: 14, category: 'Cocktails' },
    { name: 'Electric Lemonade', price: 12, category: 'Cocktails' },
    { name: 'Craft IPA', price: 9, category: 'Beer' },
    { name: 'Truffle Fries', price: 11, category: 'Food' },
    { name: 'Vegan Bowl', price: 13, category: 'Food' },
  ],
  '2': [
    { name: 'House Red', price: 16, category: 'Wine' },
    { name: 'Cheese Board', price: 22, category: 'Food' },
    { name: 'Espresso Martini', price: 15, category: 'Cocktails' },
  ],
  '3': [
    { name: 'Cold Brew', price: 6, category: 'Coffee' },
    { name: 'Avocado Toast', price: 12, category: 'Brunch' },
  ],
}

export function slugifyClubName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24)
}
