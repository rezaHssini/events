import { media } from './media'
export interface MentionUser {
  id: string
  name: string
  handle: string
  avatar: string
  isCreator?: boolean
}

export interface Comment {
  id: string
  user: MentionUser
  body: string
  mentions: string[]
  time: string
  likes: number
  replies?: Comment[]
  imageUrl?: string
}

export interface MentionUser {
  id: string
  name: string
  handle: string
  avatar: string
  isCreator?: boolean
}

export interface UserProfile extends MentionUser {
  bio: string
  location: string
  followers: number
  following: number
  eventsAttended: number
  mutualFriends: number
  isPrivate?: boolean
  coverUrl?: string
  upcomingEvents: { id: string; title: string; cover: string; date: string }[]
  recentMemories: { image: string; eventTitle: string }[]
}

export const currentUser: UserProfile = {
  id: 'me',
  name: 'Reza',
  handle: 'reza',
  avatar: media.avatarReza,
  bio: 'Event lover · LA based · Always looking for the next great night out',
  location: 'Los Angeles, CA',
  followers: 342,
  following: 128,
  eventsAttended: 24,
  mutualFriends: 0,
  coverUrl: media.concert,
  upcomingEvents: [
    {
      id: '1',
      title: 'Neon Nights: Summer Solstice',
      cover: media.concert,
      date: 'Jul 18',
    },
    {
      id: '2',
      title: 'Rooftop Jazz & Wine',
      cover: media.jazz,
      date: 'Jul 12',
    },
  ],
  recentMemories: [
    {
      image: media.memory1,
      eventTitle: 'Warehouse Sessions',
    },
  ],
}

