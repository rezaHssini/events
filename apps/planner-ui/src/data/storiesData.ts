import { media } from './media'
export interface StorySlide {
  id: string
  type: 'image' | 'video'
  src: string
  poster?: string
  duration?: number
  caption?: string
}

export interface UserStory {
  userId: string
  handle: string
  name: string
  avatar: string
  slides: StorySlide[]
  seen?: boolean
}

export const userStories: UserStory[] = [
  {
    userId: 'me',
    handle: 'reza',
    name: 'You',
    avatar: media.avatarReza,
    slides: [
      {
        id: 'me-1',
        type: 'image',
        src: media.concert,
        caption: 'Neon Nights this Friday 🎉',
      },
      {
        id: 'me-2',
        type: 'image',
        src: media.crowd,
        caption: 'Who else is going?',
      },
    ],
  },
  {
    userId: '4',
    handle: 'neoncollective',
    name: 'Neon Collective',
    avatar: media.avatarNeon,
    slides: [
      {
        id: 'nc-1',
        type: 'image',
        src: media.concert,
        caption: 'Last weekend was insane 🔥',
      },
      {
        id: 'nc-2',
        type: 'image',
        src: media.warehouse,
        caption: 'Early bird tickets 80% gone',
      },
      {
        id: 'nc-3',
        type: 'video',
        src: media.eventVideoConcert,
        poster: media.concert,
        caption: 'Sneak peek of the stage setup',
      },
    ],
  },
  {
    userId: '2',
    handle: 'jordanp',
    name: 'Jordan',
    avatar: media.avatarSarah,
    slides: [
      {
        id: 'jp-1',
        type: 'image',
        src: media.jazz,
        caption: 'Jazz night was perfect 🎷',
      },
      {
        id: 'jp-2',
        type: 'image',
        src: media.cocktail,
        caption: 'Pre-show drinks on the roof',
      },
    ],
  },
  {
    userId: '3',
    handle: 'sarahk',
    name: 'Sarah',
    avatar: media.avatarEmma,
    slides: [
      {
        id: 'sk-1',
        type: 'image',
        src: media.memory1,
        caption: 'Best crowd ever ✨',
      },
      {
        id: 'sk-2',
        type: 'image',
        src: media.memory2,
        caption: 'See you at the next one',
      },
      {
        id: 'sk-3',
        type: 'image',
        src: media.festival,
        caption: 'Festival season loading…',
      },
    ],
  },
  {
    userId: '1',
    handle: 'alexm',
    name: 'Alex',
    avatar: media.avatarAlex,
    slides: [
      {
        id: 'am-1',
        type: 'image',
        src: media.workshop,
        caption: 'Warehouse vibes only',
      },
      {
        id: 'am-2',
        type: 'video',
        src: media.eventVideoDj,
        poster: media.warehouse,
        caption: 'Soundcheck hits different',
      },
    ],
  },
  {
    userId: '5',
    handle: 'marcust',
    name: 'Marcus',
    avatar: media.avatarJordan,
    slides: [
      {
        id: 'mt-1',
        type: 'image',
        src: media.skyline,
        caption: 'First rooftop event in LA 🌆',
      },
    ],
  },
  {
    userId: '7',
    handle: 'elenar',
    name: 'Elena',
    avatar: media.avatarMia,
    slides: [
      {
        id: 'er-1',
        type: 'image',
        src: media.jazz,
        caption: 'Gallery + jazz = perfect night',
      },
      {
        id: 'er-2',
        type: 'image',
        src: media.workshop,
        caption: 'Art walk afterparty',
      },
    ],
  },
  {
    userId: '8',
    handle: 'taylorb',
    name: 'Taylor',
    avatar: media.avatarMarcus,
    slides: [
      {
        id: 'tb-1',
        type: 'image',
        src: media.festival,
        caption: 'Festival fit check ✅',
      },
      {
        id: 'tb-2',
        type: 'image',
        src: media.crowd,
        caption: 'Main stage energy',
      },
      {
        id: 'tb-3',
        type: 'video',
        src: media.eventVideoFestival,
        poster: media.festival,
        caption: 'Weekend recap',
      },
    ],
  },
  {
    userId: '9',
    handle: 'miac',
    name: 'Mia',
    avatar: media.avatarChris,
    slides: [
      {
        id: 'mc-1',
        type: 'image',
        src: media.concertWide,
        caption: 'VIP section views',
      },
    ],
  },
  {
    userId: '10',
    handle: 'chrisl',
    name: 'Chris',
    avatar: media.avatarSkyline,
    slides: [
      {
        id: 'cl-1',
        type: 'image',
        src: media.beer,
        caption: 'Beer garden before the set',
      },
      {
        id: 'cl-2',
        type: 'image',
        src: media.food,
        caption: 'Best tacos at the venue',
      },
    ],
  },
  {
    userId: '11',
    handle: 'skylineevents',
    name: 'Skyline Events',
    avatar: media.avatarSkyline,
    slides: [
      {
        id: 'se-1',
        type: 'image',
        src: media.skyline,
        caption: 'New rooftop series announced',
      },
      {
        id: 'se-2',
        type: 'image',
        src: media.cocktail,
        caption: 'Sunset sessions every Friday',
      },
    ],
  },
  {
    userId: '12',
    handle: 'ninap',
    name: 'Nina',
    avatar: media.avatarEmma,
    slides: [
      {
        id: 'np-1',
        type: 'image',
        src: media.memory2,
        caption: 'Still thinking about last night',
      },
    ],
  },
]

export function getStoryForUser(userId: string) {
  return userStories.find((s) => s.userId === userId)
}

export function getStoryByHandle(handle: string) {
  return userStories.find((s) => s.handle === handle)
}
