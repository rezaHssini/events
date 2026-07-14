import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'
import { Badge } from '../components/UI'
import { perks, menuOrders, type Event } from '../data/mockData'
import { useTickets, type PurchasedTicket } from '../context/TicketsContext'
import { useSavedEvents } from '../context/SavedEventsContext'
import { PostComposer } from '../components/feed/PostComposer'

const tabs = ['Going', 'Past', 'Saved'] as const
type Tab = (typeof tabs)[number]

function EventListItem({
  entry,
  onSelect,
}: {
  entry: PurchasedTicket
  onSelect: () => void
}) {
  const { event, ticketTypeName, status, holder } = entry
  const { getHolderLabel } = useTickets()
  const holderLabel = getHolderLabel(holder)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="mb-3 flex w-full gap-3 rounded-2xl glass p-3 text-left card-hover"
    >
      <img src={event.cover} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight line-clamp-2">{event.title}</p>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {status === 'past' ? 'Attended' : `${event.date} · ${event.time}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {status === 'upcoming' && <Badge variant="success">Valid</Badge>}
          {ticketTypeName.toLowerCase().includes('vip') && <Badge variant="primary">VIP</Badge>}
          {holder.kind !== 'self' && <Badge variant="default">For {holderLabel}</Badge>}
          {status === 'past' && <Badge variant="default">Past</Badge>}
        </div>
      </div>
    </motion.button>
  )
}

