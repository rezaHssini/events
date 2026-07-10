import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MobileHeader, Badge } from '../components/UI'
import { perks, menuOrders, mainEvent } from '../data/mockData'

export default function WalletPage() {
  return (
    <div className="min-h-screen pb-8">
      <MobileHeader title="My Tickets" />

      <div className="p-4">
        {/* Ticket card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="overflow-hidden rounded-2xl gradient-hero shadow-2xl shadow-primary/20"
        >
          <div className="p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-80">VIP Ticket</p>
                <p className="text-xl font-bold">{mainEvent.title}</p>
                <p className="mt-1 text-sm opacity-80">
                  {mainEvent.date} · {mainEvent.time}
                </p>
              </div>
              <Badge variant="success">Valid</Badge>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="rounded-2xl bg-white p-4">
                <div className="flex h-36 w-36 items-center justify-center bg-[repeating-linear-gradient(45deg,#000_0,#000_2px,transparent_2px,transparent_8px)]">
                  <div className="h-24 w-24 rounded-lg bg-white border-4 border-black" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs opacity-70">Tap to brighten · Show at entry</p>
          </div>
        </motion.div>

        {/* Included perks */}
        <h3 className="mt-8 text-left font-semibold">Included Perks</h3>
        <div className="mt-3 space-y-2">
          {perks.map((perk) => (
            <motion.div
              key={perk.id}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 rounded-xl glass p-4 text-left"
            >
              <span className="text-3xl">{perk.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{perk.name}</p>
                <p className="text-xs text-slate-400">{perk.expiresAt}</p>
              </div>
              <div className="text-right">
                {perk.used < perk.total ? (
                  <>
                    <p className="font-bold text-success">
                      {perk.total - perk.used} left
                    </p>
                    <button className="mt-1 text-xs text-primary-light">Redeem →</button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Used</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pre-orders */}
        <h3 className="mt-8 text-left font-semibold">Pre-orders</h3>
        {menuOrders.map((order) => (
          <div
            key={order.id}
            className={`mt-3 rounded-xl p-4 text-left ${
              order.status === 'ready'
                ? 'border border-success/50 bg-success/10'
                : 'glass'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">Pickup code: {order.code}</p>
              <Badge variant={order.status === 'ready' ? 'success' : 'warning'}>
                {order.status === 'ready' ? '🔔 Ready!' : order.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {order.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
            </p>
            <p className="mt-1 text-sm font-medium">${order.total}</p>
          </div>
        ))}

        <div className="mt-6 flex gap-3">
          <button className="flex-1 rounded-xl glass py-3 text-sm font-medium">
            Add to Wallet
          </button>
          <Link to="/memory" className="flex-1 rounded-xl bg-primary/20 py-3 text-center text-sm font-medium text-primary-light">
            Post Memory
          </Link>
        </div>
      </div>
    </div>
  )
}
