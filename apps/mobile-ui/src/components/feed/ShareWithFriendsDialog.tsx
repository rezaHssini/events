import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { useSocial } from '../../context/SocialContext'
import { useToast } from '../../context/ToastContext'
import { userProfiles } from '../../data/socialData'

export function ShareWithFriendsDialog({
  open,
  onClose,
  eventId,
  eventTitle,
  eventCover,
}: {
  open: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  eventCover: string
}) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { followingIds } = useSocial()
  const [query, setQuery] = useState('')
  const [sentId, setSentId] = useState<string | null>(null)

  const friends = useMemo(
    () => userProfiles.filter((u) => followingIds.has(u.id) && !u.isCreator),
    [followingIds],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return friends
    return friends.filter(
      (u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
    )
  }, [friends, query])

  const shareWithFriend = (userId: string, name: string) => {
    navigate(`/messages?chat=user-${userId}`, {
      state: {
        pendingShare: {
          eventId,
          title: eventTitle,
          cover: eventCover,
        },
      },
    })
    setSentId(userId)
    toast(`✓ Shared with ${name}`)
    setTimeout(() => {
      onClose()
      setQuery('')
      setSentId(null)
    }, 400)
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setSentId(null)
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Share with friends">
      <div className="text-left">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @handle"
            className="w-full rounded-[14px] bg-white/10 py-3 pl-10 pr-4 text-[15px] outline-none placeholder:text-white/35 focus:ring-2 focus:ring-[#0a84ff]/40"
            autoFocus
          />
        </div>

        {friends.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Follow people to share events with them
            <Link to="/find-people" onClick={handleClose} className="mt-2 block text-[#0a84ff]">
              Find people →
            </Link>
          </p>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No friends match your search</p>
        ) : (
          <div className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto">
            {results.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => shareWithFriend(friend.id, friend.name)}
                className="flex w-full items-center gap-3 rounded-[14px] px-2 py-3 text-left transition-colors hover:bg-white/8"
              >
                <img src={friend.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{friend.name}</p>
                  <p className="truncate text-xs text-slate-400">@{friend.handle}</p>
                </div>
                {sentId === friend.id ? (
                  <span className="text-xs font-medium text-[#30d158]">Sent</span>
                ) : (
                  <span className="rounded-full bg-[#0a84ff] px-3 py-1 text-xs font-semibold text-white">
                    Send
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
