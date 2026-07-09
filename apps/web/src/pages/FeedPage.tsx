import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SuggestPeopleCarousel, SuggestCreatorsCarousel } from '../components/feed/FeedCarousels'
import { FeedStoryStrip, FeedActivityCard, useFeedStoryStrip, FeedStoryStripModals } from '../components/feed/FeedStories'
import { GuestHomeFeed } from '../components/feed/GuestHomeFeed'
import {
  FeedEventPost,
  FeedMemoryPost,
  FeedAnnouncementPost,
  FeedUserPost,
} from '../components/feed/FeedPosts'
import { PostComposer } from '../components/feed/PostComposer'
import { FeedPostSkeleton, StoryStripSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { WebContentGrid, WebPageHeader } from '../components/layout/WebLayout'
import { FeedDiscoverSidebar } from '../components/layout/FeedDiscoverSidebar'
import { GuestDiscoverSidebar } from '../components/layout/GuestDiscoverSidebar'
import { socialActivities, currentUser } from '../data/socialData'
import { feedPostsFollowing } from '../data/mockData'
import { useSocial } from '../context/SocialContext'
import { useTickets } from '../context/TicketsContext'
import { usePosts } from '../context/PostsContext'
import { useLoginGate } from '../context/LoginGateContext'
import { useAuth } from '../context/AuthContext'

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
  socialActivities.slice(0, 2).forEach((a) => items.push({ kind: 'activity', data: a }))

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

export default function FeedPage() {
  const { isAuthenticated } = useAuth()
  const { goingActivities } = useTickets()
  const { posts: userPosts } = usePosts()
  const { requireLogin } = useLoginGate()
  const [composerOpen, setComposerOpen] = useState(false)
  const storiesSectionRef = useRef<HTMLElement>(null)
  const storyStrip = useFeedStoryStrip()
  const feedBuilt = buildFeed(goingActivities, userPosts)
  const { data: feed, isLoading: feedLoading } = useSimulatedQuery(feedBuilt, [
    feedBuilt.length,
    userPosts.length,
  ], { enabled: isAuthenticated })

  if (!isAuthenticated) {
    return (
      <>
        <WebPageHeader
          title="Discover events"
          subtitle="Browse what's happening near you. Sign in for your personalized feed, tickets, and messages."
          actions={
            <Link
              to="/auth"
              className="rounded-lg bg-[#0a84ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0070e0]"
            >
              Sign in
            </Link>
          }
        />
        <WebContentGrid main={<GuestHomeFeed />} sidebar={<GuestDiscoverSidebar />} />
      </>
    )
  }

  const feedContent = feedLoading ? (
    <div className="web-feed-column space-y-5">
      <StoryStripSkeleton />
      <FeedPostSkeleton />
      <FeedPostSkeleton />
      <FeedPostSkeleton />
    </div>
  ) : (
    <div className="web-feed-column">
      <FeedStoryStrip strip={storyStrip} sectionRef={storiesSectionRef} />

      <div className="space-y-5">
        {feed?.map((item, i) => {
          if (item.kind === 'user-post') return <FeedUserPost key={item.data.id} post={item.data} />
          if (item.kind === 'carousel-people')
            return (
              <div key={`p-${i}`} className="lg:hidden">
                <SuggestPeopleCarousel />
              </div>
            )
          if (item.kind === 'carousel-creators')
            return (
              <div key={`c-${i}`} className="lg:hidden">
                <SuggestCreatorsCarousel />
              </div>
            )
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
            return <FeedAnnouncementPost key={`ann-${i}`} creator={post.creator} text={post.text} />
          }
          return null
        })}
      </div>

      <p className="py-10 text-center ios-caption">You&apos;re all caught up</p>
    </div>
  )

  return (
    <>
      <WebPageHeader
        title="Home"
        subtitle="Events, memories, and updates from people you follow"
        actions={
          <button
            type="button"
            onClick={() => requireLogin(() => setComposerOpen(true))}
            className="flex items-center gap-2 rounded-lg bg-[#0a84ff] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            New post
          </button>
        }
      />
      <WebContentGrid main={feedContent} sidebar={<FeedDiscoverSidebar />} />

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <FeedStoryStripModals
        strip={storyStrip}
        viewerIndex={storyStrip.viewerIndex}
        setViewerIndex={storyStrip.setViewerIndex}
        composerOpen={storyStrip.composerOpen}
      />
    </>
  )
}
