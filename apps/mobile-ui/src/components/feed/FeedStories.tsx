import { useMemo, useState, type RefObject } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { currentUser, userProfiles } from '../../data/socialData'
import { useSocial } from '../../context/SocialContext'
import { useStories } from '../../context/StoriesContext'
import type { UserStory } from '../../data/storiesData'
import { StoryViewer } from './StoryViewer'
import { StoryComposer } from '../ui/StoryComposer'

export type FeedStoryStripState = {
  availableStories: UserStory[]
  myStory: UserStory | undefined
  seenIds: Set<string>
  openStory: (userId: string) => void
  setComposerOpen: (open: boolean) => void
}

export function useFeedStoryStrip(): FeedStoryStripState & {
  viewerIndex: number | null
  setViewerIndex: (index: number | null) => void
  composerOpen: boolean
} {
  const { followingIds } = useSocial()
  const { stories } = useStories()
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  const availableStories = useMemo(
    () =>
      stories.filter((s) => {
        if (s.slides.length === 0) return false
        if (s.userId === 'me' || s.userId === '4') return true
        const profile = userProfiles.find((u) => u.id === s.userId)
        if (!profile) return true
        if (profile.isCreator) return followingIds.has(s.userId)
        return followingIds.has(s.userId)
      }),
    [stories, followingIds],
  )

  const myStory = availableStories.find((s) => s.userId === 'me')

  const openStory = (userId: string) => {
    const idx = availableStories.findIndex((s) => s.userId === userId)
    if (idx >= 0) {
      setViewerIndex(idx)
      setSeenIds((prev) => new Set([...prev, userId]))
    }
  }

  return {
    availableStories,
    myStory,
    seenIds,
    openStory,
    setComposerOpen,
    viewerIndex,
    setViewerIndex,
    composerOpen,
  }
}

function StoryAvatar({
  src,
  name,
  hasStory,
  seen,
  compact,
  onClick,
}: {
  src: string
  name: string
  hasStory: boolean
  seen?: boolean
  compact?: boolean
  onClick: () => void
}) {
  const size = compact ? 'h-10 w-10' : 'h-16 w-16'

  return (
    <button type="button" onClick={onClick} className="flex shrink-0 flex-col items-center gap-1">
      <div className={`relative ${size}`}>
        <div
          className={`absolute inset-0 rounded-full p-[2px] ${
            hasStory
              ? seen
                ? 'bg-white/25'
                : 'bg-gradient-to-br from-primary via-secondary to-pink-500'
              : 'bg-white/15'
          }`}
        >
          <div className="h-full w-full rounded-full bg-[#0a0a0f] p-[2px]">
            <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
          </div>
        </div>
      </div>
      {!compact && (
        <span className="max-w-[68px] truncate text-[10px] font-medium text-slate-400">{name}</span>
      )}
    </button>
  )
}

export function StoryStripBar({
  strip,
  compact = false,
  className = '',
}: {
  strip: FeedStoryStripState
  compact?: boolean
  className?: string
}) {
  const { availableStories, myStory, seenIds, openStory, setComposerOpen } = strip
  const avatarSize = compact ? 'h-10 w-10' : 'h-16 w-16'
  const addBtnClass = compact
    ? 'absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#0a84ff] ring-2 ring-[#0a0a0f]'
    : 'absolute bottom-5 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a84ff] ring-2 ring-[#0a0a0f]'

  return (
    <div className={`flex gap-3 overflow-x-auto scrollbar-hide ${className}`}>
      <div className="relative flex shrink-0 flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => (myStory ? openStory('me') : setComposerOpen(true))}
          className={`relative ${avatarSize}`}
        >
          <img
            src={currentUser.avatar}
            alt=""
            className={`h-full w-full rounded-full object-cover ${
              myStory ? 'ring-2 ring-[#0a84ff]' : 'ring-2 ring-white/20'
            }`}
          />
        </button>
        <button
          type="button"
          aria-label="Add story"
          onClick={() => setComposerOpen(true)}
          className={addBtnClass}
        >
          <Plus className={compact ? 'h-2.5 w-2.5 text-white' : 'h-3 w-3 text-white'} />
        </button>
        {!compact && (
          <span className="max-w-[68px] truncate text-[10px] font-medium text-slate-300">
            Your story
          </span>
        )}
      </div>

      {availableStories
        .filter((s) => s.userId !== 'me')
        .map((story) => (
          <StoryAvatar
            key={story.userId}
            src={story.avatar}
            name={story.name}
            hasStory={story.slides.length > 0}
            seen={seenIds.has(story.userId)}
            compact={compact}
            onClick={() => openStory(story.userId)}
          />
        ))}
    </div>
  )
}

export function FeedStoryStripModals({
  strip,
  viewerIndex,
  setViewerIndex,
  composerOpen,
}: {
  strip: FeedStoryStripState
  viewerIndex: number | null
  setViewerIndex: (index: number | null) => void
  composerOpen: boolean
}) {
  const { availableStories, setComposerOpen } = strip

  return (
    <>
      <StoryComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <AnimatePresence>
        {viewerIndex !== null && (
          <StoryViewer
            stories={availableStories}
            startIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function FeedStoryStrip({
  strip,
  sectionRef,
}: {
  strip: FeedStoryStripState
  sectionRef?: RefObject<HTMLElement | null>
}) {
  return (
    <section
      ref={sectionRef}
      className="feed-stories -mx-4 mb-5 border-b border-white/5 px-4 pb-4"
    >
      <StoryStripBar strip={strip} className="py-1" />
    </section>
  )
}

export { FeedActivityCard } from './FeedStoriesActivity'
