import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { perks, menuOrders } from '../data/mockData'
import { useToast } from '../context/ToastContext'
import { BottomSheet } from '../components/ui/BottomSheet'

type ScanResult = 'idle' | 'valid' | 'already' | 'invalid'

const searchableGuests = [
  { id: 'g1', name: 'Jane Doe', email: 'jane@email.com', orderId: '1842', ticket: 'VIP' },
  { id: 'g2', name: 'Alex Kim', email: 'alex@email.com', orderId: '1843', ticket: 'GA' },
  { id: 'g3', name: 'Sarah Chen', email: 'sarah@email.com', orderId: '1844', ticket: 'VIP' },
]

export default function ScannerPage() {
  const { toast } = useToast()
  const [result, setResult] = useState<ScanResult>('idle')
  const [showPerks, setShowPerks] = useState(false)
  const [redeemedPerks, setRedeemedPerks] = useState<Set<string>>(new Set())
  const [pickedUpOrders, setPickedUpOrders] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const simulateScan = (type: ScanResult) => {
    setResult(type)
    if (type === 'valid') setShowPerks(true)
    else setShowPerks(false)
  }

  const redeemPerk = (id: string, name: string) => {
    setRedeemedPerks((prev) => new Set(prev).add(id))
    toast(`✓ Redeemed: ${name}`)
  }

  const markPickedUp = (id: string, code: string) => {
    setPickedUpOrders((prev) => new Set(prev).add(id))
    toast(`✓ Order #${code} marked picked up`)
  }

  const searchResults = searchableGuests.filter(
    (g) =>
      search.trim().length > 0 &&
      (g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase()) ||
        g.orderId.includes(search)),
  )

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 p-4 text-center relative">
        <Link to="/planner" className="absolute left-4 top-4 rounded-full bg-black/50 p-2 backdrop-blur text-sm">
          ←
        </Link>
        <p className="text-sm text-slate-400">Staff Scanner</p>
        <h1 className="font-bold">Neon Nights · Door 1</h1>
        <p className="text-xs text-success mt-1">● 487 checked in</p>
      </header>

      <div className="relative mx-4 mt-4 aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-48 w-48">
            <div className="absolute inset-0 border-2 border-white/50 rounded-2xl" />
            <motion.div
              animate={{ y: [0, 180, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute left-2 right-2 h-0.5 bg-secondary shadow-lg shadow-secondary/50"
            />
          </div>
        </div>
        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-slate-400">
          Point at QR code
        </p>
      </div>

      <div className="p-4">
        <p className="text-center text-xs text-slate-500 mb-3">Demo: simulate scan</p>
        <div className="flex gap-2">
          {(
            [
              ['valid', '✅ Valid', 'bg-success/20'],
              ['already', '⚠️ Used', 'bg-warning/20'],
              ['invalid', '❌ Invalid', 'bg-danger/20'],
            ] as const
          ).map(([type, label, bg]) => (
            <button
              key={type}
              type="button"
              onClick={() => simulateScan(type)}
              className={`flex-1 rounded-xl py-3 text-sm font-medium ${bg}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {result !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mx-4 rounded-2xl p-5 text-center ${
              result === 'valid'
                ? 'bg-success/20 border border-success/50'
                : result === 'already'
                  ? 'bg-warning/20 border border-warning/50'
                  : 'bg-danger/20 border border-danger/50'
            }`}
          >
            {result === 'valid' && (
              <>
                <p className="text-2xl">✅</p>
                <p className="mt-2 text-xl font-bold">Jane Doe</p>
                <p className="text-slate-300">VIP · Order #1842</p>
              </>
            )}
            {result === 'already' && (
              <>
                <p className="text-2xl">⚠️</p>
                <p className="mt-2 font-bold">Already checked in</p>
                <p className="text-sm text-slate-400">First scan: 9:14 PM</p>
              </>
            )}
            {result === 'invalid' && (
              <>
                <p className="text-2xl">❌</p>
                <p className="mt-2 font-bold">Invalid ticket</p>
                <p className="text-sm text-slate-400">Refunded or wrong event</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showPerks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mt-4 rounded-2xl glass p-4 text-left"
        >
          <p className="font-semibold mb-3">Included Perks</p>
          {perks.map((p) => {
            const redeemed = redeemedPerks.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                disabled={redeemed}
                onClick={() => redeemPerk(p.id, p.name)}
                className="mb-2 flex w-full items-center justify-between rounded-xl bg-white/5 p-3 transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                <span>
                  {p.icon} {p.name}
                </span>
                <span className={`text-sm ${redeemed ? 'text-slate-500' : 'text-success'}`}>
                  {redeemed ? 'Redeemed ✓' : `${p.total - p.used} left → Redeem`}
                </span>
              </button>
            )
          })}

          <p className="font-semibold mt-4 mb-2">Pre-orders</p>
          {menuOrders.map((o) => {
            const picked = pickedUpOrders.has(o.id)
            return (
              <button
                key={o.id}
                type="button"
                disabled={picked}
                onClick={() => markPickedUp(o.id, o.code)}
                className="mb-2 flex w-full items-center justify-between rounded-xl bg-success/10 border border-success/30 p-3 disabled:opacity-50"
              >
                <span>#{o.code}: {o.items.map((i) => i.name).join(', ')}</span>
                <span className={`font-medium ${picked ? 'text-slate-500' : 'text-success'}`}>
                  {picked ? 'Picked up ✓' : 'Mark picked up'}
                </span>
              </button>
            )
          })}
        </motion.div>
      )}

      <div className="p-4 mt-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSearchOpen(e.target.value.trim().length > 0)
          }}
          placeholder="Search name, email, order ID..."
          className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none"
        />
      </div>

      <BottomSheet open={searchOpen && searchResults.length > 0} onClose={() => setSearchOpen(false)} title="Search results">
        {searchResults.map((guest) => (
          <button
            key={guest.id}
            type="button"
            onClick={() => {
              setResult('valid')
              setShowPerks(true)
              setSearchOpen(false)
              toast(`Found ${guest.name} · ${guest.ticket}`)
            }}
            className="mb-2 w-full rounded-[14px] bg-white/8 p-4 text-left"
          >
            <p className="font-medium">{guest.name}</p>
            <p className="ios-caption">{guest.ticket} · Order #{guest.orderId}</p>
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