export const userProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    handle: 'alexm',
    avatar: media.avatarAlex,
    bio: 'Techno head · Photographer · DM for collabs',
    location: 'Los Angeles, CA',
    followers: 1204,
    following: 389,
    eventsAttended: 47,
    mutualFriends: 3,
    coverUrl: media.avatarNeon,
    upcomingEvents: [
      {
        id: '1',
        title: 'Neon Nights: Summer Solstice',
        cover: media.concert,
        date: 'Jul 18',
      },
    ],
    recentMemories: [
      {
        image: media.memory2,
        eventTitle: 'Neon Nights Spring',
      },
    ],
  },
  {
    id: '2',
    name: 'Jordan Park',
    handle: 'jordanp',
    avatar: media.avatarSarah,
    bio: 'Coffee by day, concerts by night ☕🎵',
    location: 'Los Angeles, CA',
    followers: 567,
    following: 210,
    eventsAttended: 31,
    mutualFriends: 5,
    coverUrl: media.jazz,
    upcomingEvents: [
      {
        id: '1',
        title: 'Neon Nights: Summer Solstice',
        cover: media.concert,
        date: 'Jul 18',
      },
      {
        id: '2',
        title: 'Rooftop Jazz & Wine',
        cover: media.jazz,
        date: 'Jul 12',
      },
    ],
    recentMemories: [],
  },
  {
    id: '3',
    name: 'Sarah Kim',
    handle: 'sarahk',
    avatar: media.avatarEmma,
    bio: 'Workshop enthusiast · Foodie · Always RSVP yes',
    location: 'Santa Monica, CA',
    followers: 892,
    following: 445,
    eventsAttended: 52,
    mutualFriends: 4,
    upcomingEvents: [
      {
        id: '1',
        title: 'Neon Nights: Summer Solstice',
        cover: media.concert,
        date: 'Jul 18',
      },
    ],
    recentMemories: [
      {
        image: media.memory1,
        eventTitle: 'Neon Nights Spring',
      },
      {
        image: media.workshop,
        eventTitle: 'Brunch & Beats',
      },
    ],
  },
  {
    id: '4',
    name: 'Neon Collective',
    handle: 'neoncollective',
    avatar: media.avatarNeon,
    isCreator: true,
    bio: 'Underground electronic events. Immersive visuals.',
    location: 'Los Angeles, CA',
    followers: 12400,
    following: 89,
    eventsAttended: 0,
    mutualFriends: 0,
    upcomingEvents: [],
    recentMemories: [],
  },
  {
    id: '5',
    name: 'Marcus Torres',
    handle: 'marcust',
    avatar: media.avatarJordan,
    bio: 'New to LA — show me the best events!',
    location: 'Downtown LA',
    followers: 128,
    following: 312,
    eventsAttended: 8,
    mutualFriends: 1,
    isPrivate: true,
    upcomingEvents: [],
    recentMemories: [],
  },
  {
    id: '7',
    name: 'Elena Rivera',
    handle: 'elenar',
    avatar: media.avatarMia,
    bio: 'Art walks · Gallery nights · Jazz',
    location: 'Arts District, LA',
    followers: 2103,
    following: 567,
    eventsAttended: 63,
    mutualFriends: 2,
    upcomingEvents: [
      {
        id: '2',
        title: 'Rooftop Jazz & Wine',
        cover: media.jazz,
        date: 'Jul 12',
      },
    ],
    recentMemories: [
      {
        image: media.workshop,
        eventTitle: 'Gallery Opening',
      },
    ],
  },
  {
    id: '8',
    name: 'Taylor Brooks',
    handle: 'taylorb',
    avatar: media.avatarMarcus,
    bio: 'Festival season is my personality',
    location: 'Venice Beach, CA',
    followers: 445,
    following: 198,
    eventsAttended: 19,
    mutualFriends: 6,
    upcomingEvents: [
      { id: '6', title: 'Downtown Block Party', cover: media.festival, date: 'Jul 9' },
    ],
    recentMemories: [],
  },
  {
    id: '9',
    name: 'Chris Nguyen',
    handle: 'chrisn',
    avatar: media.avatarChris,
    bio: 'House music · Late nights · Good vibes',
    location: 'Silver Lake, CA',
    followers: 678,
    following: 412,
    eventsAttended: 34,
    mutualFriends: 4,
    upcomingEvents: [
      { id: '5', title: 'After Hours Warehouse', cover: media.warehouse, date: 'Tonight' },
      { id: '17', title: 'Neon Pre-Party', cover: media.concert, date: 'Jul 9' },
    ],
    recentMemories: [{ image: media.crowd, eventTitle: 'Warehouse Sessions' }],
  },
  {
    id: '10',
    name: 'Mia Chen',
    handle: 'miac',
    avatar: media.avatarMia,
    bio: 'Art walks · Wine bars · Jazz clubs',
    location: 'Arts District, LA',
    followers: 934,
    following: 521,
    eventsAttended: 41,
    mutualFriends: 3,
    upcomingEvents: [
      { id: '8', title: 'Gallery Walk', cover: media.workshop, date: 'Jul 10' },
      { id: '2', title: 'Rooftop Jazz & Wine', cover: media.jazz, date: 'Jul 12' },
    ],
    recentMemories: [{ image: media.jazz, eventTitle: 'Jazz on the Roof' }],
  },
  {
    id: '11',
    name: 'Devon Walsh',
    handle: 'devonw',
    avatar: media.avatarJordan,
    bio: 'Runner · Brunch enthusiast · Free events',
    location: 'Los Feliz, CA',
    followers: 312,
    following: 189,
    eventsAttended: 22,
    mutualFriends: 5,
    upcomingEvents: [
      { id: '14', title: 'Run Club + Brunch', cover: media.workshop, date: 'Jul 9' },
    ],
    recentMemories: [],
  },
  {
    id: '12',
    name: 'Skyline Events',
    handle: 'skylineevents',
    avatar: media.avatarSkyline,
    isCreator: true,
    bio: 'Rooftop experiences across LA',
    location: 'West Hollywood, CA',
    followers: 8900,
    following: 45,
    eventsAttended: 0,
    mutualFriends: 0,
    upcomingEvents: [
      { id: '9', title: 'Sunset Rooftop Yoga', cover: media.skyline, date: 'Jul 11' },
    ],
    recentMemories: [],
  },
]

export function getFriendsGoingForEvent(eventId: string): MentionUser[] {
  const rsvped = userProfiles.filter(
    (u) => !u.isCreator && u.upcomingEvents.some((e) => e.id === eventId),
  )
  if (rsvped.length > 0) return rsvped

  return userProfiles
    .filter((u) => !u.isCreator && u.mutualFriends > 0)
    .sort((a, b) => b.mutualFriends - a.mutualFriends)
}

export const suggestedUsers = userProfiles.filter((u) => !u.isCreator && u.id !== 'me')

