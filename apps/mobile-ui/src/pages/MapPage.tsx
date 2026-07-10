import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav, Badge } from '../components/UI'
import { events } from '../data/mockData'

const filters = ['Today', 'This weekend', 'Music', 'Free', 'Standing', '21+']

export default function MapPage() {
  const [selected, setSelected] = useState(events[0].id)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold">Map</h1>
        <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((f) => (
            <button
              key={f}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-primary/30 transition-colors"
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex-1 bg-surface-2">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='%231e1e2e'/%3E%3Cpath d='M0 30h60M30 0v60' stroke='%232a2a3d' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Mock map pins */}
        {events.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className="absolute transition-transform hover:scale-125"
            style={{
              left: `${20 + i * 28}%`,
              top: `${30 + (i % 2) * 25}%`,
            }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg ${
                selected === e.id
                  ? 'border-secondary bg-secondary scale-125'
                  : 'border-white bg-primary'
              }`}
            >
              <span className="text-xs font-bold text-white">
                {e.price === 'free' ? 'F' : `$${e.price}`}
              </span>
            </div>
            {selected === e.id && (
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-secondary" />
            )}
          </button>
        ))}
        <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5 text-xs backdrop-blur">
          📍 Los Angeles
        </div>
      </div>

      {selected && (
        <div className="border-t border-white/10 bg-surface p-4">
          {events
            .filter((e) => e.id === selected)
            .map((e) => (
              <Link key={e.id} to="/event" className="flex gap-3 text-left">
                <img src={e.cover} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{e.title}</h3>
                  <p className="text-sm text-slate-400">
                    {e.date} · {e.location}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="primary">{e.category}</Badge>
                    <Badge>{e.format}</Badge>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
      <BottomNav />
    </div>
  )
}
