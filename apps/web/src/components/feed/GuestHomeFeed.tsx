import { Link } from 'react-router-dom'
import { ExplorerEventCard } from '../explorer/ExplorerEventCard'
import { events } from '../../data/mockData'
import { WebCard } from '../layout/WebLayout'

export function GuestHomeFeed() {
  const trending = events.filter((e) => e.status !== 'past').slice(0, 6)

  return (
    <div className="space-y-8">
      <WebCard className="!border-[#0a84ff]/25 !bg-gradient-to-br !from-[#0a84ff]/12 !to-[#bf5af2]/8 !p-6">
        <h2 className="text-left text-xl font-bold tracking-tight lg:text-2xl">
          Sign in for your personalized feed
        </h2>
        <p className="mt-2 text-left text-sm leading-relaxed text-[rgba(235,235,245,0.55)]">
          Follow friends and planners, save events, buy tickets, and chat — all synced with the mobile
          app.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-lg bg-[#0a84ff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0070e0]"
          >
            Sign in or create account
          </Link>
          <Link
            to="/explorer"
            className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            Browse all events
          </Link>
        </div>
      </WebCard>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="text-left">
            <h2 className="text-lg font-semibold">Trending near you</h2>
            <p className="text-sm text-[rgba(235,235,245,0.45)]">Public events you can browse without an account</p>
          </div>
          <Link to="/explorer" className="shrink-0 text-sm font-medium text-[#0a84ff] hover:underline">
            See all →
          </Link>
        </div>
        <div className="web-event-grid">
          {trending.map((event) => (
            <ExplorerEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  )
}
