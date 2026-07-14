import { useEffect, useRef, useState } from 'react'
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
import { EventMenuBrowse } from '../components/menu/EventMenuBrowse'
import { preorderCartTotal, type PreorderCart } from '../components/menu/CheckoutMenuAddons'
import { FriendsGoingPill } from '../components/social/FriendsGoing'
import { EventMap } from '../components/ui/EventMap'
import { CommentComposer, CommentThread } from '../components/CommentMentions'
import { ShareEventModal } from '../components/Social'

const allTabs = ['About', 'Menu', 'Memories', 'Comments'] as const
type EventTab = (typeof allTabs)[number]

export default function EventDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
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
  const mediaItems = getEventMedia(event)
  const hasTicket = tickets.some((t) => t.eventId === event.id && t.status === 'upcoming')
  const cartCount = Object.values(preorderCart).reduce((a, b) => a + b, 0)
  const cartTotal = preorderCartTotal(menu, preorderCart)
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

  return (
    <div className="min-h-screen pb-24">
      <div
        className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-[opacity,transform] duration-200 ${
          showStickyHeader ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <header
          className={`w-full max-w-md border-b border-white/10 bg-[#0a0a0f]/95 px-4 pb-2.5 pt-[max(env(safe-area-inset-top,0px),8px)] backdrop-blur-xl transition-transform duration-200 ${
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
              onClick={() => setShowShare(true)}
              className="rounded-full p-1.5 hover:bg-white/10"
              tabIndex={showStickyHeader ? 0 : -1}
            >
              ↗
            </button>
            <button
              type="button"
              onClick={() => {
                const added = toggleSave(event.id)
                if (added) saved()
                else unsaved()
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

      <div className="relative h-72 overflow-hidden">
        <div className="absolute inset-0">
          <EventMediaCarousel
            items={mediaItems}
            alt={event.title}
            aspectClassName="h-full"
            dotsPosition="right"
            showBottomGradient
          />
        </div>
        <Link to="/feed" className="absolute left-4 top-4 z-30 rounded-full bg-black/50 p-2 backdrop-blur">
          ←
        </Link>
        <div className="absolute right-4 top-4 z-30 flex gap-2">
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="rounded-full bg-black/50 p-2 backdrop-blur"
          >
            ↗
          </button>
          <button
            type="button"
            onClick={() => {
              const added = toggleSave(event.id)
              if (added) saved()
              else unsaved()
            }}
            className={`rounded-full bg-black/50 p-2 backdrop-blur ${isSaved(event.id) ? 'text-[#ffd60a]' : ''}`}
          >
            🔖
          </button>
        </div>
        {isUpcomingEvent && (
          <div className="absolute left-4 right-4 top-14 z-30">
            <div className="flex justify-center gap-2">
              {[
                { v: '09', l: 'Days' },
                { v: '14', l: 'Hrs' },
                { v: '32', l: 'Min' },
              ].map((t) => (
                <div key={t.l} className="rounded-xl bg-black/60 px-3 py-2 text-center backdrop-blur">
                  <div className="text-xl font-bold tabular-nums">{t.v}</div>
                  <div className="text-[10px] text-slate-400">{t.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-20 -mt-16 px-4">
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
          <div hidden={tab !== 'About'}>
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
                <EventMap
                  lat={event.lat}
                  lng={event.lng}
                  label={`${event.location} · ${event.address}`}
                  height={200}
                />
              </div>
              <h3 className="mt-6 font-semibold">Tickets</h3>
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

          <div hidden={tab !== 'Menu'}>
            <div>
              <p className="mb-1 text-sm text-slate-400">
                {menu.menuType} menu
                {menu.preorderEnabled ? ' · Pre-order available' : ' · View only'}
              </p>
              {hasTicket && menu.preorderEnabled ? (
                <p className="mb-3 text-xs text-[#30d158]">
                  You have a ticket — add items to your pre-order below
                </p>
              ) : (
                <p className="mb-3 text-xs text-slate-500">
                  Tap items for full details, photos & reviews
                </p>
              )}
              <EventMenuBrowse
                menu={menu}
                eventId={event.id}
                canOrder={hasTicket && menu.preorderEnabled}
                cart={preorderCart}
                onCartChange={setPreorderCart}
              />
              {hasTicket && menu.preorderEnabled && cartCount > 0 && (
                <div className="mt-4 rounded-[18px] liquid-glass p-4">
                  <p className="font-semibold">
                    Pre-order · {cartCount} item{cartCount === 1 ? '' : 's'} · ${cartTotal.toFixed(2)}
                  </p>
                  <Link
                    to="/checkout"
                    state={{ event, preorderCart }}
                    className="mt-3 block rounded-xl bg-primary py-3 text-center font-medium"
                  >
                    Continue to checkout →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div hidden={tab !== 'Memories' || !isPastEvent}>
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
          </div>

          <div hidden={tab !== 'Comments'}>
            <div className="space-y-4 pb-4">
              <CommentComposer
                  replyTo={replyTo}
                  onSubmit={(text, imageUrl) => {
                    const mentions = [...text.matchAll(/@(\w+)/g)].map((m) => m[1])
                    const newComment: Comment = {
                      id: `new-${Date.now()}`,
                      user: {
                        id: 'me',
                        name: 'You',
                        handle: 'you',
                        avatar: media.avatarReza,
                      },
                      body: text || (imageUrl ? '📷' : ''),
                      mentions,
                      time: 'Just now',
                      likes: 0,
                      replies: [],
                      imageUrl,
                    }
                    setComments([newComment, ...comments])
                    setReplyTo(undefined)
                  }}
                />
                <div className="space-y-5 pt-2">
                  {comments.map((c) => (
                    <CommentThread
                      key={c.id}
                      comment={c}
                      onReply={(user) => {
                        setReplyTo(user)
                        setTab('Comments')
                      }}
                    />
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md border-t border-white/10 bg-surface/95 p-4 pb-[max(env(safe-area-inset-bottom,0px),16px)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={() => setLiked(!liked)}
            className={`text-2xl ${liked ? 'text-pink-500' : ''}`}
          >
            {liked ? '♥' : '♡'}
          </motion.button>
          <Link
            to="/messages?chat=creator-1"
            className="rounded-xl glass px-3 py-3.5 text-lg"
            title="Message creator"
          >
            💬
          </Link>
          {isPastEvent ? (
            <button
              type="button"
              onClick={() => setTab('Memories')}
              className="flex-1 rounded-xl bg-white/10 py-3.5 text-center font-bold"
            >
              View memories
            </button>
          ) : (
            <Link
              to="/checkout"
              state={{ event }}
              className="flex-1 rounded-xl gradient-hero py-3.5 text-center font-bold text-white shadow-lg shadow-primary/30"
            >
              Get Tickets · from ${event.price === 'free' ? 'Free' : `$${event.price}`}
            </Link>
          )}
        </div>
        </div>
      </div>

      {showShare && (
        <ShareEventModal
          event={sharePayload}
          onClose={() => setShowShare(false)}
          onShareToChat={shareToFriend}
        />
      )}
    </div>
  )
}
