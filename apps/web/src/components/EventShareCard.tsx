import { Link } from 'react-router-dom'
import type { SharedEventPayload } from '../data/socialData'

export function EventShareCard({
  event,
  compact,
}: {
  event: SharedEventPayload
  compact?: boolean
}) {
  return (
    <Link
      to="/event"
      className={`block overflow-hidden rounded-xl border border-white/10 bg-black/20 ${
        compact ? 'max-w-[240px]' : ''
      }`}
    >
      <img src={event.cover} alt="" className="h-24 w-full object-cover" />
      <div className="p-3 text-left">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary-light">
          🎫 Shared event
        </p>
        <p className="mt-1 text-sm font-semibold line-clamp-2">{event.title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{event.date}</p>
        <p className="text-xs text-slate-400">📍 {event.location}</p>
        <p className="mt-2 text-sm font-bold">
          {event.price === 'free' ? 'FREE' : `$${event.price}`}
        </p>
      </div>
    </Link>
  )
}
