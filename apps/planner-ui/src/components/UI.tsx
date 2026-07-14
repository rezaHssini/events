import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../data/mockData'
import { getEventMedia } from '../data/mockData'
import { useActionFeedback } from '../hooks/useActionFeedback'
import { useSavedEvents } from '../context/SavedEventsContext'
import { RecurrenceBadge } from './ui/RecurrenceBadge'
import { formatEventSchedule } from '../types/recurrence'
import { FriendsGoingPill } from './social/FriendsGoing'
import { EventMediaCarousel } from './event/EventMediaCarousel'

export function EventCard({
  event,
  compact,
  distance,
  trendingRank,
}: {
  event: Event
  compact?: boolean
  distance?: string
  trendingRank?: number
}) {
  const navigate = useNavigate()
  const { liked, shared, saved, unsaved } = useActionFeedback()
  const { isSaved, toggleSave } = useSavedEvents()
  const mediaItems = getEventMedia(event)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`feed-card overflow-hidden ${compact ? '' : 'mb-4'}`}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate('/event', { state: { eventId: event.id, cover: event.cover } })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate('/event', { state: { eventId: event.id, cover: event.cover } })
          }
        }}
        className="block w-full cursor-pointer overflow-hidden"
      >
        <div className="relative w-full overflow-hidden bg-surface-2">
          <EventMediaCarousel items={mediaItems} alt={event.title} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {distance && (
                <span className="rounded-full bg-[#30d158]/25 px-2.5 py-1 text-[11px] font-semibold text-[#30d158]">
                  📍 {distance}
                </span>
              )}
              {trendingRank != null && (
                <span className="rounded-full bg-[#ffd60a]/25 px-2.5 py-1 text-[11px] font-semibold text-[#ffd60a]">
                  🔥 #{trendingRank}
                </span>
              )}
              <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold">
                {event.category}
              </span>
              <RecurrenceBadge recurrence={event.recurrence} time={event.time} compact />
              {event.price === 'free' ? (
                <span className="rounded-full bg-success/90 px-2.5 py-1 text-[11px] font-semibold">FREE</span>
              ) : (
                <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                  ${event.price}
                </span>
              )}
            </div>
            {event.friendsGoing > 0 && (
              <FriendsGoingPill
                eventId={event.id}
                count={event.friendsGoing}
                className="shrink-0"
              />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/page/${event.creator.handle}`)
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={event.creator.avatar}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-primary"
                />
                <span className="text-sm font-medium hover:text-primary-light">
                  {event.creator.name}
                </span>
              </button>
              {event.creator.verified && (
                <span className="text-secondary text-xs">✓</span>
              )}
            </div>
            <h3 className="text-lg font-bold leading-tight">{event.title}</h3>
            <p className="mt-1 text-sm text-slate-300">
              {formatEventSchedule({
                date: event.date,
                time: event.time,
                recurrence: event.recurrence,
                seriesStart: event.seriesStart,
              })}{' '}
              · {event.location}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-4 text-sm text-slate-400">
          <button type="button" onClick={liked} className="flex items-center gap-1 hover:text-pink-400 transition-colors">
            ♥ {event.likes}
          </button>
          <button type="button" onClick={() => shared()} className="flex items-center gap-1 hover:text-secondary transition-colors">
            💬 {event.comments}
          </button>
          <button type="button" onClick={shared} className="hover:text-white transition-colors">↗ Share</button>
        </div>
        <button
          type="button"
          onClick={() => {
            const added = toggleSave(event.id)
            if (added) saved()
            else unsaved()
          }}
          className={`transition-colors ${isSaved(event.id) ? 'text-warning' : 'text-slate-400 hover:text-warning'}`}
        >
          🔖
        </button>
      </div>
    </motion.article>
  )
}

export function Avatar({ src, size = 'md' }: { src: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }
  return <img src={src} alt="" className={`${sizes[size]} rounded-full object-cover`} />
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'primary'
}) {
  const variants = {
    default: 'bg-white/10 text-[rgba(235,235,245,0.75)]',
    success: 'bg-[#30d158]/20 text-[#30d158]',
    warning: 'bg-[#ffd60a]/20 text-[#ffd60a]',
    primary: 'bg-[#0a84ff]/20 text-[#64b5ff]',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function MobileHeader({
  title,
  back,
}: {
  title: string
  back?: string
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
      {back && (
        <Link to={back} className="text-slate-400 hover:text-white">
          ←
        </Link>
      )}
      <h2 className="flex-1 text-center font-semibold">{title}</h2>
      <div className="w-6" />
    </header>
  )
}

export function BottomNav() {
  const items = [
    { to: '/feed', icon: '🏠', label: 'Home' },
    { to: '/find-people', icon: '👥', label: 'People' },
    { to: '/messages', icon: '💬', label: 'Chat' },
    { to: '/wallet', icon: '🎫', label: 'Tickets' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ]
  return (
    <nav className="sticky bottom-0 flex border-t border-white/10 bg-surface/95 backdrop-blur-xl">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-slate-400 hover:text-primary-light transition-colors"
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <span className={`${textSize} text-warning`}>
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? '½' : ''}
      <span className="text-slate-600">{'★'.repeat(5 - Math.ceil(rating))}</span>
    </span>
  )
}