export interface SocialActivity {
  id: string
  type: 'going' | 'memory' | 'follow' | 'shared_event' | 'liked_event'
  user: MentionUser
  event?: { id: string; title: string; cover: string; date: string; price: number | 'free' }
  targetUser?: MentionUser
  time: string
  text?: string
}

export const socialActivities: SocialActivity[] = [
  {
    id: 'a1',
    type: 'going',
    user: userProfiles[1],
    event: {
      id: '1',
      title: 'Neon Nights: Summer Solstice',
      cover: media.concert,
      date: 'Jul 18',
      price: 35,
    },
    time: '1h ago',
  },
  {
    id: 'a2',
    type: 'memory',
    user: userProfiles[2],
    event: {
      id: '3',
      title: 'Brunch & Beats Workshop',
      cover: media.workshop,
      date: 'Jul 5',
      price: 'free',
    },
    text: 'Best workshop ever! 5★',
    time: '3h ago',
  },
  {
    id: 'a3',
    type: 'shared_event',
    user: userProfiles[0],
    event: {
      id: '2',
      title: 'Rooftop Jazz & Wine',
      cover: media.jazz,
      date: 'Jul 12',
      price: 55,
    },
    time: '5h ago',
  },
  {
    id: 'a4',
    type: 'follow',
    user: userProfiles[5],
    targetUser: userProfiles[2],
    time: '6h ago',
  },
  {
    id: 'a5',
    type: 'liked_event',
    user: userProfiles[6],
    event: {
      id: '1',
      title: 'Neon Nights: Summer Solstice',
      cover: media.concert,
      date: 'Jul 18',
      price: 35,
    },
    time: '8h ago',
  },
  {
    id: 'a6',
    type: 'going',
    user: userProfiles[8],
    event: {
      id: '6',
      title: 'Downtown Block Party',
      cover: media.festival,
      date: 'Jul 9',
      price: 'free',
    },
    time: '30m ago',
  },
  {
    id: 'a7',
    type: 'going',
    user: userProfiles[9],
    event: {
      id: '17',
      title: 'Neon Nights Pre-Party',
      cover: media.concertWide,
      date: 'Tonight',
      price: 15,
    },
    time: '45m ago',
  },
  {
    id: 'a8',
    type: 'shared_event',
    user: userProfiles[10],
    event: {
      id: '12',
      title: 'Taco & Tequila Festival',
      cover: media.food,
      date: 'Jul 14',
      price: 45,
    },
    time: '2h ago',
  },
  {
    id: 'a9',
    type: 'follow',
    user: userProfiles[11],
    targetUser: userProfiles[8],
    time: '3h ago',
  },
  {
    id: 'a10',
    type: 'liked_event',
    user: userProfiles[0],
    event: {
      id: '13',
      title: 'Warehouse Rave: UV Edition',
      cover: media.concert,
      date: 'Jul 15',
      price: 40,
    },
    time: '4h ago',
  },
  {
    id: 'a11',
    type: 'going',
    user: userProfiles[2],
    event: {
      id: '10',
      title: 'Vinyl & Vibes Market',
      cover: media.jazz,
      date: 'Jul 12',
      price: 15,
    },
    time: '5h ago',
  },
  {
    id: 'a12',
    type: 'memory',
    user: userProfiles[9],
    event: {
      id: '5',
      title: 'After Hours Warehouse',
      cover: media.warehouse,
      date: 'Last night',
      price: 25,
    },
    text: 'Insane set last night 🔥',
    time: '12h ago',
  },
]

export const mentionableUsers: MentionUser[] = userProfiles

export const eventComments: Comment[] = [
  {
    id: '1',
    user: mentionableUsers[0],
    body: 'Who else is going?? @jordanp @sarahk 🙌',
    mentions: ['jordanp', 'sarahk'],
    time: '2h ago',
    likes: 12,
    replies: [
      {
        id: '1a',
        user: mentionableUsers[1],
        body: "@alexm I'm in! Already pre-ordered drinks 🍹",
        mentions: ['alexm'],
        time: '1h ago',
        likes: 5,
      },
      {
        id: '1b',
        user: mentionableUsers[3],
        body: '@alexm @jordanp See you on the dance floor! VIP lounge opens at 9.',
        mentions: ['alexm', 'jordanp'],
        time: '45m ago',
        likes: 28,
      },
    ],
  },
  {
    id: '2',
    user: mentionableUsers[2],
    body: 'Pre-ordered the Neon Mule, cannot wait! @neoncollective is the menu final?',
    mentions: ['neoncollective'],
    time: '5h ago',
    likes: 8,
    replies: [
      {
        id: '2a',
        user: mentionableUsers[3],
        body: '@sarahk Yes! Full menu is live. Adding one more cocktail tomorrow 👀',
        mentions: ['sarahk'],
        time: '4h ago',
        likes: 15,
      },
    ],
  },
  {
    id: '3',
    user: mentionableUsers[4],
    body: '@neoncollective any chance for a later set time? Work ends at 8.',
    mentions: ['neoncollective'],
    time: '8h ago',
    likes: 3,
    replies: [],
  },
]

