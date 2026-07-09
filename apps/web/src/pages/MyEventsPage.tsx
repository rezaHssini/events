import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, ChevronRight, MapPin } from 'lucide-react'
import { Badge } from '../components/UI'
import { ListRowSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { perks, menuOrders, type Event } from '../data/mockData'
import { useTickets, type PurchasedTicket } from '../context/TicketsContext'
import { useSavedEvents } from '../context/SavedEventsContext'
import { WebPageHeader } from '../components/layout/WebLayout'
import { AppImage } from '../components/ui/AppImage'
import { PostComposer } from '../components/feed/PostComposer'

const tabs = ['Upcoming', 'Past', 'Saved'] as const
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
      <AppImage src={event.cover} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
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
        <AppImage src={event.cover} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
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
    <div className="pb-10">
      <WebPageHeader
        title={event.title}
        subtitle={status === 'past' ? 'Past event' : `${event.date} · ${event.time}`}
        actions={
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← Back to list
          </button>
        }
      />

      <div className="web-container">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-5">
            <div className="relative overflow-hidden rounded-2xl">
              <AppImage src={event.cover} alt="" className="aspect-[21/9] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <div className="flex flex-wrap gap-2">
                  {status === 'upcoming' && <Badge variant="success">Valid ticket</Badge>}
                  {ticketTypeName.toLowerCase().includes('vip') && <Badge variant="primary">VIP</Badge>}
                  <Badge variant="default">{event.category}</Badge>
                  {holder.kind !== 'self' && (
                    <Badge variant="default">Assigned to {getHolderLabel(holder)}</Badge>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location} · {event.address}
                </p>
              </div>
            </div>

            {isMainTicket && (
              <>
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Included perks</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perks.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.total - p.used} left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold">Pre-orders</h3>
                  {menuOrders.map((o) => (
                    <div
                      key={o.id}
                      className={`mb-3 rounded-xl border p-4 text-left ${
                        o.status === 'ready'
                          ? 'border-success/40 bg-success/10'
                          : 'border-white/10 bg-white/[0.03]'
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
                </section>
              </>
            )}

            {status === 'past' && (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="w-full rounded-xl bg-primary/20 py-3 text-center text-sm font-medium text-primary-light"
              >
                Share a post
              </button>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-slate-300">
              <p className="font-medium text-white">About this event</p>
              <p className="mt-2 leading-relaxed">{event.description}</p>
              <p className="mt-3 text-slate-400">
                {event.format} · {event.ageRestriction} · Hosted by {event.creator.name}
              </p>
            </div>

            <Link
              to="/event"
              state={{ eventId: event.id }}
              className="block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              View full event page →
            </Link>
          </div>

          {status === 'upcoming' && (
            <aside className="mt-6 lg:mt-0">
              <div className="sticky top-20 overflow-hidden rounded-2xl gradient-hero shadow-2xl shadow-primary/25">
                <div className="p-5">
                  <p className="text-center text-sm font-medium opacity-80">
                    {holder.kind === 'self' ? 'Your entry QR' : `QR for ${getHolderLabel(holder)}`}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-2xl bg-white p-3">
                      <div className="flex h-40 w-40 items-center justify-center bg-[repeating-linear-gradient(45deg,#111_0,#111_2px,transparent_2px,transparent_6px)]">
                        <div className="h-28 w-28 rounded-lg border-4 border-black bg-white" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs opacity-70">
                    Ticket #{entry.id.slice(-6).toUpperCase()} · {ticketTypeName}
                  </p>
                  <p className="mt-1 text-center text-xs opacity-60">Show at the door</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        defaultMemory
        defaultEventId={event.id}
        defaultEventTitle={event.title}
      />
    </div>
  )
}

export default function MyEventsPage() {
  const { tickets } = useTickets()
  const { getSavedEvents, unsave } = useSavedEvents()
  const [tab, setTab] = useState<Tab>('Upcoming')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const savedEvents = getSavedEvents()
  const ticketList =
    tab === 'Upcoming'
      ? tickets.filter((e) => e.status === 'upcoming')
      : tab === 'Past'
        ? tickets.filter((e) => e.status === 'past')
        : []
  const selected = tickets.find((e) => e.id === selectedId)
  const listKey =
    tab === 'Saved' ? `saved-${savedEvents.length}` : `${tab}-${ticketList.length}`
  const { isLoading: listLoading } = useSimulatedQuery(true, [listKey], { delay: 500 })

  const tabCount = (t: Tab) => {
    if (t === 'Saved') return savedEvents.length
    return tickets.filter((e) => (t === 'Upcoming' ? e.status === 'upcoming' : e.status === 'past')).length
  }

  if (selected) {
    return <EventDetail entry={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="pb-10">
      <WebPageHeader
        title="My Events"
        subtitle="Your tickets, past events & saved"
      />
      <div className="web-container">
        <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 lg:max-w-xl">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
              <span className="ml-1 text-xs opacity-70">({tabCount(t)})</span>
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {listLoading ? (
              <ListRowSkeleton count={4} />
            ) : tab === 'Saved' ? (
              savedEvents.length > 0 ? (
                savedEvents.map((event) => (
                  <div key={event.id} className="lg:contents">
                  <SavedEventListItem
                    event={event}
                    onUnsave={() => unsave(event.id)}
                  />
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl glass p-8 text-center">
                  <p className="text-4xl">🔖</p>
                  <p className="mt-3 font-semibold">No saved events</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Bookmark events from your feed or event pages to find them here
                  </p>
                  <Link
                    to="/explorer"
                    className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
                  >
                    Explore events
                  </Link>
                </div>
              )
            ) : ticketList.length > 0 ? (
              ticketList.map((entry) => (
                <div key={entry.id} className="lg:contents">
                <EventListItem
                  entry={entry}
                  onSelect={() => setSelectedId(entry.id)}
                />
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl glass p-8 text-center">
                <p className="text-4xl">{tab === 'Upcoming' ? '🎫' : '📸'}</p>
                <p className="mt-3 font-semibold">No {tab.toLowerCase()} events</p>
                <p className="mt-1 text-sm text-slate-400">
                  {tab === 'Upcoming'
                    ? 'Events you buy tickets for will show up here'
                    : 'Past events you attended will appear here'}
                </p>
                {tab === 'Upcoming' && (
                  <Link
                    to="/explorer"
                    className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
                  >
                    Explore events
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
