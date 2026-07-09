import { media } from '../data/media'
import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Settings,
  MapPin,
  MessageCircle,
  Grid3X3,
  Image,
  Info,
  Lock,
  Clock,
  MessageSquare,
  Plus,
} from 'lucide-react'
import { useSocial } from '../context/SocialContext'
import { usePosts } from '../context/PostsContext'
import { FollowButton } from '../components/Social'
import { PostComposer } from '../components/feed/PostComposer'
import { FeedUserPost } from '../components/feed/FeedPosts'
import { currentUser, userProfiles, type UserProfile } from '../data/socialData'
import { ProfileHeaderSkeleton, FeedPostSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { WebPageHeader } from '../components/layout/WebLayout'

const profileTabs = [
  { id: 'Posts' as const, icon: MessageSquare },
  { id: 'Events' as const, icon: Grid3X3 },
  { id: 'Memories' as const, icon: Image },
  { id: 'About' as const, icon: Info },
]

function ProfileContent({ profile, isOwn }: { profile: UserProfile; isOwn: boolean }) {
  const [tab, setTab] = useState<(typeof profileTabs)[number]['id']>(isOwn ? 'Posts' : 'Events')
  const [composerOpen, setComposerOpen] = useState(false)
  const { canViewProfile, isFollowing, isRequestPending } = useSocial()
  const { getPostsByAuthor } = usePosts()
  const userPosts = isOwn ? getPostsByAuthor('me') : []
  const canView = canViewProfile(profile, isOwn)
  const following = isFollowing(profile.id)
  const pending = isRequestPending(profile.id)
  const isPrivate = profile.isPrivate === true

  const cover =
    profile.coverUrl ??
    media.crowd
  const { isLoading } = useSimulatedQuery(profile, [profile.id, tab], { delay: 550 })

  if (isLoading) {
    return (
      <div className="web-container py-8">
        <ProfileHeaderSkeleton />
        <div className="mt-6 space-y-4">
          <FeedPostSkeleton />
          <FeedPostSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <div className="relative h-44 overflow-hidden lg:h-56">
        <img src={cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-black/30" />
        {isOwn && (
          <Link
            to="/settings"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur lg:right-8"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="web-container relative -mt-12 max-w-4xl">
        {/* Avatar + actions */}
        <div className="-mt-14 flex items-end justify-between">
          <div className="relative">
            <img
              src={profile.avatar}
              alt=""
              className="h-[104px] w-[104px] rounded-full border-4 border-[#0a0a0f] object-cover shadow-xl"
            />
            {isPrivate && (
              <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0a0f] ring-2 ring-[#0a0a0f]">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
              </span>
            )}
          </div>
          <div className="flex gap-2 pb-1">
            {!isOwn && (
              <>
                {canView && (
                  <Link
                    to={`/messages?chat=user-${profile.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                )}
                {!profile.isCreator && <FollowButton userId={profile.id} />}
              </>
            )}
            {isOwn && (
              <Link
                to="/profile/edit"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold"
              >
                Edit profile
              </Link>
            )}
            {isOwn && (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a84ff] text-white"
                aria-label="Create post"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mt-3 text-left">
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-slate-400">@{profile.handle}</p>
          {profile.bio && (
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{profile.bio}</p>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {profile.location}
          </p>
          {!isOwn && profile.mutualFriends > 0 && (
            <p className="mt-1.5 text-xs text-primary-light">
              {profile.mutualFriends} mutual friends
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] py-3">
          {[
            { value: profile.eventsAttended, label: 'Events' },
            { value: profile.followers.toLocaleString(), label: 'Followers', to: `followers` },
            { value: profile.following, label: 'Following', to: `following` },
            { value: isPrivate ? '🔒' : '🌐', label: isPrivate ? 'Private' : 'Public' },
          ].map((stat) =>
            stat.to && canView ? (
              <Link
                key={stat.label}
                to={`/user/${profile.handle}/${stat.to}`}
                className="text-center"
              >
                <p className="text-base font-bold">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </Link>
            ) : (
              <div key={stat.label} className="text-center">
                <p className="text-base font-bold">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            ),
          )}
        </div>

        {/* Locked / pending states */}
        {!canView && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              {pending ? (
                <Clock className="h-8 w-8 text-warning" />
              ) : (
                <Lock className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <p className="mt-4 font-semibold">
              {pending ? 'Follow request sent' : 'This account is private'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {pending
                ? 'You\'ll see their events and memories once they accept'
                : 'Send a follow request to see their events and memories'}
            </p>
            {!pending && (
              <div className="mt-5 flex justify-center">
                <FollowButton userId={profile.id} />
              </div>
            )}
            {pending && (
              <p className="mt-4 text-xs text-slate-500">Demo: auto-accepts in a few seconds</p>
            )}
          </motion.div>
        )}

        {canView && (
          <>
            {profile.upcomingEvents.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 p-3">
                  <img
                    src={profile.upcomingEvents[0].cover}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-light">
                      Going next
                    </p>
                    <p className="text-sm font-semibold">{profile.upcomingEvents[0].title}</p>
                    <p className="text-xs text-slate-400">{profile.upcomingEvents[0].date}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6 flex border-b border-white/10">
              {profileTabs.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                    tab === id
                      ? 'border-b-2 border-white text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {id}
                </button>
              ))}
            </div>

            <div className="mt-4 text-left">
              {tab === 'Posts' && (
                <div className="space-y-4">
                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => setComposerOpen(true)}
                      className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm font-medium text-[#0a84ff]"
                    >
                      + Create post
                    </button>
                  )}
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => <FeedUserPost key={post.id} post={post} />)
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-500">
                      {isOwn ? 'Share updates, memories, or events' : 'No posts yet'}
                    </p>
                  )}
                </div>
              )}

              {tab === 'Events' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {profile.upcomingEvents.map((e) => (
                    <Link
                      key={e.id}
                      to="/event"
                      className="group relative aspect-square overflow-hidden bg-surface-2"
                    >
                      <img
                        src={e.cover}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium leading-tight opacity-0 transition-opacity group-hover:opacity-100">
                        {e.title}
                      </p>
                    </Link>
                  ))}
                  {profile.upcomingEvents.length === 0 && (
                    <p className="col-span-3 py-12 text-center text-sm text-slate-500">
                      No upcoming events
                    </p>
                  )}
                </div>
              )}

              {tab === 'Memories' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {profile.recentMemories.map((m, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden bg-surface-2">
                      <img src={m.image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {profile.recentMemories.length === 0 && (
                    <p className="col-span-3 py-12 text-center text-sm text-slate-500">
                      No memories yet
                    </p>
                  )}
                </div>
              )}

              {tab === 'About' && (
                <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Events attended</span>
                    <span className="font-medium">{profile.eventsAttended}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium">{profile.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account</span>
                    <span className="font-medium">{isPrivate ? 'Private' : 'Public'}</span>
                  </div>
                  {!isOwn && following && (
                    <Link
                      to={`/messages?chat=user-${profile.id}`}
                      className="block rounded-xl bg-primary/15 py-3 text-center font-medium text-primary-light"
                    >
                      Send message
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isOwn && <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />}
    </div>
  )
}

export default function UserProfilePage() {
  const { handle, list } = useParams<{ handle: string; list?: string }>()
  const { followingIds, isFollowing } = useSocial()

  if (handle === 'reza' || handle === 'me') {
    return <ProfileContent profile={currentUser} isOwn />
  }

  const profile = userProfiles.find((p) => p.handle === handle)
  if (!profile) return <Navigate to="/feed" replace />

  if (list === 'followers' || list === 'following') {
    const isFollowersList = list === 'followers'
    const listUsers = isFollowersList
      ? userProfiles.filter((u) => u.id !== profile.id).slice(0, 6)
      : userProfiles.filter((u) => followingIds.has(u.id) || u.id === profile.id).slice(0, 5)

    return (
      <div className="pb-10">
        <WebPageHeader title={list} subtitle={`@${profile.handle}`} />
        <div className="web-container mx-auto max-w-2xl divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
          {listUsers.map((u) => (
            <Link
              key={u.id}
              to={`/user/${u.handle}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5"
            >
              <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              <div className="flex-1 text-left">
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-slate-400">@{u.handle}</p>
              </div>
              {u.id !== profile.id && !isFollowing(u.id) && (
                <FollowButton userId={u.id} size="sm" />
              )}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return <ProfileContent profile={profile} isOwn={false} />
}

export function MyProfilePage() {
  return <ProfileContent profile={currentUser} isOwn />
}
