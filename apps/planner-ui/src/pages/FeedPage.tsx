import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessageCircle, Plus, Search } from 'lucide-react'
import { mainTabLinkState } from '../components/layout/MainBackButton'
import { SuggestPeopleCarousel, SuggestCreatorsCarousel } from '../components/feed/FeedCarousels'
import { FeedStoryStrip, FeedActivityCard, useFeedStoryStrip, StoryStripBar, FeedStoryStripModals } from '../components/feed/FeedStories'
import {
  FeedEventPost,
  FeedMemoryPost,
  FeedAnnouncementPost,
  FeedUserPost,
} from '../components/feed/FeedPosts'
import { PostComposer } from '../components/feed/PostComposer'
import { socialActivities, currentUser } from '../data/socialData'
import { feedPostsFollowing } from '../data/mockData'
import { useSocial } from '../context/SocialContext'
import { useTickets } from '../context/TicketsContext'
import { usePosts } from '../context/PostsContext'

type FeedPost = (typeof feedPostsFollowing)[0]

type FeedItem =
  | { kind: 'carousel-people' }
  | { kind: 'carousel-creators' }
  | { kind: 'activity'; data: (typeof socialActivities)[0] }
  | { kind: 'my-going'; data: ReturnType<typeof useTickets>['goingActivities'][0] }
  | { kind: 'post'; data: FeedPost }
  | { kind: 'user-post'; data: ReturnType<typeof usePosts>['posts'][0] }

function buildFeed(
  myGoing: ReturnType<typeof useTickets>['goingActivities'],
  userPosts: ReturnType<typeof usePosts>['posts'],
): FeedItem[] {
  const items: FeedItem[] = []
  let postIdx = 0
  const posts = feedPostsFollowing

  userPosts.forEach((post) => items.push({ kind: 'user-post', data: post }))
  myGoing.forEach((activity) => items.push({ kind: 'my-going', data: activity }))
  socialActivities.slice(0, 6).forEach((a) => items.push({ kind: 'activity', data: a }))

  posts.forEach((post, i) => {
    items.push({ kind: 'post', data: post })
    postIdx++
    if (postIdx === 1) items.push({ kind: 'carousel-people' })
    if (postIdx === 2) items.push({ kind: 'carousel-creators' })
    if (i === posts.length - 1 && postIdx < 2) {
      items.push({ kind: 'carousel-people' })
      items.push({ kind: 'carousel-creators' })
    }
  })

  return items
}

function ActivityRow({ activity }: { activity: (typeof socialActivities)[0] }) {
  const { isFollowing } = useSocial()
  if (!isFollowing(activity.user.id) && activity.type !== 'follow') return null
  return <FeedActivityCard activity={activity} />
}

function GlassIconButton({
  children,
  to,
  state,
  onClick,
  badge,
}: {
  children: React.ReactNode
  to?: string
  state?: object
  onClick?: () => void
  badge?: React.ReactNode
}) {
  const cls =
    'relative flex h-9 w-9 items-center justify-center rounded-full liquid-glass-subtle text-[rgba(235,235,245,0.75)] transition-transform active:scale-95'
  const inner = (
    <>
      {children}
      {badge}
    </>
  )
  if (to) {
    return (
      <Link to={to} state={state} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

export default function FeedPage() {
  const { goingActivities } = useTickets()
  const { posts: userPosts } = usePosts()
  const [composerOpen, setComposerOpen] = useState(false)
  const [showStickyStories, setShowStickyStories] = useState(false)
  const storiesSectionRef = useRef<HTMLElement>(null)
  const storyStrip = useFeedStoryStrip()
  const feedBuilt = buildFeed(goingActivities, userPosts)
  const feed = feedBuilt

  useEffect(() => {
    const section = storiesSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyStories(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Floating glass header */}
      <header className="sticky top-0 z-50 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-2">
        <div className="floating-top-bar overflow-hidden rounded-[22px]">
          <div className="flex items-center justify-between px-4 py-2.5">
            <h1 className="ios-large-title !text-[28px] !leading-8">Feed</h1>
            <div className="flex items-center gap-2">
              <GlassIconButton onClick={() => setComposerOpen(true)}>
                <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </GlassIconButton>
              <GlassIconButton to="/explorer">
                <Search className="h-[18px] w-[18px]" strokeWidth={2} />
              </GlassIconButton>
              <GlassIconButton to="/notifications" state={mainTabLinkState('/feed')}>
                <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff453a] ring-2 ring-black/30" />
              </GlassIconButton>
              <GlassIconButton
                to="/messages"
                state={mainTabLinkState('/feed')}
                badge={
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0a84ff] text-[9px] font-bold text-white ring-2 ring-black/40">
                    1
                  </span>
                }
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} />
              </GlassIconButton>
              <Link to="/profile" className="ml-0.5">
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
                />
              </Link>
            </div>
          </div>
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ${
              showStickyStories
                ? 'grid-rows-[1fr] opacity-100'
                : 'pointer-events-none grid-rows-[0fr] opacity-0'
            }`}
            aria-hidden={!showStickyStories}
          >
            <div className="overflow-hidden">
              <div className="border-t border-white/10 px-3 py-2">
                <StoryStripBar strip={storyStrip} compact />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 pt-2">
        <FeedStoryStrip strip={storyStrip} sectionRef={storiesSectionRef} />

        {feed.map((item, i) => {
          if (item.kind === 'user-post') return <FeedUserPost key={item.data.id} post={item.data} />
          if (item.kind === 'carousel-people') return <SuggestPeopleCarousel key={`p-${i}`} />
          if (item.kind === 'carousel-creators') return <SuggestCreatorsCarousel key={`c-${i}`} />
          if (item.kind === 'activity') return <ActivityRow key={item.data.id} activity={item.data} />
          if (item.kind === 'my-going') {
            return (
              <FeedActivityCard
                key={item.data.id}
                activity={{
                  id: item.data.id,
                  type: 'going',
                  user: {
                    name: currentUser.name,
                    handle: currentUser.handle,
                    avatar: currentUser.avatar,
                  },
                  event: {
                    title: item.data.event.title,
                    cover: item.data.event.cover,
                    date: item.data.event.date,
                    price: item.data.event.price,
                  },
                  time: item.data.postedAt,
                  text: item.data.caption,
                }}
              />
            )
          }

          const post = item.data
          if (post.type === 'event' && post.event?.creator) {
            return <FeedEventPost key={`event-${i}`} event={post.event} />
          }
          if (post.type === 'memory') return <FeedMemoryPost key={`memory-${i}`} memory={post.memory} />
          if (post.type === 'announcement') {
            return (
              <FeedAnnouncementPost key={`ann-${i}`} creator={post.creator} text={post.text} />
            )
          }
          return null
        })}

        <p className="py-10 text-center ios-caption">You&apos;re all caught up</p>
      </div>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <FeedStoryStripModals
        strip={storyStrip}
        viewerIndex={storyStrip.viewerIndex}
        setViewerIndex={storyStrip.setViewerIndex}
        composerOpen={storyStrip.composerOpen}
      />
    </div>
  )
}
