import { Link } from 'react-router-dom'
import { BottomNav, EventCard } from '../components/UI'
import { events } from '../data/mockData'

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search events, creators, venues..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
            defaultValue="neon"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {['All', 'Music', 'Art', 'Food', 'Workshop', 'Free', 'Seated'].map((c) => (
            <button
              key={c}
              className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                c === 'Music' ? 'bg-primary text-white' : 'bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-4">
        <p className="mb-3 text-left text-sm text-slate-400">3 events found</p>
        {events.map((e) => (
          <EventCard key={e.id} event={e} compact />
        ))}
        <section className="mt-6 text-left">
          <h2 className="mb-3 font-semibold">Trending Creators</h2>
          <Link to="/creator" className="flex items-center gap-3 rounded-xl glass p-3 card-hover">
            <img src={events[0].creator.avatar} alt="" className="h-12 w-12 rounded-full" />
            <div>
              <p className="font-medium">{events[0].creator.name} ✓</p>
              <p className="text-sm text-slate-400">
                {events[0].creator.followers.toLocaleString()} followers
              </p>
            </div>
            <button className="ml-auto rounded-full bg-primary px-4 py-1.5 text-sm font-medium">
              Follow
            </button>
          </Link>
        </section>
      </div>
      <BottomNav />
    </div>
  )
}