function SavedEventListItem({
  event,
  onUnsave,
}: {
  event: Event
  onUnsave: () => void
}) {
  return (
    <div className="mb-3 flex gap-3 rounded-2xl glass p-3 text-left card-hover">
      <Link to="/event" state={{ eventId: event.id }} className="flex min-w-0 flex-1 gap-3">
        <img src={event.cover} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-tight line-clamp-2">{event.title}</p>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {event.date} · {event.time}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="warning">Saved</Badge>
            <Badge variant="default">{event.category}</Badge>
            {event.price === 'free' ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="primary">${event.price}</Badge>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={onUnsave}
        aria-label="Remove from saved"
        className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-[#ffd60a]/15 text-[#ffd60a]"
      >
        <Bookmark className="h-5 w-5 fill-current" />
      </button>
    </div>
  )
}

function EventDetail({
  entry,
  onBack,
}: {
  entry: PurchasedTicket
  onBack: () => void
}) {
  const { event, ticketTypeName, status, holder } = entry
  const { getHolderLabel } = useTickets()
  const [composerOpen, setComposerOpen] = useState(false)
  const isMainTicket = event.id === '1' && status === 'upcoming' && holder.kind === 'self'

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="min-h-screen"
    >
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <h2 className="flex-1 truncate text-sm font-semibold">{event.title}</h2>
      </header>

      <div className="p-4">
        <div className="relative mb-5 overflow-hidden rounded-2xl">
          <img src={event.cover} alt="" className="h-44 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
            <div className="flex flex-wrap gap-2">
              {status === 'upcoming' && <Badge variant="success">Valid ticket</Badge>}
              {ticketTypeName.toLowerCase().includes('vip') && <Badge variant="primary">VIP</Badge>}
              <Badge variant="default">{event.category}</Badge>
              {holder.kind !== 'self' && (
                <Badge variant="default">Assigned to {getHolderLabel(holder)}</Badge>
              )}
            </div>
            <h1 className="mt-2 text-xl font-bold">{event.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
              <Clock className="h-3.5 w-3.5" />
              {status === 'past' ? 'Attended' : `${event.date} · ${event.time}`}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              {event.location} · {event.address}
            </p>
          </div>
        </div>

        {status === 'upcoming' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-2xl gradient-hero shadow-2xl shadow-primary/25"
          >
            <div className="p-5">
              <p className="text-center text-sm font-medium opacity-80">
                {holder.kind === 'self' ? 'Your entry QR' : `QR for ${getHolderLabel(holder)}`}
              </p>
              <div className="mt-4 flex justify-center">
                <div className="rounded-2xl bg-white p-3">
                  <div className="flex h-36 w-36 items-center justify-center bg-[repeating-linear-gradient(45deg,#111_0,#111_2px,transparent_2px,transparent_6px)]">
                    <div className="h-24 w-24 rounded-lg border-4 border-black bg-white" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs opacity-70">
                Ticket #{entry.id.slice(-6).toUpperCase()} · {ticketTypeName}
              </p>
              <p className="mt-1 text-center text-xs opacity-60">Tap to brighten at the door</p>
            </div>
          </motion.div>
        )}

        {isMainTicket && (
          <>
            <h3 className="mb-2 text-left text-sm font-semibold">Included perks</h3>
            <div className="mb-5 space-y-2">
              {perks.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl glass p-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.total - p.used} left</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mb-2 text-left text-sm font-semibold">Pre-orders</h3>
            {menuOrders.map((o) => (
              <div
                key={o.id}
                className={`mb-3 rounded-xl p-4 text-left ${
                  o.status === 'ready' ? 'border border-success/40 bg-success/10' : 'glass'
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-medium">Code {o.code}</p>
                  <Badge variant={o.status === 'ready' ? 'success' : 'warning'}>
                    {o.status === 'ready' ? 'Ready!' : o.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {o.items.map((i) => i.name).join(', ')}
                </p>
              </div>
            ))}
          </>
        )}

        {status === 'past' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="block w-full rounded-xl bg-primary/20 py-3 text-center text-sm font-medium text-primary-light"
            >
              Share a post
            </button>
          </div>
        )}

        <div className="rounded-xl glass p-4 text-left text-sm text-slate-300">
          <p className="font-medium text-white">About this event</p>
          <p className="mt-2 leading-relaxed">{event.description}</p>
          <p className="mt-3 text-slate-400">
            {event.format} · {event.ageRestriction} · Hosted by {event.creator.name}
          </p>
        </div>

        <Link
          to="/event"
          state={{ event }}
          className="mt-4 block rounded-xl bg-white/10 py-3 text-center text-sm font-semibold"
        >
          View full event page
        </Link>
      </div>

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        defaultMemory
        defaultEventId={event.id}
        defaultEventTitle={event.title}
      />
    </motion.div>
  )
}

export default function MyEventsPage() {
  const { tickets } = useTickets()
  const { getSavedEvents, unsave } = useSavedEvents()
  const [tab, setTab] = useState<Tab>('Going')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const savedEvents = getSavedEvents()
  const selected = tickets.find((e) => e.id === selectedId)

  const tabCount = (t: Tab) => {
    if (t === 'Saved') return savedEvents.length
    return tickets.filter((e) => (t === 'Going' ? e.status === 'upcoming' : e.status === 'past')).length
  }

  if (selected) {
    return <EventDetail entry={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-4 backdrop-blur-xl">
        <h1 className="text-xl font-bold gradient-text">My Events</h1>
        <p className="text-xs text-slate-400">Going, past & saved — yours only</p>
        <div className="mt-3 flex gap-1 rounded-xl glass p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                tab === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'
              }`}
            >
              {t}
              <span className="ml-1 text-xs opacity-70">({tabCount(t)})</span>
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div hidden={tab !== 'Saved'}>
          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <SavedEventListItem
                key={event.id}
                event={event}
                onUnsave={() => unsave(event.id)}
              />
            ))
          ) : (
            <div className="rounded-2xl glass p-8 text-center">
              <p className="text-4xl">🔖</p>
              <p className="mt-3 font-semibold">No saved events</p>
              <p className="mt-1 text-sm text-slate-400">
                Bookmark events from your feed or event pages to find them here
              </p>
              <Link
                to="/explorer"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
              >
                Discover events
              </Link>
            </div>
          )}
        </div>

        <div hidden={tab !== 'Going'}>
          {tickets.filter((e) => e.status === 'upcoming').length > 0 ? (
            tickets
              .filter((e) => e.status === 'upcoming')
              .map((entry) => (
                <EventListItem
                  key={entry.id}
                  entry={entry}
                  onSelect={() => setSelectedId(entry.id)}
                />
              ))
          ) : (
            <div className="rounded-2xl glass p-8 text-center">
              <p className="text-4xl">🎫</p>
              <p className="mt-3 font-semibold">Nothing you&apos;re going to yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Tickets you buy will show up here
              </p>
              <Link
                to="/explorer"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
              >
                Discover events
              </Link>
            </div>
          )}
        </div>

        <div hidden={tab !== 'Past'}>
          {tickets.filter((e) => e.status === 'past').length > 0 ? (
            tickets
              .filter((e) => e.status === 'past')
              .map((entry) => (
                <EventListItem
                  key={entry.id}
                  entry={entry}
                  onSelect={() => setSelectedId(entry.id)}
                />
              ))
          ) : (
            <div className="rounded-2xl glass p-8 text-center">
              <p className="text-4xl">📸</p>
              <p className="mt-3 font-semibold">No past events</p>
              <p className="mt-1 text-sm text-slate-400">
                Past events you attended will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
