import { Link } from 'react-router-dom'
import { WebCard } from './WebLayout'
import { creatorProfilesByHandle } from '../../data/creatorProfiles'
import { categories } from '../../data/mockData'

export function GuestDiscoverSidebar() {
  const planners = Object.values(creatorProfilesByHandle).slice(0, 4)

  return (
    <div className="space-y-4">
      <WebCard title="Popular planners">
        <ul className="space-y-3">
          {planners.map((p) => (
            <li key={p.handle} className="flex items-center gap-3">
              <Link to={`/page/${p.handle}`}>
                <img src={p.avatar} alt="" className="h-10 w-10 rounded-xl object-cover" />
              </Link>
              <div className="min-w-0 flex-1 text-left">
                <Link
                  to={`/page/${p.handle}`}
                  className="block truncate text-sm font-medium hover:text-[#0a84ff]"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-slate-500">{p.followers.toLocaleString()} followers</p>
              </div>
            </li>
          ))}
        </ul>
      </WebCard>

      <WebCard title="Browse by category">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/explorer"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              {cat}
            </Link>
          ))}
        </div>
      </WebCard>

      <WebCard title="Free to browse · Sign in to do more">
        <ul className="space-y-2 text-left text-sm text-[rgba(235,235,245,0.55)]">
          <li>🎫 Buy &amp; manage tickets</li>
          <li>👥 Follow friends &amp; planners</li>
          <li>💬 Message creators</li>
          <li>📱 Stories &amp; memories (mobile app)</li>
        </ul>
        <Link
          to="/auth"
          className="mt-4 block text-center text-sm font-semibold text-[#0a84ff] hover:underline"
        >
          Create free account →
        </Link>
      </WebCard>
    </div>
  )
}
