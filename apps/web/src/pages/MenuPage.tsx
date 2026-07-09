import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mainEvent, type Event } from '../data/mockData'
import { useMenuTemplates } from '../context/MenuTemplatesContext'
import { useTickets } from '../context/TicketsContext'
import { useAuth } from '../context/AuthContext'
import { useLoginGate } from '../context/LoginGateContext'
import { type PreorderCart } from '../components/menu/CheckoutMenuAddons'
import { EventMenuPanel } from '../components/event/EventMenuPanel'
import { WebPageHeader } from '../components/layout/WebLayout'

type MenuPageState = {
  event?: Event
  preorderCart?: PreorderCart
}

export default function MenuPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requireLogin } = useLoginGate()
  const { isAuthenticated } = useAuth()
  const state = location.state as MenuPageState | null
  const event = state?.event ?? mainEvent
  const { getCheckoutMenu } = useMenuTemplates()
  const { tickets } = useTickets()
  const menu = getCheckoutMenu()
  const hasTicket = tickets.some((t) => t.eventId === event.id && t.status === 'upcoming')
  const [cart, setCart] = useState<PreorderCart>(state?.preorderCart ?? {})

  return (
    <div className="pb-10">
      <WebPageHeader
        title="Menu & Pre-order"
        subtitle={event.title}
        actions={
          <Link
            to="/event"
            state={{ eventId: event.id }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← Back to event
          </Link>
        }
      />

      <div className="web-container max-w-5xl">
        <EventMenuPanel
          menu={menu}
          event={event}
          isAuthenticated={isAuthenticated}
          hasTicket={hasTicket}
          cart={cart}
          onCartChange={setCart}
          onGetTickets={() => requireLogin(() => navigate('/checkout', { state: { event } }))}
        />
      </div>
    </div>
  )
}
