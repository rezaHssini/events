import { useNavigate } from 'react-router-dom'
import type { Event } from '../../data/mockData'
import { getEventMedia } from '../../data/mockData'
import { RecurrenceBadge } from '../ui/RecurrenceBadge'
import { formatEventSchedule } from '../../types/recurrence'

export function ExplorerEventCard({
  event,
  distance,
  trendingRank,
}: {
  event: Event
  distance?: string
  trendingRank?: number
}) {
  const navigate = useNavigate()
  const cover = getEventMedia(event)[0]?.src ?? event.cover

  const open = () => {
    navigate('/event', { state: { eventId: event.id, cover: event.cover } })
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <img
          src={cover}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-2.5 right-2.5 top-2.5 flex flex-wrap gap-1">
          {distance && (
            <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-[#30d158] backdrop-blur-sm">
              {distance}
            </span>
          )}
          {trendingRank != null && (
            <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-[#ffd60a] backdrop-blur-sm">
              #{trendingRank} trending
            </span>
          )}
          <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
            {event.category}
          </span>
          {event.price === 'free' ? (
            <span className="rounded-md bg-[#30d158]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              FREE
            </span>
          ) : (
            <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
              ${event.price}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 text-left">
        <div className="flex items-center gap-2">
          <img src={event.creator.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          <span className="truncate text-xs text-[rgba(235,235,245,0.55)]">
            {event.creator.name}
            {event.creator.verified ? ' ✓' : ''}
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-[#64b5ff]">
          {event.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-[rgba(235,235,245,0.45)]">
          {formatEventSchedule({
            date: event.date,
            time: event.time,
            recurrence: event.recurrence,
            seriesStart: event.seriesStart,
          })}{' '}
          · {event.location}
        </p>
        <div className="mt-2">
          <RecurrenceBadge recurrence={event.recurrence} time={event.time} compact />
        </div>
      </div>
    </article>
  )
}
