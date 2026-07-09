import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSocial } from '../context/SocialContext'
import { useLoginGate } from '../context/LoginGateContext'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { simulateDelay } from '../hooks/useSimulatedQuery'
import { useStories } from '../context/StoriesContext'
import { useToast } from '../context/ToastContext'
import { userProfiles } from '../data/socialData'
import type { SharedEventPayload } from '../data/socialData'
import { copyToClipboard, eventShareUrl } from '../utils/clipboard'

interface ShareEventModalProps {
  event: SharedEventPayload
  onClose: () => void
  onShareToChat: (userId: string, userName: string) => void
}

export function ShareEventModal({ event, onClose, onShareToChat }: ShareEventModalProps) {
  const { followingIds } = useSocial()
  const { addStory } = useStories()
  const { toast } = useToast()
  const [sent, setSent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const friends = userProfiles.filter(
    (u) => followingIds.has(u.id) && !u.isCreator,
  )

  const shareUrl = eventShareUrl(event.eventId)

  const copyLink = async () => {
    const ok = await copyToClipboard(shareUrl)
    setCopied(true)
    toast(ok ? '↗ Link copied to clipboard' : 'Could not copy link')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToStory = () => {
    addStory(`Check out ${event.title}!`, event.cover)
    toast('✓ Shared to your story')
    onClose()
  }

  const shareMore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.title, url: shareUrl })
        onClose()
        return
      } catch {
        /* user cancelled */
      }
    }
    await copyLink()
  }

  const share = (userId: string, name: string) => {
    onShareToChat(userId, name)
    setSent(userId)
    setTimeout(() => {
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-lg rounded-t-3xl bg-surface p-5"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <h3 className="text-lg font-bold">Share event</h3>
        <p className="text-sm text-slate-400">Send to friends or copy link</p>

        <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[
            { icon: '🔗', label: copied ? 'Copied!' : 'Copy link', action: copyLink },
            { icon: '📱', label: 'Stories', action: shareToStory },
            { icon: '↗', label: 'More', action: shareMore },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={opt.action}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full glass text-xl">
                {opt.icon}
              </span>
              <span className="text-[10px] text-slate-400">{opt.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">Send to friends</p>
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Follow people to share events with them
              <Link to="/find-people" className="mt-2 block text-primary-light">
                Find people →
              </Link>
            </p>
          ) : (
            friends.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => share(user.id, user.name)}
                className="flex w-full items-center gap-3 rounded-xl glass p-3 text-left hover:bg-white/10"
              >
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">@{user.handle}</p>
                </div>
                {sent === user.id ? (
                  <span className="text-sm text-success">Sent ✓</span>
                ) : (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium">Send</span>
                )}
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl glass py-3 font-medium"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  )
}

export function FollowButton({
  userId,
  size = 'md',
  className = '',
}: {
  userId: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const { isFollowing, isRequestPending, isPrivateAccount, toggleFollow } = useSocial()
  const { requireLogin } = useLoginGate()
  const [busy, setBusy] = useState(false)
  const following = isFollowing(userId)
  const pending = isRequestPending(userId)
  const isPrivate = isPrivateAccount(userId)

  const sizes = {
    sm: 'px-4 py-1.5 text-xs min-w-[88px]',
    md: 'px-5 py-2 text-sm min-w-[100px]',
  }

  let label = 'Follow'
  if (following) label = 'Following'
  else if (pending) label = 'Requested'
  else if (isPrivate) label = 'Request'

  const handleClick = async () => {
    if (busy) return
    if (following) {
      toggleFollow(userId)
      return
    }
    requireLogin(async () => {
      setBusy(true)
      await simulateDelay(380)
      toggleFollow(userId)
      setBusy(false)
    })
  }

  const showSpinner = busy || (pending && !following)

  return (
    <motion.button
      whileTap={{ scale: busy ? 1 : 0.95 }}
      type="button"
      disabled={busy}
      onClick={() => void handleClick()}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all ${sizes[size]} ${
        following
          ? 'bg-white/10 text-[rgba(235,235,245,0.8)]'
          : pending
            ? 'bg-white/10 text-[rgba(235,235,245,0.45)]'
            : 'bg-[#0a84ff] text-white'
      } ${className}`}
    >
      {showSpinner ? <LoadingSpinner size="sm" className="text-current" /> : null}
      {label}
    </motion.button>
  )
}

export function UserRow({
  user,
  showMutual,
  action,
}: {
  user: (typeof userProfiles)[0]
  showMutual?: boolean
  action?: 'follow' | 'message' | 'none'
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Link to={`/user/${user.handle}`}>
        <img src={user.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
      </Link>
      <Link to={`/user/${user.handle}`} className="min-w-0 flex-1 text-left">
        <p className="font-medium truncate">{user.name}</p>
        <p className="text-sm text-slate-400 truncate">@{user.handle}</p>
        {showMutual && user.mutualFriends > 0 && (
          <p className="text-xs text-primary-light">{user.mutualFriends} mutual friends</p>
        )}
      </Link>
      {action === 'follow' && <FollowButton userId={user.id} size="sm" />}
      {action === 'message' && (
        <Link
          to={`/messages?chat=user-${user.id}`}
          className="rounded-full glass px-4 py-1.5 text-xs font-medium"
        >
          Message
        </Link>
      )}
    </div>
  )
}
