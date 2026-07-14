/* @refresh reset */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  BadgeCheck,
  MoreHorizontal,
  Flag,
  EyeOff,
} from 'lucide-react'
import type { Event, Memory, Creator } from '../../data/mockData'
import type { UserPost } from '../../types/posts'
import { getEventMedia, events } from '../../data/mockData'
import { FeedImage } from './FeedImage'
import { EventMediaCarousel } from '../event/EventMediaCarousel'
import { Badge } from '../UI'
import { RecurrenceBadge } from '../ui/RecurrenceBadge'
import { formatEventSchedule } from '../../types/recurrence'
import { DropdownItem, DropdownPanel, useDropdown } from '../ui/DropdownMenu'
import { FeedShareMenu } from './FeedShareMenu'
import { FriendsGoingPill } from '../social/FriendsGoing'
import { useActionFeedback } from '../../hooks/useActionFeedback'
import { useSavedEvents } from '../../context/SavedEventsContext'

export function FeedEventPost({ event }: { event: Event }) {
  const navigate = useNavigate()
  const { liked, saved, unsaved, opened } = useActionFeedback()
  const { isSaved, save, toggleSave } = useSavedEvents()
  const [isLiked, setIsLiked] = useState(false)
  const optionsMenu = useDropdown()
  const shareMenu = useDropdown()

  const openComments = () => {
    navigate('/event', { state: { tab: 'Comments', eventId: event.id, cover: event.cover } })
  }

  const openOptions = () => {
    shareMenu.close()
    optionsMenu.toggle()
  }

  const openShare = () => {
    optionsMenu.close()
    shareMenu.toggle()
  }

  const openEvent = () => {
    const state = { eventId: event.id, cover: event.cover }
    const go = () => navigate('/event', { state })
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(go)
    } else {
      go()
    }
  }

  const mediaItems = getEventMedia(event)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="feed-card mb-5 !overflow-visible"
    >
      <div
        className={`relative flex items-center gap-3 px-4 py-3 ${
          optionsMenu.open ? 'z-50' : 'z-30'
        }`}
      >
        <Link to={`/page/${event.creator.handle}`} className="shrink-0">
          <img
            src={event.creator.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
          />
        </Link>
        <div className="min-w-0 flex-1 text-left">
          <Link
            to={`/page/${event.creator.handle}`}
            className="flex items-center gap-1 font-semibold text-sm hover:text-primary-light"
          >
            {event.creator.name}
            {event.creator.verified && <BadgeCheck className="h-3.5 w-3.5 text-secondary" />}
          </Link>
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="h-3 w-3" />
            {event.location}
          </p>
        </div>
        <div className="relative shrink-0" ref={optionsMenu.containerRef}>
          <button
            type="button"
            onClick={openOptions}
            aria-expanded={optionsMenu.open}
            aria-haspopup="menu"
            className="rounded-full p-2 text-slate-500 hover:bg-white/5"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <DropdownPanel open={optionsMenu.open} align="end">
            <DropdownItem
              icon={<Bookmark className="h-4 w-4" />}
              onClick={() => {
                if (!isSaved(event.id)) save(event.id)
                saved()
                optionsMenu.close()
              }}
            >
              Save post
            </DropdownItem>
            <DropdownItem
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => {
                optionsMenu.close()
                shareMenu.setOpen(true)
              }}
            >
              Share
            </DropdownItem>
            <DropdownItem
              icon={<Flag className="h-4 w-4" />}
              onClick={() => {
                opened('Report submitted')
                optionsMenu.close()
              }}
            >
              Report
            </DropdownItem>
            <DropdownItem
              icon={<EyeOff className="h-4 w-4" />}
              onClick={() => {
                opened('We will show fewer posts like this')
                optionsMenu.close()
              }}
            >
              Not interested
            </DropdownItem>
          </DropdownPanel>
        </div>
      </div>

      <div
        role="link"
        tabIndex={0}
        onClick={openEvent}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openEvent()
          }
        }}
        className="relative z-0 block w-full cursor-pointer overflow-hidden"
      >
        {mediaItems.length > 1 ? (
          <EventMediaCarousel
            items={mediaItems}
            alt={event.title}
            aspectClassName="aspect-[4/5]"
            dotsClassName="bottom-20"
          />
        ) : (
          <FeedImage src={event.cover} alt={event.title} aspect="portrait" rounded="none" />
        )}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 z-[2] flex flex-wrap gap-1.5">
          <span className="liquid-glass-subtle rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {event.category}
          </span>
          <RecurrenceBadge recurrence={event.recurrence} time={event.time} compact />
          {event.price === 'free' ? (
            <span className="rounded-full bg-[#30d158]/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
              FREE
            </span>
          ) : (
            <span className="liquid-glass-subtle rounded-full px-2.5 py-1 text-[11px] font-semibold">
              ${event.price}
            </span>
          )}
        </div>
        {event.friendsGoing > 0 && (
          <div className="pointer-events-auto absolute right-3 top-3 z-[2]">
            <FriendsGoingPill eventId={event.id} count={event.friendsGoing} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 z-[2] p-4 text-left">
          <h3 className="ios-headline text-white drop-shadow-md">{event.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 ios-caption !text-white/70">
            <Calendar className="h-3 w-3" />
            {formatEventSchedule({
              date: event.date,
              time: event.time,
              recurrence: event.recurrence,
              seriesStart: event.seriesStart,
            })}
          </p>
        </div>
      </div>

      <div className="relative z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Like post"
            onClick={() => {
              setIsLiked(!isLiked)
              liked()
            }}
            className={`group flex items-center gap-1.5 ${isLiked ? 'text-[#ff453a]' : 'text-[rgba(235,235,245,0.5)]'}`}
          >
            <Heart className={`h-[22px] w-[22px] ${isLiked ? 'fill-current' : ''}`} />
            <span className="ios-caption">{(event.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={openComments}
            className="group flex items-center gap-1.5 text-[rgba(235,235,245,0.5)]"
          >
            <MessageCircle className="h-[22px] w-[22px] group-active:text-[#0a84ff]" />
            <span className="ios-caption">{event.comments}</span>
          </button>
          <div className="relative" ref={shareMenu.containerRef}>
            <FeedShareMenu
              eventId={event.id}
              eventTitle={event.title}
              eventCover={event.cover}
              open={shareMenu.open}
              onToggle={openShare}
              onClose={shareMenu.close}
              align="start"
              trigger={<Share2 className="h-[22px] w-[22px]" />}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const added = toggleSave(event.id)
            if (added) saved()
            else unsaved()
          }}
          className={isSaved(event.id) ? 'text-[#ffd60a]' : 'text-[rgba(235,235,245,0.5)]'}
        >
          <Bookmark className={`h-[22px] w-[22px] ${isSaved(event.id) ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="ios-separator mx-4" />

      <div className="px-4 py-4 text-left">
        <p className="ios-caption">
          <span className="font-semibold text-[rgba(235,235,245,0.8)]">{event.sold}</span> going ·{' '}
          <span className="font-semibold text-[rgba(235,235,245,0.8)]">{event.capacity - event.sold}</span> spots left
        </p>
        <Link to="/checkout" state={{ eventId: event.id }} className="ios-button mt-3 block py-3 text-center text-[15px]">
          Get Tickets
        </Link>
      </div>
    </motion.article>
  )
}

export function FeedMemoryPost({ memory }: { memory: Memory }) {
  const navigate = useNavigate()
  const { liked, shareLink } = useActionFeedback()
  const hasMedia = memory.media.length > 0

  const openComments = () => navigate('/event', { state: { tab: 'Comments' } })

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="feed-card mb-5"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={memory.user.avatar}
          alt=""
          className="h-10 w-10 rounded-full object-cover ring-2 ring-warning/30"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-sm">{memory.user.name}</p>
          <p className="text-[11px] text-slate-500">posted a memory · {memory.date}</p>
        </div>
        {memory.verified && <Badge variant="success">Verified</Badge>}
      </div>

      {hasMedia && (
        <div className={memory.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}>
          {memory.media.slice(0, 2).map((src, i) => (
            <FeedImage
              key={i}
              src={src}
              alt=""
              aspect={memory.media.length > 1 ? 'square' : 'portrait'}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-3 text-left">
        <Link
          to="/event"
          className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-primary-light"
        >
          🎫 {memory.eventTitle}
        </Link>
        <p className="mt-2 text-sm text-warning">{'★'.repeat(memory.rating)}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{memory.body}</p>
      </div>

      <div className="flex items-center gap-5 border-t border-white/5 px-4 py-3">
        <button type="button" onClick={liked} className="flex items-center gap-1.5 text-slate-400 hover:text-pink-400">
          <Heart className="h-5 w-5" />
          <span className="text-xs">{memory.likes}</span>
        </button>
        <button type="button" onClick={openComments} className="text-slate-400 hover:text-secondary">
          <MessageCircle className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => shareLink()} className="text-slate-400 hover:text-white">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </motion.article>
  )
}

export function FeedAnnouncementPost({
  creator,
  text,
}: {
  creator: Creator
  text: string
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="feed-card mb-5 overflow-hidden"
    >
      <div className="relative h-20 bg-gradient-to-r from-primary/30 via-secondary/20 to-pink-500/20">
        <img
          src={creator.banner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
      </div>
      <div className="relative -mt-8 px-4 pb-4">
        <div className="flex items-end gap-3">
          <img
            src={creator.avatar}
            alt=""
            className="h-14 w-14 rounded-2xl border-4 border-[#14141f] object-cover shadow-lg"
          />
          <div className="mb-1 flex-1 text-left">
            <Link
              to={`/page/${creator.handle}`}
              className="flex items-center gap-1 font-semibold text-sm hover:text-primary-light"
            >
              {creator.name}
              {creator.verified && <BadgeCheck className="h-3.5 w-3.5 text-secondary" />}
            </Link>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Planner update</p>
          </div>
        </div>
        <p className="mt-4 text-left text-[15px] leading-relaxed">{text}</p>
        <div className="mt-4 flex gap-2">
          <Link
            to="/event"
            className="flex-1 rounded-xl bg-primary/20 py-2.5 text-center text-sm font-semibold text-primary-light"
          >
            View event
          </Link>
          <Link
            to={`/page/${creator.handle}`}
            className="flex-1 rounded-xl glass py-2.5 text-center text-sm font-semibold"
          >
            Follow page
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function postKindLabel(kind: UserPost['kind']) {
  switch (kind) {
    case 'memory':
      return 'posted a memory'
    case 'event':
      return 'shared an event'
    default:
      return 'posted'
  }
}

function authorProfilePath(author: UserPost['author']) {
  return author.isPlannerPage ? `/page/${author.handle}` : `/user/${author.handle}`
}

export function FeedUserPost({ post }: { post: UserPost }) {
  const linkedEvent = post.linkedEventId ? events.find((e) => e.id === post.linkedEventId) : undefined
  const timeLabel = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="feed-card mb-5 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={authorProfilePath(post.author)} className="shrink-0">
          <img
            src={post.author.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
          />
        </Link>
        <div className="min-w-0 flex-1 text-left">
          <Link to={authorProfilePath(post.author)} className="font-semibold text-sm hover:text-primary-light">
            {post.author.name}
          </Link>
          <p className="text-[11px] text-slate-500">
            {postKindLabel(post.kind)} · {timeLabel}
          </p>
        </div>
        {post.kind === 'memory' && <Badge variant="success">Memory</Badge>}
        {post.kind !== 'memory' && linkedEvent && <Badge variant="primary">Event</Badge>}
      </div>

      {post.media.length > 0 && (
        <div className={post.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}>
          {post.media.slice(0, 2).map((src, i) => (
            <FeedImage
              key={`${src}-${i}`}
              src={src}
              aspect={post.media.length > 1 ? 'square' : 'wide'}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-3 text-left">
        {post.kind === 'memory' && post.eventTitle && (
          <p className="text-xs font-medium text-primary-light">🎫 {post.eventTitle}</p>
        )}
        {post.kind === 'memory' && post.rating != null && post.rating > 0 && (
          <p className="mt-1 text-sm text-warning">{'★'.repeat(post.rating)}</p>
        )}
        {post.text && <p className="mt-2 text-sm leading-relaxed text-slate-200">{post.text}</p>}

        {linkedEvent && (
          <Link
            to="/event"
            state={{ eventId: linkedEvent.id }}
            className="mt-3 flex gap-3 rounded-[16px] liquid-glass-subtle p-3"
          >
            <img src={linkedEvent.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold line-clamp-2">{linkedEvent.title}</p>
              <p className="text-xs text-slate-400">{linkedEvent.date} · {linkedEvent.location}</p>
            </div>
          </Link>
        )}
      </div>
    </motion.article>
  )
}
