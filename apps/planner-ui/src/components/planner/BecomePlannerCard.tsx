import { Crown, Download, ExternalLink, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PLANNER_APK_URL } from '../../config/downloads'

export function BecomePlannerCard({
  variant = 'profile',
}: {
  variant?: 'profile' | 'settings' | 'page'
}) {
  if (variant === 'settings') {
    return (
      <a
        href={PLANNER_APK_URL}
        className="flex items-center gap-3 py-3.5"
        download
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <Crown className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium">Become a planner</p>
          <p className="text-xs text-slate-500">Download Planner Studio for Android</p>
        </div>
        <Download className="h-4 w-4 shrink-0 text-slate-600" />
      </a>
    )
  }

  if (variant === 'page') {
    return (
      <div className="mx-4 mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-warning/20 via-[#0a84ff]/15 to-[#bf5af2]/20 p-6 text-left">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/20">
          <Crown className="h-7 w-7 text-warning" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Become a planner</h1>
        <p className="mt-2 text-sm leading-relaxed text-[rgba(235,235,245,0.65)]">
          Create events, design seating, manage tickets, run the door, and grow your club —
          in a dedicated Planner Studio app built for organizers.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-[rgba(235,235,245,0.7)]">
          {[
            'Event creation & ticketing',
            'Seating studio & menus',
            'Team, scanner & bar board',
            'Analytics & public brand page',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-warning" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={PLANNER_APK_URL}
          download
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#0a84ff] py-3.5 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Download Planner Studio
        </a>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          Signed Android APK · Install over previous planner builds
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-warning/20 bg-gradient-to-br from-warning/10 to-primary/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/20">
          <Crown className="h-5 w-5 text-warning" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold">Become a planner</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
            Host events with the free Planner Studio app — seating, menus, team & live ops.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={PLANNER_APK_URL}
              download
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0a84ff] px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download app
            </a>
            <Link
              to="/become-planner"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
