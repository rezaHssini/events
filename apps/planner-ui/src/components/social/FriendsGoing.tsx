import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { getFriendsGoingForEvent } from '../../data/socialData'

export function FriendsGoingPill({
  eventId,
  count,
  variant = 'overlay',
  className = '',
}: {
  eventId: string
  count: number
  variant?: 'overlay' | 'inline'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const friends = getFriendsGoingForEvent(eventId)
  const preview = friends.slice(0, 3)
  const moreCount = Math.max(0, count - 3)
  const others = Math.max(0, count - friends.length)

  const stopNav = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const label =
    variant === 'inline'
      ? `${count} friend${count === 1 ? '' : 's'} are going`
      : `${count} friends going`

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          stopNav(e)
          setOpen(true)
        }}
        className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors hover:brightness-110 ${
          variant === 'overlay'
            ? 'bg-black/60 px-2 py-1 text-white backdrop-blur'
            : 'text-slate-400 hover:text-slate-200'
        } ${className}`}
        aria-label={`${count} friends going — tap to see who`}
      >
        {(preview.length > 0 || moreCount > 0) && (
          <span className="flex -space-x-1.5">
            {preview.map((friend) => (
              <img
                key={friend.id}
                src={friend.avatar}
                alt=""
                className={`rounded-full border-2 border-black object-cover ${
                  variant === 'overlay' ? 'h-5 w-5' : 'h-7 w-7'
                }`}
              />
            ))}
            {moreCount > 0 && (
              <span
                className={`flex items-center justify-center rounded-full border-2 border-black bg-white/20 font-semibold text-white ${
                  variant === 'overlay' ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 text-[10px]'
                }`}
              >
                +{moreCount}
              </span>
            )}
          </span>
        )}
        <span className={variant === 'inline' ? 'text-sm' : ''}>{label}</span>
        {variant === 'inline' && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={`${count} friends going`}>
        <div className="space-y-1 text-left">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              to={`/user/${friend.handle}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[14px] px-2 py-3 transition-colors hover:bg-white/5"
            >
              <img src={friend.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{friend.name}</p>
                <p className="text-xs text-slate-400">@{friend.handle}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </Link>
          ))}
          {others > 0 && (
            <p className="px-2 py-2 text-center text-xs text-slate-500">
              and {others} other{others === 1 ? '' : 's'} you may know
            </p>
          )}
          {friends.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">
              Friends on this list appear when they RSVP.
            </p>
          )}
        </div>
      </BottomSheet>
    </>
  )
}
