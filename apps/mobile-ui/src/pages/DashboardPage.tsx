import { Link } from 'react-router-dom'
import { mainEvent, draftEvents } from '../data/mockData'
import { Badge } from '../components/UI'

const stats = [
  { label: 'Page views', value: '12.4k', change: '+18%' },
  { label: 'Tickets sold', value: '612', change: '+24%' },
  { label: 'F&B revenue', value: '$4.2k', change: '+31%' },
  { label: 'Avg rating', value: '4.8★', change: '+0.2' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 p-4 text-left">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Creator Dashboard</p>
            <h1 className="text-xl font-bold">Neon Collective</h1>
            <Link to="/creator" className="text-sm text-primary-light">
              View public page →
            </Link>
          </div>
          <Link
            to="/create-event"
            className="rounded-xl gradient-hero px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
          >
            + Create Event
          </Link>
        </div>
      </header>

      <div className="p-4 text-left">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-medium">🔴 Live: {mainEvent.title}</p>
          <p className="text-2xl font-bold mt-1">612 / 800 sold</p>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div className="h-full w-[76%] rounded-full gradient-hero" />
          </div>
        </div>

        <h2 className="mt-6 font-semibold">Drafts & scheduled</h2>
        <div className="mt-3 space-y-2">
          {draftEvents.map((d) => (
            <Link
              key={d.id}
              to="/create-event"
              className="flex items-center gap-3 rounded-xl glass p-3 card-hover"
            >
              {d.cover ? (
                <img src={d.cover} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-2xl">
                  📝
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{d.title}</p>
                <p className="text-xs text-slate-400">Edited {d.lastEdited}</p>
                <div className="mt-1.5 h-1.5 w-full max-w-[120px] rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{ width: `${d.completion}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <Badge variant={d.scheduledPublish ? 'primary' : 'warning'}>
                  {d.scheduledPublish ? 'Scheduled' : 'Draft'}
                </Badge>
                {d.scheduledPublish && (
                  <p className="mt-1 text-[10px] text-slate-500">{d.scheduledPublish}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl glass p-4">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
              <p className="text-xs text-success">{s.change}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Quick actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { icon: '✏️', label: 'Edit event', to: '/create-event' },
            { icon: '🍹', label: 'Manage menu', to: '/create-event' },
            { icon: '🎟️', label: 'Ticket types', to: '/create-event' },
            { icon: '📊', label: 'Analytics', to: '/dashboard' },
            { icon: '👥', label: 'Attendees', to: '/dashboard' },
            { icon: '⭐', label: 'Perks setup', to: '/create-event' },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-2 rounded-xl glass p-3 text-sm hover:bg-white/10 transition-colors"
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Recent activity</h2>
        <div className="mt-3 space-y-2">
          {[
            { text: '12 tickets sold in last hour', time: '5m ago' },
            { text: 'Sarah K. posted a 5★ memory', time: '1h ago' },
            { text: '34 pre-orders for bar menu', time: '2h ago' },
            { text: 'Draft "Autumn Warehouse" scheduled for Jul 12', time: '2h ago' },
          ].map((a, i) => (
            <div key={i} className="flex justify-between rounded-xl glass p-3 text-sm">
              <span>{a.text}</span>
              <span className="text-slate-500">{a.time}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Published events</h2>
        <div className="mt-3 rounded-xl glass p-4 flex gap-3">
          <img src={mainEvent.cover} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <div>
            <p className="font-medium">{mainEvent.title}</p>
            <p className="text-sm text-slate-400">{mainEvent.date}</p>
            <p className="text-sm text-success mt-1">Published · 76% sold</p>
          </div>
        </div>
      </div>
    </div>
  )
}
