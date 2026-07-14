import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileHeader } from '../components/UI'
import { mainEvent, type Event } from '../data/mockData'
import { useMenuTemplates } from '../context/MenuTemplatesContext'
import { useTickets } from '../context/TicketsContext'
import { EventMenuBrowse } from '../components/menu/EventMenuBrowse'
import { preorderCartTotal, type PreorderCart } from '../components/menu/CheckoutMenuAddons'

type MenuPageState = {
  event?: Event
  preorderCart?: PreorderCart
}

export default function MenuPage() {
  const location = useLocation()
  const state = location.state as MenuPageState | null
  const event = state?.event ?? mainEvent
  const { getCheckoutMenu } = useMenuTemplates()
  const { tickets } = useTickets()
  const menu = getCheckoutMenu()
  const hasTicket = tickets.some((t) => t.eventId === event.id && t.status === 'upcoming')

  const [cart, setCart] = useState<PreorderCart>(state?.preorderCart ?? {})

  const cartTotal = preorderCartTotal(menu, cart)
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen pb-32">
      <MobileHeader title="Menu & Pre-order" back="/event" />

      <div className="p-4 text-left">
        <p className="text-sm text-slate-400">{event.title}</p>
        <p className="text-xs text-slate-500">
          {menu.preorderEnabled && hasTicket
            ? 'Pickup slots: 8:00–8:30 PM · 9:00–9:30 PM'
            : 'Tap items for photos, ingredients & community reviews'}
        </p>

        <div className="mt-4">
          <EventMenuBrowse
            menu={menu}
            eventId={event.id}
            canOrder={hasTicket && menu.preorderEnabled}
            cart={cart}
            onCartChange={setCart}
          />
        </div>
      </div>

      <AnimatePresence>
        {cartCount > 0 && hasTicket && menu.preorderEnabled && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-white/10 bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {cartCount} items · ${cartTotal.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">Add to ticket checkout</p>
              </div>
              <Link
                to="/checkout"
                state={{ event, preorderCart: cart }}
                className="rounded-xl bg-primary px-6 py-3 font-bold"
              >
                Checkout
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
