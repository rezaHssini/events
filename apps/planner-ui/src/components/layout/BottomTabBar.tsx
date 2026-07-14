import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, CalendarDays, Plus, ScanLine, BarChart3 } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/' },
  { path: '/club/events', label: 'Events', icon: CalendarDays, match: (p: string) => p.startsWith('/club/events') },
  { path: '/create-event', label: 'Create', icon: Plus, match: (p: string) => p.startsWith('/create-event') },
  { path: '/club/scanner', label: 'Live', icon: ScanLine, match: (p: string) => p.startsWith('/club/scanner') || p.startsWith('/club/bar') },
  { path: '/club/analytics', label: 'Insights', icon: BarChart3, match: (p: string) => p.startsWith('/club/analytics') },
] as const

export function BottomTabBar() {
  const location = useLocation()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md justify-center px-5 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
      <nav className="floating-tab-bar pointer-events-auto flex h-[56px] w-full max-w-[360px] items-stretch px-1.5">
        {tabs.map(({ path, label, icon: Icon, match }) => {
          const active = match(location.pathname)
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              {active && (
                <motion.div
                  layoutId="planner-tab-pill"
                  className="absolute inset-x-1 top-1.5 bottom-1 rounded-[16px] bg-white/14"
                  style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-colors duration-200 ${
                  active
                    ? path === '/create-event'
                      ? 'text-[#ffd60a]'
                      : 'text-white'
                    : 'text-[rgba(235,235,245,0.45)]'
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={`relative z-10 text-[10px] font-medium tracking-[0.01em] ${
                  active ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
