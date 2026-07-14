import { media } from './media'

export type PublicCreatorProfile = {
  id: string
  followId: string
  name: string
  handle: string
  bio: string
  banner: string
  avatar: string
  categories: string[]
  cities: string[]
  website: string
  verified: boolean
  followers: number
  rating: number
  reviewCount: number
  eventsHosted: number
  totalAttendees: number
}

export const creatorProfilesByHandle: Record<string, PublicCreatorProfile> = {
  neoncollective: {
    id: 'neoncollective',
    followId: '4',
    name: 'Neon Collective',
    handle: 'neoncollective',
    bio: 'Underground electronic events. Immersive visuals. Unforgettable nights across LA.',
    banner: media.bannerConcert,
    avatar: media.avatarNeon,
    categories: ['Music', 'Nightlife', 'Workshop'],
    cities: ['Los Angeles', 'Arts District', 'Downtown'],
    website: 'https://neoncollective.com',
    verified: true,
    followers: 12400,
    rating: 4.8,
    reviewCount: 240,
    eventsHosted: 52,
    totalAttendees: 10800,
  },
  skylineevents: {
    id: 'skylineevents',
    followId: '6',
    name: 'Skyline Events',
    handle: 'skylineevents',
    bio: 'Rooftop parties, jazz nights & sunset sessions above the city.',
    banner: media.bannerJazz,
    avatar: media.avatarSkyline,
    categories: ['Music', 'Food & Drink'],
    cities: ['Los Angeles', 'West Hollywood'],
    website: 'https://skylineevents.co',
    verified: true,
    followers: 8200,
    rating: 4.7,
    reviewCount: 128,
    eventsHosted: 34,
    totalAttendees: 6200,
  },
  warehousela: {
    id: 'warehousela',
    followId: '7',
    name: 'Warehouse LA',
    handle: 'warehousela',
    bio: 'Underground culture, warehouse raves & immersive art nights.',
    banner: media.warehouse,
    avatar: media.avatarNeon,
    categories: ['Nightlife', 'Art'],
    cities: ['Los Angeles', 'Arts District'],
    website: 'https://warehousela.io',
    verified: false,
    followers: 3400,
    rating: 4.6,
    reviewCount: 89,
    eventsHosted: 28,
    totalAttendees: 4100,
  },
}

export function getCreatorProfile(handle: string): PublicCreatorProfile {
  return creatorProfilesByHandle[handle] ?? creatorProfilesByHandle.neoncollective
}