export interface SharedEventPayload {
  eventId: string
  title: string
  cover: string
  date: string
  location: string
  price: number | 'free'
}

export interface ChatMessage {
  id: string
  senderId: string
  type: 'text' | 'event_share' | 'image' | 'file'
  text?: string
  eventShare?: SharedEventPayload
  imageUrl?: string
  fileName?: string
  fileUrl?: string
  fileSize?: number
  time: string
  read: boolean
  mentions?: string[]
}

export interface Conversation {
  id: string
  participant: MentionUser
  lastMessage: string
  lastTime: string
  unread: number
  pinned?: boolean
  muted?: boolean
  eventContext?: string
  messages: ChatMessage[]
}

export const conversations: Conversation[] = [
  {
    id: 'creator-1',
    participant: mentionableUsers[3],
    lastMessage: 'VIP lounge opens at 9 — see you there!',
    lastTime: '45m ago',
    unread: 1,
    eventContext: 'Neon Nights: Summer Solstice',
    messages: [
      {
        id: 'm1',
        senderId: 'me',
        type: 'text',
        text: 'Hey! Quick question about the dress code for Saturday?',
        time: 'Yesterday 3:12 PM',
        read: true,
      },
      {
        id: 'm2',
        senderId: '4',
        type: 'text',
        text: 'Neon optional but encouraged! No strict dress code — come as you are ✨',
        time: 'Yesterday 3:28 PM',
        read: true,
      },
      {
        id: 'm3',
        senderId: 'me',
        type: 'text',
        text: 'Amazing. Also — can I upgrade to VIP at the door?',
        time: 'Today 10:15 AM',
        read: true,
      },
      {
        id: 'm4',
        senderId: '4',
        type: 'text',
        text: 'If VIP tickets are still available, yes! Otherwise pre-order on the app to guarantee your spot.',
        time: 'Today 10:22 AM',
        read: true,
      },
      {
        id: 'm5',
        senderId: '4',
        type: 'text',
        text: 'VIP lounge opens at 9 — see you there!',
        time: '45m ago',
        read: false,
      },
    ],
  },
  {
    id: 'user-1',
    participant: mentionableUsers[1],
    lastMessage: "@alexm I'm in! Already pre-ordered drinks",
    lastTime: '1h ago',
    unread: 0,
    eventContext: 'Neon Nights: Summer Solstice',
    messages: [
      {
        id: 'm2',
        senderId: 'me',
        type: 'event_share',
        eventShare: {
          eventId: '1',
          title: 'Neon Nights: Summer Solstice',
          cover: media.concert,
          date: 'Jul 18 · 9PM',
          location: 'The Warehouse',
          price: 35,
        },
        time: 'Yesterday 2:00 PM',
        read: true,
      },
      {
        id: 'm3',
        senderId: '2',
        type: 'text',
        text: "OMG yes!! I'm already going 😍",
        time: 'Yesterday 2:05 PM',
        read: true,
      },
      {
        id: 'm4',
        senderId: '2',
        type: 'text',
        text: 'Saw your comment — are you taking the metro or driving?',
        time: '2h ago',
        read: true,
      },
      {
        id: 'm5',
        senderId: 'me',
        type: 'text',
        text: 'Probably Uber with @sarahk, want to split?',
        time: '1h ago',
        read: true,
        mentions: ['sarahk'],
      },
      {
        id: 'm6',
        senderId: '2',
        type: 'text',
        text: "I'm in! Already pre-ordered drinks",
        time: '1h ago',
        read: true,
      },
    ],
  },
  {
    id: 'creator-2',
    participant: {
      id: '6',
      name: 'Skyline Events',
      handle: 'skylineevents',
      avatar: media.avatarSkyline,
      isCreator: true,
    },
    lastMessage: 'Your RSVP for Rooftop Jazz is confirmed!',
    lastTime: '2d ago',
    unread: 0,
    eventContext: 'Rooftop Jazz & Wine',
    messages: [
      {
        id: 'm1',
        senderId: '6',
        type: 'text',
        text: 'Thanks for RSVPing to Rooftop Jazz & Wine! 🎷',
        time: '2d ago',
        read: true,
      },
      {
        id: 'm2',
        senderId: '6',
        type: 'text',
        text: 'Your RSVP is confirmed! Seating is first-come for GA. Wine pairings available at the bar.',
        time: '2d ago',
        read: true,
      },
    ],
  },
]

