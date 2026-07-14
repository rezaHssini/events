import { media } from './media'
import type { MenuItemReview } from '../types/menu'
import { events } from './mockData'

export const INITIAL_MENU_REVIEWS: MenuItemReview[] = [
  {
    id: 'mr-1',
    itemId: '1',
    eventId: events[0].id,
    user: { id: 'u2', name: 'Sarah K.', avatar: media.avatarSarah },
    rating: 5,
    body: 'The glow ice is such a fun touch — tastes as good as it looks.',
    time: '2 days ago',
  },
  {
    id: 'mr-2',
    itemId: '1',
    eventId: events[0].id,
    user: { id: 'u3', name: 'Marcus T.', avatar: media.avatarAlex },
    rating: 4,
    body: 'Strong ginger kick. Would order again.',
    time: '1 week ago',
  },
  {
    id: 'mr-3',
    itemId: '4',
    eventId: events[0].id,
    user: { id: 'u4', name: 'Elena R.', avatar: media.avatarEmma },
    rating: 5,
    body: 'Crispy, salty, truffle heaven. Share if you must.',
    time: '3 days ago',
  },
  {
    id: 'mr-4',
    itemId: '5',
    eventId: events[0].id,
    user: { id: 'u5', name: 'Jordan L.', avatar: media.avatarJordan },
    rating: 4,
    body: 'Surprisingly filling for a festival menu. Tahini dressing is perfect.',
    time: '5 days ago',
  },
]
