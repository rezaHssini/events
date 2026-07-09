import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Compass,
  Home,
  LogIn,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLoginGate } from '../../context/LoginGateContext'
import { usePlanner } from '../../context/PlannerContext'
import { WebUserMenu } from './WebUserMenu'

const publicLinks = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/explorer', label: 'Explore', icon: Compass },
  { to: '/find-people', label: 'People', icon: Users },
] as const

const authLinks = [
  { to: '/my-events', label: 'My Events', icon: Ticket },
  { to: '/planner', label: 'Planner', icon: Sparkles },
] as const

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/12 text-white'
      : 'text-[rgba(235,235,245,0.55)] hover:bg-white/6 hover:text-white'
  }`
}

export function WebNavbar() {
  const { isAuthenticated } = useAuth()
  const { requireLogin } = useLoginGate()
  const { isPlanner } = usePlanner()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/85 backdrop-blur-xl">
      <div className="web-container flex h-14 items-center gap-4 lg:h-16">
        <Link to="/feed" className="flex shrink-0 items-center gap-2 pr-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#bf5af2] text-sm font-bold">
            E
          </span>
          <span className="hidden font-semibold tracking-tight sm:inline">Event</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {isAuthenticated &&
            authLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass}>
                <Icon className="h-4 w-4" />
                {isPlanner && to === '/planner' ? 'Club' : label}
              </NavLink>
            ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => requireLogin(() => navigate('/create-event'))}
              className="hidden items-center gap-1.5 rounded-lg bg-[#0a84ff] px-3 py-2 text-sm font-medium text-white sm:flex"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          )}

          <Link
            to="/explorer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[rgba(235,235,245,0.6)] hover:bg-white/8 hover:text-white"
            aria-label="Search events"
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => requireLogin(() => navigate('/notifications'))}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[rgba(235,235,245,0.6)] hover:bg-white/8 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {isAuthenticated && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff453a]" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/messages"
                className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-[rgba(235,235,245,0.6)] hover:bg-white/8 hover:text-white sm:flex"
                aria-label="Messages"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0a84ff] text-[9px] font-bold text-white">
                  1
                </span>
              </Link>
              <WebUserMenu />
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-lg bg-[#0a84ff] px-3 py-2 text-sm font-medium text-white"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex gap-1 overflow-x-auto border-t border-white/8 px-3 py-2 md:hidden scrollbar-hide">
        {publicLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                isActive ? 'bg-white/14 text-white' : 'text-[rgba(235,235,245,0.5)]'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        {isAuthenticated &&
          authLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-white/14 text-white' : 'text-[rgba(235,235,245,0.5)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
      </nav>
    </header>
  )
}

import { MobileAppPromo } from './MobileAppPromo'

export function WebFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 py-8">
      <div className="web-container space-y-8">
        <MobileAppPromo variant="banner" />
        <div className="flex flex-col items-start justify-between gap-4 text-sm text-[rgba(235,235,245,0.45)] sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Event — Discover nights out near you</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/explorer" className="hover:text-white">
            Browse events
          </Link>
          <Link to="/find-people" className="hover:text-white">
            Find people
          </Link>
          <Link to="/auth" className="hover:text-white">
            Sign in
          </Link>
        </div>
        </div>
      </div>
    </footer>
  )
}
