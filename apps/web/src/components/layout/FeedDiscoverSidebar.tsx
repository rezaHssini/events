import { Link } from 'react-router-dom'
import { WebCard } from './WebLayout'
import { FollowButton } from '../Social'
import { suggestedUsers } from '../../data/socialData'
import { creatorProfilesByHandle } from '../../data/creatorProfiles'
import { useSocial } from '../../context/SocialContext'

export function FeedDiscoverSidebar() {
  const { followingIds, isFollowing } = useSocial()
  const people = suggestedUsers.filter((u) => !followingIds.has(u.id)).slice(0, 5)
  const planners = Object.values(creatorProfilesByHandle).slice(0, 3)

  return (
    <div className="space-y-4">
      <WebCard title="Suggested people">
        <ul className="space-y-3">
          {people.map((user) => (
            <li key={user.id} className="flex items-center gap-3">
              <Link to={`/user/${user.handle}`}>
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1 text-left">
                <Link to={`/user/${user.handle}`} className="block truncate text-sm font-medium hover:text-[#0a84ff]">
                  {user.name}
                </Link>
                <p className="truncate text-xs text-slate-500">@{user.handle}</p>
              </div>
              <FollowButton userId={user.id} size="sm" />
            </li>
          ))}
        </ul>
        <Link to="/find-people" className="mt-3 block text-center text-sm font-medium text-[#0a84ff]">
          See all people →
        </Link>
      </WebCard>

      <WebCard title="Event planners">
        <ul className="space-y-3">
          {planners.map((p) => (
            <li key={p.handle} className="flex items-center gap-3">
              <Link to={`/page/${p.handle}`}>
                <img src={p.avatar} alt="" className="h-10 w-10 rounded-xl object-cover" />
              </Link>
              <div className="min-w-0 flex-1 text-left">
                <Link to={`/page/${p.handle}`} className="block truncate text-sm font-medium hover:text-[#0a84ff]">
                  {p.name}
                </Link>
                <p className="text-xs text-slate-500">{p.followers.toLocaleString()} followers</p>
              </div>
              {!isFollowing(p.followId) && <FollowButton userId={p.followId} size="sm" />}
            </li>
          ))}
        </ul>
      </WebCard>
    </div>
  )
}
