import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'
import { usePlanner, useClubProfile } from '../context/PlannerContext'
import { WebPageHeader } from '../components/layout/WebLayout'
import { BecomeClubWizard } from '../components/club/BecomeClubWizard'
import { PostComposer } from '../components/feed/PostComposer'
import { AppImage } from '../components/ui/AppImage'
import { MobileAppPromo } from '../components/layout/MobileAppPromo'

const hubSections = [
  {
    icon: Layout,
    title: 'Planner page',
    desc: 'Edit your public brand page',
    to: '/club/page',
    color: 'from-secondary/20 to-primary/10',
  },
  {
    icon: CalendarDays,
    title: 'My events',
    desc: 'Upcoming, past & drafts',
    to: '/club/events',
    color: 'from-primary/20 to-pink-500/10',
  },
  {
    icon: Plus,
    title: 'Create event',
    desc: 'New event in any category',
    to: '/create-event',
    color: 'from-warning/20 to-orange-500/10',
  },
  {
    icon: Users,
    title: 'Team',
    desc: 'Club-wide roster & invites',
    to: '/club/team',
    color: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Revenue, tickets & trends',
    to: '/club/analytics',
    color: 'from-success/20 to-emerald-500/10',
  },
]

export default function PlannerPage() {
  const { isPlanner, clubProfile, managedEvents, assignedStaffRoles } = usePlanner()
  const profile = useClubProfile()
  const [composerOpen, setComposerOpen] = useState(false)

  const liveEvent = managedEvents.find((e) => e.status === 'live')
  const upcomingCount = managedEvents.filter((e) =>
    ['live', 'upcoming', 'scheduled'].includes(e.status),
  ).length
  const pastCount = managedEvents.filter((e) => e.status === 'past').length
  const draftCount = managedEvents.filter((e) => e.status === 'draft').length

  if (!isPlanner) {
    return <BecomeClubWizard />
  }

  const handle = clubProfile?.handle ?? profile.handle
  const clubName = clubProfile?.name ?? profile.name

  return (
    <div className="pb-10">
      <WebPageHeader
        title={clubName}
        subtitle="Planner hub — manage your page, events & team"
        actions={
          <Link
            to={`/page/${handle}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <Eye className="h-4 w-4" />
            View public page
          </Link>
        }
      />

      <div className="web-container space-y-6">
      <MobileAppPromo variant="banner" product="planner" />

      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-warning/10 to-primary/10 px-5 py-5 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-lg">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-warning">My Club</p>
            <h1 className="text-xl font-bold">{clubName}</h1>
            <p className="text-xs text-slate-400">
              {upcomingCount} upcoming · {pastCount} past · {draftCount} drafts
            </p>
          </div>
          <Link
            to={`/page/${handle}`}
            className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs text-primary-light"
          >
            <Eye className="h-3.5 w-3.5" />
            Page
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-primary/15 to-secondary/10 p-4 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a84ff]/20">
            <MessageSquare className="h-5 w-5 text-[#0a84ff]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">New post</p>
            <p className="text-xs text-slate-400">Share updates, events, or memories</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>

        {liveEvent && (
          <Link to={`/club/events/${liveEvent.id}`} className="block rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left card-hover">
            <p className="text-sm font-medium">🔴 Live on sale</p>
            <p className="text-lg font-bold">{liveEvent.title}</p>
            <p className="text-xs text-slate-400">
              {liveEvent.category} · {liveEvent.location}, {liveEvent.city}
            </p>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(liveEvent.sold / liveEvent.capacity) * 100}%` }}
                className="h-full rounded-full gradient-hero"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {liveEvent.sold} / {liveEvent.capacity} sold · ${liveEvent.revenue.toLocaleString()} revenue
            </p>
          </Link>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hubSections.map(({ icon: Icon, title, desc, to, color }) => (
            <Link
              key={title}
              to={to}
              className={`rounded-2xl bg-gradient-to-br ${color} border border-white/10 p-4 text-left card-hover`}
            >
              <Icon className="h-5 w-5 text-primary-light" />
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="text-[10px] text-slate-400">{desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="mb-3 text-left text-sm font-semibold">Recent events</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {managedEvents.slice(0, 3).map((event) => (
          <Link
            key={event.id}
            to={`/club/events/${event.id}`}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 card-hover"
          >
            <AppImage src={event.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium line-clamp-1">{event.title}</p>
              <p className="text-[10px] text-slate-400">
                {event.category} · {event.city}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Link>
        ))}
        </div>
        <Link to="/club/events" className="block py-2 text-center text-xs text-primary-light">
          View all events →
        </Link>

        <AnimatePresence>
          {assignedStaffRoles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <h2 className="mb-3 text-left text-sm font-semibold">Your staff shifts</h2>
              <div className="grid grid-cols-2 gap-2">
                {assignedStaffRoles.includes('security') && (
                  <Link
                    to="/club/scanner"
                    className="flex flex-col items-center gap-2 rounded-2xl border border-secondary/30 bg-secondary/10 p-5"
                  >
                    <ScanLine className="h-8 w-8 text-secondary" />
                    <span className="text-sm font-semibold">Ticket Scanner</span>
                  </Link>
                )}
                {assignedStaffRoles.includes('bar') && (
                  <Link
                    to="/club/bar"
                    className="flex flex-col items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-5"
                  >
                    <ChefHat className="h-8 w-8 text-warning" />
                    <span className="text-sm font-semibold">Bar Display</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 rounded-2xl glass p-4 text-left text-xs text-slate-400">
          <p className="font-medium text-slate-300">Planner page ≠ personal profile</p>
          <p className="mt-1">
            <Link to={`/page/${handle}`} className="text-primary-light">@{handle}</Link> is your
            public brand. <Link to="/profile" className="text-primary-light">@reza</Link> is your
            personal social profile.
          </p>
        </div>
      </div>
      </div>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  )
}
