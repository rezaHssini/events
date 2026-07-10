import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Map,
  Ticket,
  LayoutDashboard,
  ScanLine,
  ChefHat,
  Sparkles,
  Zap,
  PlusCircle,
  MessageCircle,
  Users,
  UserCircle,
  User,
} from 'lucide-react'

const attendeeLinks = [
  { to: '/feed', label: 'Feed', icon: Home },
  { to: '/find-people', label: 'Find People', icon: Users },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'My Profile', icon: UserCircle },
  { to: '/event', label: 'Event Detail', icon: Sparkles },
  { to: '/menu', label: 'Menu & Pre-order', icon: ChefHat },
  { to: '/checkout', label: 'Checkout', icon: Ticket },
  { to: '/wallet', label: 'Ticket Wallet', icon: Ticket },
  { to: '/memory', label: 'Post Memory', icon: Zap },
  { to: '/creator', label: 'Creator Page', icon: User },
]

const staffLinks = [
  { to: '/scanner', label: 'Scanner', icon: ScanLine },
  { to: '/bar', label: 'Bar Display', icon: ChefHat },
]

const creatorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/create-event', label: 'Create Event', icon: PlusCircle },
]

export function DemoShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const fullWidth = ['/bar', '/dashboard', '/create-event'].some((p) =>
    location.pathname.startsWith(p),
  )

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-surface">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Event</h1>
              <p className="text-xs text-slate-400">Interactive Demo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <Section title="Attendee" links={attendeeLinks} />
          <Section title="Creator" links={creatorLinks} />
          <Section title="Staff" links={staffLinks} />
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-slate-500">
            Mock prototype — all data is simulated. Navigate screens via sidebar.
          </p>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div
          className={`mx-auto min-h-screen border-x border-white/5 bg-[#0a0a0f] shadow-2xl shadow-black/50 ${
            fullWidth ? 'max-w-5xl' : 'max-w-lg'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

function Section({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <ul className="space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary-light font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
