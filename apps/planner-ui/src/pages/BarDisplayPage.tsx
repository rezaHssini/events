import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { barQueue } from '../data/mockData'

const columns = [
  { key: 'new' as const, label: 'New', color: 'border-secondary' },
  { key: 'preparing' as const, label: 'Preparing', color: 'border-warning' },
  { key: 'ready' as const, label: 'Ready', color: 'border-success' },
]

export default function BarDisplayPage() {
  const [orders, setOrders] = useState(barQueue)

  const bump = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        if (o.status === 'new') return { ...o, status: 'preparing' as const }
        if (o.status === 'preparing') return { ...o, status: 'ready' as const }
        return o
      }),
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="flex items-center justify-between border-b border-white/10 p-4">
        <Link to="/" className="rounded-full bg-black/50 px-3 py-1.5 text-sm backdrop-blur">
          ← Back
        </Link>
        <div className="text-center">
          <p className="text-sm text-slate-400">Bar / Kitchen Display</p>
          <h1 className="text-lg font-bold">Neon Nights</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-success">{orders.filter((o) => o.status === 'ready').length}</p>
          <p className="text-xs text-slate-400">ready</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 p-4 min-h-[calc(100vh-80px)]">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col">
            <h2 className={`mb-3 border-b-2 pb-2 text-sm font-bold uppercase tracking-wider ${col.color}`}>
              {col.label} ({orders.filter((o) => o.status === col.key).length})
            </h2>
            <div className="flex-1 space-y-3">
              {orders
                .filter((o) => o.status === col.key)
                .map((order) => (
                  <motion.button
                    key={order.id}
                    layout
                    onClick={() => bump(order.id)}
                    className={`w-full rounded-xl p-4 text-left transition-colors ${
                      col.key === 'new'
                        ? 'bg-secondary/10 border border-secondary/30 hover:bg-secondary/20'
                        : col.key === 'preparing'
                          ? 'bg-warning/10 border border-warning/30 hover:bg-warning/20'
                          : 'bg-success/10 border border-success/30 animate-pulse'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-2xl font-bold">#{order.code}</span>
                      <span className="text-xs text-slate-400">{order.time}</span>
                    </div>
                    <p className="mt-1 font-medium">{order.name}</p>
                    <ul className="mt-2 text-sm text-slate-300">
                      {order.items.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-slate-500">Tap to bump →</p>
                  </motion.button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
