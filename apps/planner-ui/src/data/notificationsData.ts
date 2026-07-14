export type NotificationItem = {
  id: string
  text: string
  time: string
  to: string
  unread?: boolean
  icon?: string
}

export const notifications: NotificationItem[] = [
  { id: '1', text: 'Jordan is going to Neon Nights', time: '2m ago', to: '/event', unread: true, icon: '🎟️' },
  { id: '2', text: 'Your ticket for Rooftop Jazz is ready', time: '1h ago', to: '/my-events', unread: true, icon: '✅' },
  { id: '3', text: 'Neon Collective posted an update', time: '3h ago', to: '/page/neoncollective', unread: false, icon: '📣' },
  { id: '4', text: 'Sarah accepted your follow request', time: 'Yesterday', to: '/user/sarahk', unread: false, icon: '👋' },
  { id: '5', text: 'Early bird tickets for Neon Nights are 80% gone', time: 'Yesterday', to: '/event', unread: false, icon: '🔥' },
  { id: '6', text: 'Marcus shared Rooftop Jazz & Wine with you', time: '2 days ago', to: '/event', unread: false, icon: '↗️' },
]