export interface GroupConversation {
  id: string
  name: string
  description: string
  avatar: string
  members: MentionUser[]
  createdBy: string
  admins: string[]
  lastMessage: string
  lastTime: string
  unread: number
  pinned?: boolean
  muted?: boolean
  eventContext?: string
  messages: ChatMessage[]
}

/** Friends you can invite into a new group (excl. creators & self). */
export const groupInviteFriends: MentionUser[] = userProfiles
  .filter((u) => !u.isCreator && u.id !== 'me')
  .slice(0, 10)
  .map(({ id, name, handle, avatar, isCreator }) => ({ id, name, handle, avatar, isCreator }))

export const groupConversations: GroupConversation[] = [
  {
    id: 'group-neon-crew',
    name: 'Neon Night Crew',
    description: 'Carpool, fits & pre-game for Saturday. Tag who you mention.',
    avatar: media.concert,
    members: [
      { id: 'me', name: 'You', handle: 'you', avatar: media.avatarReza },
      mentionableUsers[1],
      mentionableUsers[2],
      mentionableUsers[0],
    ].filter(Boolean) as MentionUser[],
    createdBy: 'me',
    admins: ['me'],
    lastMessage: '@you Meet at Art’s Parking at 8:30?',
    lastTime: '20m ago',
    unread: 2,
    eventContext: 'Neon Nights: Summer Solstice',
    pinned: true,
    messages: [
      {
        id: 'gm1',
        senderId: 'system',
        type: 'text',
        text: 'You created Neon Night Crew',
        time: 'Yesterday',
        read: true,
      },
      {
        id: 'gm2',
        senderId: '2',
        type: 'text',
        text: 'Who’s grabbing a table in the lounge?',
        time: 'Yesterday 8:10 PM',
        read: true,
      },
      {
        id: 'gm3',
        senderId: 'me',
        type: 'text',
        text: '@alexm I can hold 6 if we arrive early',
        time: 'Yesterday 8:15 PM',
        read: true,
        mentions: ['alexm'],
      },
      {
        id: 'gm4',
        senderId: '3',
        type: 'text',
        text: '@everyone Meet at Art’s Parking at 8:30?',
        time: '20m ago',
        read: false,
        mentions: ['everyone'],
      },
    ],
  },
  {
    id: 'group-jazz-wine',
    name: 'Rooftop Jazz plan',
    description: 'Soft playlist picks + wine recommendations.',
    avatar: media.jazz,
    members: [
      { id: 'me', name: 'You', handle: 'you', avatar: media.avatarReza },
      mentionableUsers[1],
      mentionableUsers.find((u) => u.handle === 'sarahk') ?? mentionableUsers[2],
    ].filter(Boolean) as MentionUser[],
    createdBy: '2',
    admins: ['2', 'me'],
    lastMessage: 'Bring a light jacket — windy up there',
    lastTime: '1d ago',
    unread: 0,
    eventContext: 'Rooftop Jazz & Wine',
    messages: [
      {
        id: 'gm1',
        senderId: '2',
        type: 'text',
        text: 'Added you to the rooftop group 🎷',
        time: '2d ago',
        read: true,
      },
      {
        id: 'gm2',
        senderId: 'me',
        type: 'text',
        text: 'Excited! Any dress code?',
        time: '2d ago',
        read: true,
      },
      {
        id: 'gm3',
        senderId: '2',
        type: 'text',
        text: 'Bring a light jacket — windy up there',
        time: '1d ago',
        read: true,
      },
    ],
  },
]
