import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Users } from 'lucide-react'
import { mainTabLinkState } from '../layout/MainBackButton'
import { FollowButton } from '../Social'
import { suggestedUsers } from '../../data/socialData'
import { creatorProfilesByHandle } from '../../data/creatorProfiles'
import { useSocial } from '../../context/SocialContext'

export function SuggestPeopleCarousel() {
  const { followingIds } = useSocial()
  const people = suggestedUsers.filter((u) => !followingIds.has(u.id)).slice(0, 8)

  if (people.length === 0) return null

  return (
    <section className="feed-card mb-5 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light">
            Discover people
          </p>
          <p className="text-xs text-slate-500">Event lovers near you</p>
        </div>
        <Link
          to="/find-people"
          state={mainTabLinkState('/feed')}
          className="flex items-center gap-0.5 text-xs font-medium text-primary-light"
        >
          See all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-4">
        {people.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="flex w-[108px] shrink-0 flex-col items-center"
          >
            <Link to={`/user/${user.handle}`} className="group">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt=""
                  className="h-[72px] w-[72px] rounded-2xl object-cover ring-2 ring-white/10 transition-transform group-active:scale-95"
                />
                {user.mutualFriends > 0 && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold">
                    {user.mutualFriends}
                  </span>
                )}
              </div>
            </Link>
            <p className="mt-2 w-full truncate text-center text-xs font-semibold">{user.name}</p>
            <p className="w-full truncate text-center text-[10px] text-slate-500">@{user.handle}</p>
            <div className="mt-2 flex w-full justify-center">
              <FollowButton userId={user.id} size="sm" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const plannerPages = Object.values(creatorProfilesByHandle).map((profile) => ({
  id: profile.id,
  name: profile.name,
  handle: profile.handle,
  avatar: profile.avatar,
  banner: profile.banner,
  verified: profile.verified,
  followers: profile.followers,
  bio: profile.bio,
  followId: profile.followId,
}))

export function SuggestCreatorsCarousel() {
  const { isFollowing } = useSocial()

  return (
    <section className="feed-card mb-5 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-secondary">
            Event planners
          </p>
          <p className="text-xs text-slate-500">Follow clubs & brands</p>
        </div>
        <Link
          to="/explorer?tab=trends"
          className="flex items-center gap-0.5 text-xs font-medium text-secondary"
        >
          See all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-4">
        {plannerPages.map((page, i) => {
          const following = isFollowing(page.followId)
          return (
            <motion.div
              key={page.handle}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="w-[168px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-2"
            >
              <Link to={`/page/${page.handle}`} className="block">
                <div className="relative h-[72px] overflow-hidden">
                  <img
                    src={page.banner}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141f] to-transparent" />
                </div>
                <div className="relative px-3 pb-3">
                  <img
                    src={page.avatar}
                    alt=""
                    className="absolute -top-6 left-3 h-12 w-12 rounded-xl border-2 border-[#14141f] object-cover shadow-lg"
                  />
                  <div className="pt-7 text-left">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold">
                      {page.name}
                      {page.verified && <span className="text-secondary text-xs">✓</span>}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Users className="h-3 w-3" />
                      {page.followers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
              {!following && (
                <div className="flex justify-center px-3 pb-3" onClick={(e) => e.stopPropagation()}>
                  <FollowButton userId={page.followId} size="sm" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
