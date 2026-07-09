import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge, StarRating } from '../components/UI'
import { mainEvent, memories, ticketTypes, events, getEventMedia } from '../data/mockData'
import { media } from '../data/media'
import { EventMediaCarousel } from '../components/event/EventMediaCarousel'
import { RecurrenceBadge } from '../components/ui/RecurrenceBadge'
import {
  formatEventSchedule,
  formatRecurrence,
  getNextOccurrences,
  isRecurring,
  formatOccurrenceList,
} from '../types/recurrence'
import { eventComments, type Comment, type MentionUser, type SharedEventPayload } from '../data/socialData'
import { useActionFeedback } from '../hooks/useActionFeedback'
import { useSavedEvents } from '../context/SavedEventsContext'
import { useMenuTemplates } from '../context/MenuTemplatesContext'
import { useTickets } from '../context/TicketsContext'
import { useAuth } from '../context/AuthContext'
import { type PreorderCart } from '../components/menu/CheckoutMenuAddons'
import { EventMenuPanel } from '../components/event/EventMenuPanel'
import { EventCommentsPanel } from '../components/event/EventCommentsPanel'
import { FriendsGoingPill } from '../components/social/FriendsGoing'
import { EventDetailSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { useLoginGate } from '../context/LoginGateContext'

const EventMap = lazy(() =>
  import('../components/ui/EventMap').then((m) => ({ default: m.EventMap })),
)
const ShareEventModal = lazy(() =>
  import('../components/Social').then((m) => ({ default: m.ShareEventModal })),
)

const allTabs = ['About', 'Menu', 'Memories', 'Comments'] as const
type EventTab = (typeof allTabs)[number]

const COUNTDOWN_PARTS = [
  { v: '09', l: 'Days' },
  { v: '14', l: 'Hrs' },
  { v: '32', l: 'Min' },
] as const

function EventCountdown({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="mb-3 text-sm text-slate-400">Starting in</p>
      <div className="flex gap-3">
        {COUNTDOWN_PARTS.map((t) => (
          <div key={t.l} className="flex-1 rounded-xl bg-white/5 py-3 text-center">
            <div className="text-2xl font-bold tabular-nums">{t.v}</div>
            <div className="text-xs text-slate-400">{t.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requireLogin } = useLoginGate()
  const { isAuthenticated } = useAuth()
  const routeState = location.state as { tab?: EventTab; eventId?: string; cover?: string } | null
  const { saved, unsaved } = useActionFeedback()
  const { isSaved, toggleSave } = useSavedEvents()
  const { tickets } = useTickets()
  const { getCheckoutMenu } = useMenuTemplates()
  const menu = getCheckoutMenu()
  const [liked, setLiked] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [comments, setComments] = useState(eventComments)
  const [replyTo, setReplyTo] = useState<MentionUser | undefined>()
  const [preorderCart, setPreorderCart] = useState<PreorderCart>({})
  const event = events.find((e) => e.id === routeState?.eventId) ?? mainEvent
  const { isLoading: eventLoading } = useSimulatedQuery(event, [event.id], { delay: 600 })
  const mediaItems = getEventMedia(event)
  const hasTicket = tickets.some((t) => t.eventId === event.id && t.status === 'upcoming')
  const isPastEvent = event.status === 'past'
  const isUpcomingEvent = event.status === 'upcoming' || event.status === 'live'
  const tabs = isPastEvent ? allTabs : (['About', 'Menu', 'Comments'] as const)
  const initialTab: EventTab =
    routeState?.tab === 'Memories' && !isPastEvent
      ? 'About'
      : routeState?.tab && (tabs as readonly EventTab[]).includes(routeState.tab)
        ? routeState.tab
        : 'About'
  const [tab, setTab] = useState<EventTab>(initialTab)
  const titleSentinelRef = useRef<HTMLDivElement>(null)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const upcomingDates =
    isRecurring(event.recurrence) && event.seriesStart
      ? formatOccurrenceList(getNextOccurrences(event.recurrence!, event.seriesStart, 5))
      : []

  const sharePayload: SharedEventPayload = {
    eventId: event.id,
    title: event.title,
    cover: event.cover,
    date: `${event.date} · ${event.time}`,
    location: event.location,
    price: event.price,
  }

  const shareToFriend = (userId: string) => {
    const chatId = userId === '4' ? 'creator-1' : `user-${userId}`
    navigate(`/messages?chat=${chatId}`, { state: { pendingShare: sharePayload } })
    setShowShare(false)
  }

  const scheduleLine = `${formatEventSchedule({
    date: event.date,
    time: event.time,
    recurrence: event.recurrence,
    seriesStart: event.seriesStart,
  })}${!isRecurring(event.recurrence) ? ` – ${event.endTime}` : ''}`

  useEffect(() => {
    const sentinel = titleSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [event.id])

  if (eventLoading) {
    return <EventDetailSkeleton />
  }

  return (
    <div className="min-h-screen pb-24">
      <div
        className={`fixed inset-x-0 top-14 z-40 flex justify-center transition-[opacity,transform] duration-200 lg:top-16 ${
          showStickyHeader ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <header
          className={`web-container w-full border-b border-white/10 bg-[#0a0a0f]/95 pb-2.5 pt-3 backdrop-blur-xl transition-transform duration-200 ${
            showStickyHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          aria-hidden={!showStickyHeader}
        >
        <div className="flex items-start gap-2">
          <Link
            to="/feed"
            className="mt-0.5 shrink-0 rounded-full p-1.5 text-lg leading-none hover:bg-white/10"
            tabIndex={showStickyHeader ? 0 : -1}
          >
            ←
          </Link>
          <div className="min-w-0 flex-1 text-left">
            <h2 className="truncate text-sm font-semibold">{event.title}</h2>
            <p className="truncate text-xs text-slate-400">{scheduleLine}</p>
            <p className="truncate text-xs text-slate-400">📍 {event.location}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => requireLogin(() => setShowShare(true))}
              className="rounded-full p-1.5 hover:bg-white/10"
              tabIndex={showStickyHeader ? 0 : -1}
            >
              ↗
            </button>
            <button
              type="button"
              onClick={() => {
                requireLogin(() => {
                  const added = toggleSave(event.id)
                  if (added) saved()
                  else unsaved()
                })
              }}
              className={`rounded-full p-1.5 hover:bg-white/10 ${isSaved(event.id) ? 'text-[#ffd60a]' : ''}`}
              tabIndex={showStickyHeader ? 0 : -1}
            >
              🔖
            </button>
          </div>
        </div>
        </header>
      </div>

      <div className="relative h-72 overflow-hidden lg:h-[min(52vh,480px)]">
        <div className="absolute inset-0">
          <EventMediaCarousel
            items={mediaItems}
            alt={event.title}
            aspectClassName="h-full"
            dotsPosition="right"
            showBottomGradient
          />
        </div>
        <Link to="/feed" className="absolute left-4 top-4 z-30 rounded-full bg-black/50 p-2 backdrop-blur lg:left-8 lg:top-6">
          ←
        </Link>
        <div className="absolute right-4 top-4 z-30 flex gap-2 lg:right-8 lg:top-6">
          <button
            type="button"
            onClick={() => requireLogin(() => setShowShare(true))}
            className="rounded-full bg-black/50 p-2 backdrop-blur"
          >
            ↗
          </button>
          <button
            type="button"
            onClick={() => {
              requireLogin(() => {
                const added = toggleSave(event.id)
                if (added) saved()
                else unsaved()
              })
            }}
            className={`rounded-full bg-black/50 p-2 backdrop-blur ${isSaved(event.id) ? 'text-[#ffd60a]' : ''}`}
          >
            🔖
          </button>
        </div>
      </div>

      <div className="web-container py-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
          <div className="min-w-0">
        <div className="flex items-center gap-2">
          <img src={event.creator.avatar} alt="" className="h-8 w-8 rounded-full border-2 border-primary" />
          <Link to={`/page/${event.creator.handle}`} className="text-sm font-medium text-primary-light">
            {event.creator.name} ✓
          </Link>
        </div>
        <h1 className="mt-2 text-2xl font-bold">{event.title}</h1>
        <p className="mt-1 text-slate-400">{scheduleLine}</p>
        <p className="text-slate-400">📍 {event.location}</p>
        <div ref={titleSentinelRef} className="h-px w-full" aria-hidden />

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="primary">{event.category}</Badge>
          <RecurrenceBadge recurrence={event.recurrence} time={event.time} />
          <Badge>{event.format}</Badge>
          <Badge>{event.ageRestriction}</Badge>
          <Badge variant="warning">{event.sold}/{event.capacity} sold</Badge>
        </div>

        {isUpcomingEvent && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:hidden">
            <EventCountdown />
          </div>
        )}

        {/* Social proof from past editions — upcoming / live only */}
        {isUpcomingEvent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <StarRating rating={event.creator.rating} />
              <span className="font-semibold">{event.creator.rating}</span>
              <span className="text-sm text-slate-400">
                from {event.creator.reviewCount} verified attendees
              </span>
            </div>
            <p className="mt-2 text-sm italic text-slate-300">
              &ldquo;Best night of the summer! The visuals were insane.&rdquo;
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {memories[0].media.map((m, i) => (
                <img key={i} src={m} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              ))}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs">
                +89
              </div>
            </div>
            <p className="mt-2 text-xs text-primary-light">
              Photos from past {event.creator.name} events
            </p>
          </motion.div>
        )}

        {isPastEvent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
          >
            <p className="text-sm font-medium text-slate-300">This event has ended</p>
            <button
              type="button"
              onClick={() => setTab('Memories')}
              className="mt-2 text-sm text-primary-light"
            >
              See attendee memories →
            </button>
          </motion.div>
        )}

        {event.friendsGoing > 0 && (
          <div className="mt-3">
            <FriendsGoingPill eventId={event.id} count={event.friendsGoing} variant="inline" />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-b-2 border-primary text-primary-light'
                  : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 text-left">
          {tab === 'About' && (
            <>
              <p className="text-slate-300 leading-relaxed">{event.description}</p>
              {isRecurring(event.recurrence) && (
                <div className="mt-4 rounded-[18px] liquid-glass-subtle p-4 text-left">
                  <p className="ios-caption">Recurring schedule</p>
                  <p className="mt-1 font-medium text-[#64d2ff]">
                    {formatRecurrence(event.recurrence!, event.time)}
                  </p>
                  {upcomingDates.length > 0 && (
                    <div className="mt-3">
                      <p className="ios-caption mb-2">Upcoming dates</p>
                      <div className="flex flex-wrap gap-2">
                        {upcomingDates.map((d) => (
                          <span key={d} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <Suspense
                  fallback={
                    <div className="h-[200px] animate-pulse rounded-[18px] bg-surface-2" />
                  }
                >
                  <EventMap
                    lat={event.lat}
                    lng={event.lng}
                    label={`${event.location} · ${event.address}`}
                    height={200}
                  />
                </Suspense>
              </div>
              <h3 className="mt-6 font-semibold lg:hidden">Tickets</h3>
              <div className="lg:hidden">
              {ticketTypes.map((tt) => (
                <div
                  key={tt.id}
                  className={`mt-2 flex items-center justify-between rounded-xl glass p-4 ${
                    tt.available === 0 ? 'opacity-50' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{tt.name}</p>
                    <p className="text-xs text-slate-400">{tt.perks.join(' · ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${tt.price}</p>
                    {tt.available === 0 ? (
                      <p className="text-xs text-danger">Sold out</p>
                    ) : (
                      <p className="text-xs text-slate-400">{tt.available} left</p>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </>
          )}

          {tab === 'Menu' && (
            <EventMenuPanel
              menu={menu}
              event={event}
              isAuthenticated={isAuthenticated}
              hasTicket={hasTicket}
              cart={preorderCart}
              onCartChange={setPreorderCart}
              onGetTickets={() => requireLogin(() => navigate('/checkout', { state: { event } }))}
            />
          )}

          {tab === 'Memories' && isPastEvent && (
            <div className="space-y-4">
              {memories.map((m) => (
                <div key={m.id} className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <img src={m.user.avatar} alt="" className="h-9 w-9 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{m.user.name}</p>
                      <p className="text-xs text-success">✓ Verified attendee</p>
                    </div>
                    <span className="ml-auto text-warning text-sm">{'★'.repeat(m.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm">{m.body}</p>
                  {m.media[0] && (
                    <img src={m.media[0]} alt="" className="mt-2 rounded-lg aspect-video w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'Comments' && (
            <EventCommentsPanel
              comments={comments}
              isAuthenticated={isAuthenticated}
              replyTo={replyTo}
              onSubmit={(text) => {
                const mentions = [...text.matchAll(/@(\w+)/g)].map((m) => m[1])
                const newComment: Comment = {
                  id: `new-${Date.now()}`,
                  user: {
                    id: 'me',
                    name: 'You',
                    handle: 'you',
                    avatar: media.avatarReza,
                  },
                  body: text,
                  mentions,
                  time: 'Just now',
                  likes: 0,
                  replies: [],
                }
                setComments([newComment, ...comments])
                setReplyTo(undefined)
              }}
              onReply={(user) => {
                setReplyTo(user)
                setTab('Comments')
              }}
              onClearReply={() => setReplyTo(undefined)}
            />
          )}
        </div>
          </div>

          {isUpcomingEvent && (
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <EventCountdown />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-semibold">Tickets</h3>
                  {ticketTypes.map((tt) => (
                    <div
                      key={tt.id}
                      className={`mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 ${
                        tt.available === 0 ? 'opacity-50' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium">{tt.name}</p>
                        <p className="text-xs text-slate-400">{tt.perks.join(' · ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${tt.price}</p>
                        {tt.available === 0 ? (
                          <p className="text-xs text-danger">Sold out</p>
                        ) : (
                          <p className="text-xs text-slate-400">{tt.available} left</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => requireLogin(() => navigate('/checkout', { state: { event } }))}
                    className="mt-4 w-full rounded-xl gradient-hero py-3.5 text-center font-bold text-white shadow-lg shadow-primary/30"
                  >
                    Get Tickets · from ${event.price === 'free' ? 'Free' : `$${event.price}`}
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Sticky CTA — mobile / tablet only; desktop uses sidebar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center lg:hidden">
        <div className="pointer-events-auto web-container border-t border-white/10 bg-surface/95 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={() => requireLogin(() => setLiked(!liked))}
            className={`text-2xl ${liked ? 'text-pink-500' : ''}`}
          >
            {liked ? '♥' : '♡'}
          </motion.button>
          <button
            type="button"
            onClick={() => requireLogin(() => navigate('/messages?chat=creator-1'))}
            className="rounded-xl glass px-3 py-3.5 text-lg"
            title="Message creator"
          >
            💬
          </button>
          {isPastEvent ? (
            <button
              type="button"
              onClick={() => setTab('Memories')}
              className="flex-1 rounded-xl bg-white/10 py-3.5 text-center font-bold"
            >
              View memories
            </button>
          ) : (
            <button
              type="button"
              onClick={() => requireLogin(() => navigate('/checkout', { state: { event } }))}
              className="flex-1 rounded-xl gradient-hero py-3.5 text-center font-bold text-white shadow-lg shadow-primary/30"
            >
              Get Tickets · from ${event.price === 'free' ? 'Free' : `$${event.price}`}
            </button>
          )}
        </div>
        </div>
      </div>

      {showShare && (
        <Suspense fallback={null}>
          <ShareEventModal
            event={sharePayload}
            onClose={() => setShowShare(false)}
            onShareToChat={shareToFriend}
          />
        </Suspense>
      )}
    </div>
  )
}
