import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass, Ticket, Sparkles, Crown } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'

const tabs = [
  { path: '/feed', label: 'Feed', icon: Home },
  { path: '/explorer', label: 'Explore', icon: Compass },
  { path: '/my-events', label: 'Events', icon: Ticket },
] as const

export function BottomTabBar() {
  const location = useLocation()
  const { isPlanner } = usePlanner()
  const plannerPath = '/planner'
  const isPlannerTab = location.pathname.startsWith(plannerPath)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md justify-center px-5 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
      <nav className="floating-tab-bar pointer-events-auto flex h-[56px] w-full max-w-[360px] items-stretch px-1.5">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              {active && (
                <motion.div
                  layoutId="ios-tab-pill"
                  className="absolute inset-x-1 top-1.5 bottom-1 rounded-[16px] bg-white/14"
                  style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
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

        <Link
          to={plannerPath}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
        >
          {isPlannerTab && (
            <motion.div
              layoutId="ios-tab-pill"
              className="absolute inset-x-1 top-1.5 bottom-1 rounded-[16px] bg-white/14"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          {isPlanner ? (
            <Crown
              className={`relative z-10 h-5 w-5 ${
                isPlannerTab ? 'text-[#ffd60a]' : 'text-[rgba(235,235,245,0.45)]'
              }`}
              strokeWidth={isPlannerTab ? 2.2 : 1.8}
            />
          ) : (
            <Sparkles
              className={`relative z-10 h-5 w-5 ${
                isPlannerTab ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
              }`}
              strokeWidth={isPlannerTab ? 2.2 : 1.8}
            />
          )}
          <span
            className={`relative z-10 text-[10px] font-medium ${
              isPlannerTab ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
            }`}
          >
            {isPlanner ? 'Club' : 'Planner'}
          </span>
        </Link>
      </nav>
    </div>
  )
}
