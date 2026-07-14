import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MapPin, Tag } from 'lucide-react'
import { Badge } from '../../components/UI'
import { RecurrenceBadge } from '../../components/ui/RecurrenceBadge'
import { formatRecurrence, isRecurring } from '../../types/recurrence'
import { usePlanner } from '../../context/PlannerContext'
import type { PlannerEventStatus } from '../../data/plannerData'

const tabs = ['Upcoming', 'Past', 'Drafts'] as const

const statusBadge: Record<PlannerEventStatus, { label: string; variant: 'success' | 'primary' | 'warning' | 'default' }> = {
  live: { label: '🔴 Live', variant: 'success' },
  upcoming: { label: 'Upcoming', variant: 'primary' },
  past: { label: 'Past', variant: 'default' },
  draft: { label: 'Draft', variant: 'warning' },
  scheduled: { label: 'Scheduled', variant: 'warning' },
}

function filterByTab(status: PlannerEventStatus, tab: (typeof tabs)[number]) {
  if (tab === 'Upcoming') return ['live', 'upcoming', 'scheduled'].includes(status)
  if (tab === 'Past') return status === 'past'
  return status === 'draft'
}

export default function ClubEventsPage() {
  const { managedEvents } = usePlanner()
  const [tab, setTab] = useState<(typeof tabs)[number]>('Upcoming')

  const filtered = managedEvents.filter((e) => filterByTab(e.status, tab))

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-4 backdrop-blur-xl text-left">
        <h1 className="text-lg font-bold">My events</h1>
        <p className="text-xs text-slate-400">Manage all events across categories & venues</p>
      </header>

      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex gap-1 rounded-xl glass p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                tab === t ? 'bg-primary text-white' : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <Link
          to="/create-event"
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary-light"
        >
          + Create new event
        </Link>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filtered.length > 0 ? (
              filtered.map((event) => {
                const badge = statusBadge[event.status]
                return (
                  <Link
                    key={event.id}
                    to={`/club/events/${event.id}`}
                    className="mb-3 flex gap-3 rounded-2xl glass p-3 card-hover"
                  >
                    <img src={event.cover} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-tight line-clamp-2">{event.title}</p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {event.date} · {event.time}
                        {isRecurring(event.recurrence) && (
                          <span className="text-[#bf5af2]"> · {formatRecurrence(event.recurrence!, event.time)}</span>
                        )}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <Tag className="h-3 w-3" />
                          {event.category}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {event.location}, {event.city}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <RecurrenceBadge recurrence={event.recurrence} time={event.time} compact />
                        {event.status !== 'draft' && event.status !== 'scheduled' && (
                          <Badge variant="default">
                            {event.sold}/{event.capacity} sold
                          </Badge>
                        )}
                        {event.menuItemCount > 0 && (
                          <Badge variant="default">{event.menuType} menu</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="rounded-2xl glass p-8 text-center">
                <p className="text-4xl">📅</p>
                <p className="mt-3 font-semibold">No {tab.toLowerCase()} events</p>
                <Link to="/create-event" className="mt-4 inline-block text-sm text-primary-light">
                  Create your first event →
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
