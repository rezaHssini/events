import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, LogIn } from 'lucide-react'
import { ResponsiveDialog } from '../ui/ResponsiveDialog'
import { getFriendsGoingForEvent } from '../../data/socialData'
import { useAuth } from '../../context/AuthContext'

function peopleLabel(count: number, variant: 'overlay' | 'inline') {
  if (variant === 'inline') {
    return count === 1 ? '1 person is going' : `${count} people are going`
  }
  return count === 1 ? '1 person going' : `${count} people going`
}

function friendsLabel(count: number, variant: 'overlay' | 'inline') {
  if (variant === 'inline') {
    return count === 1 ? '1 friend is going' : `${count} friends are going`
  }
  return count === 1 ? '1 friend going' : `${count} friends going`
}

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
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const friends = getFriendsGoingForEvent(eventId)
  const preview = friends.slice(0, 3)
  const moreCount = Math.max(0, count - 3)
  const others = Math.max(0, count - friends.length)

  const stopNav = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const label = isAuthenticated ? friendsLabel(count, variant) : peopleLabel(count, variant)
  const dialogTitle = isAuthenticated ? friendsLabel(count, variant) : peopleLabel(count, variant)

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
        aria-label={
          isAuthenticated
            ? `${count} friends going — tap to see who`
            : `${count} people going`
        }
      >
        {isAuthenticated && (preview.length > 0 || moreCount > 0) && (
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

      <ResponsiveDialog open={open} onClose={() => setOpen(false)} title={dialogTitle}>
        {isAuthenticated ? (
          <div className="space-y-1 text-left">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                to={`/user/${friend.handle}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/5"
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
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-300">
              {count === 1
                ? '1 person is interested in this event.'
                : `${count} people are interested in this event.`}
            </p>
            <p className="text-xs text-slate-500">
              Sign in to see which of your friends are going.
            </p>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a84ff] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0070e0]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </div>
        )}
      </ResponsiveDialog>
    </>
  )
}
