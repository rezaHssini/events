import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Crown,
  Plus,
  Users,
  ChefHat,
  BarChart3,
  ScanLine,
  ChevronRight,
  Layout,
  CalendarDays,
  Eye,
  MessageSquare,
  Settings2,
} from 'lucide-react'
import { usePlanner, useClubProfile } from '../context/PlannerContext'
import { PostComposer } from '../components/feed/PostComposer'

const quickActions = [
  {
    icon: Plus,
    title: 'Create',
    desc: 'New event',
    to: '/create-event',
    accent: 'bg-[#0a84ff]',
  },
  {
    icon: ScanLine,
    title: 'Scanner',
    desc: 'Door & tickets',
    to: '/club/scanner',
    accent: 'bg-emerald-500/90',
  },
  {
    icon: ChefHat,
    title: 'Bar board',
    desc: 'Live orders',
    to: '/club/bar',
    accent: 'bg-orange-500/90',
  },
  {
    icon: BarChart3,
    title: 'Insights',
    desc: 'Sales & seats',
    to: '/club/analytics',
    accent: 'bg-violet-500/90',
  },
] as const

const manageLinks = [
  {
    icon: Layout,
    title: 'Public page',
    desc: 'Brand, bio & cover',
    to: '/club/page',
  },
  {
    icon: CalendarDays,
    title: 'All events',
    desc: 'Live, upcoming & drafts',
    to: '/club/events',
  },
  {
    icon: Users,
    title: 'Team',
    desc: 'Staff roles & invites',
    to: '/club/team',
  },
] as const

export default function PlannerHomePage() {
  const { clubProfile, managedEvents, assignedStaffRoles } = usePlanner()
  const profile = useClubProfile()
  const [composerOpen, setComposerOpen] = useState(false)

  const liveEvent = managedEvents.find((e) => e.status === 'live')
  const upcomingCount = managedEvents.filter((e) =>
    ['live', 'upcoming', 'scheduled'].includes(e.status),
  ).length
  const pastCount = managedEvents.filter((e) => e.status === 'past').length
  const draftCount = managedEvents.filter((e) => e.status === 'draft').length

  const handle = clubProfile?.handle ?? profile.handle
  const clubName = clubProfile?.name ?? profile.name

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 px-4 pb-5 pt-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-warning/20 via-primary/10 to-transparent" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-lg">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warning">
              Planner Studio
            </p>
            <h1 className="truncate text-xl font-bold">{clubName}</h1>
            <p className="text-xs text-slate-400">@{handle}</p>
          </div>
          <Link
            to={`/page/${handle}`}
            className="flex items-center gap-1 rounded-full liquid-glass-subtle px-3 py-1.5 text-xs text-primary-light"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Link>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Upcoming', value: upcomingCount },
            { label: 'Past', value: pastCount },
            { label: 'Drafts', value: draftCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[16px] liquid-glass-subtle px-3 py-2.5 text-center"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-5 px-4 py-5">
        {liveEvent && (
          <Link
            to={`/club/events/${liveEvent.id}`}
            className="block overflow-hidden rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Live now
                </p>
                <p className="truncate font-semibold">{liveEvent.title}</p>
                <p className="text-xs text-slate-400">
                  {liveEvent.sold.toLocaleString()} tickets · ${liveEvent.revenue.toLocaleString()}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-emerald-400" />
            </div>
          </Link>
        )}

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(({ icon: Icon, title, desc, to, accent }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-[18px] liquid-glass-subtle p-3.5 text-left"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-[11px] text-slate-500">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Manage
          </h2>
          <div className="overflow-hidden rounded-[20px] border border-white/10 divide-y divide-white/5">
            {manageLinks.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-4 w-4 text-[#64b5ff]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-slate-500">{desc}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </Link>
            ))}
          </div>
        </section>

        {assignedStaffRoles.length > 0 && (
          <section>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Your shifts
            </h2>
            <div className="flex flex-wrap gap-2">
              {assignedStaffRoles.includes('security') && (
                <Link
                  to="/club/scanner"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
                >
                  Security · Scanner
                </Link>
              )}
              {assignedStaffRoles.includes('bar') && (
                <Link
                  to="/club/bar"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
                >
                  Bar · Orders
                </Link>
              )}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-white/20 py-3.5 text-sm font-medium text-[#0a84ff]"
        >
          <MessageSquare className="h-4 w-4" />
          Post as club
        </button>

        <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-slate-600">
          <Settings2 className="h-3 w-3" />
          Same Event look & feel — built for organizers
        </p>
      </div>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  )
}
