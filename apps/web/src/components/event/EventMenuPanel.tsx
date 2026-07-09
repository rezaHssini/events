import { Link } from 'react-router-dom'
import type { Event } from '../../data/mockData'
import type { EventMenuConfig } from '../../types/menu'
import type { PreorderCart } from '../menu/CheckoutMenuAddons'
import { preorderCartTotal } from '../menu/CheckoutMenuAddons'
import { EventMenuBrowse } from '../menu/EventMenuBrowse'
import { AuthGateBanner } from '../auth/AuthGateBanner'

export function EventMenuPanel({
  menu,
  event,
  isAuthenticated,
  hasTicket,
  cart,
  onCartChange,
  onGetTickets,
}: {
  menu: EventMenuConfig
  event: Event
  isAuthenticated: boolean
  hasTicket: boolean
  cart: PreorderCart
  onCartChange: (cart: PreorderCart) => void
  onGetTickets: () => void
}) {
  const canOrder = isAuthenticated && hasTicket && menu.preorderEnabled
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = preorderCartTotal(menu, cart)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="text-left">
          <h3 className="text-base font-semibold">{menu.menuType} menu</h3>
          <p className="text-xs text-[rgba(235,235,245,0.45)]">
            {menu.preorderEnabled ? 'Pre-order available with ticket' : 'View only'}
          </p>
        </div>
        {isAuthenticated && hasTicket && menu.preorderEnabled && (
          <span className="rounded-full bg-[#30d158]/15 px-3 py-1 text-xs font-medium text-[#30d158]">
            ✓ Ticket holder — can pre-order
          </span>
        )}
        {isAuthenticated && !hasTicket && menu.preorderEnabled && (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-[rgba(235,235,245,0.45)]">
            Signed in · no ticket yet
          </span>
        )}
        {!isAuthenticated && (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-[rgba(235,235,245,0.45)]">
            Browsing as guest
          </span>
        )}
      </div>

      {!isAuthenticated && <AuthGateBanner variant="sign-in" />}
      {isAuthenticated && !hasTicket && menu.preorderEnabled && (
        <AuthGateBanner variant="get-ticket" />
      )}

      <EventMenuBrowse
        menu={menu}
        eventId={event.id}
        canOrder={canOrder}
        cart={cart}
        onCartChange={onCartChange}
        layout="web"
        isAuthenticated={isAuthenticated}
      />

      {canOrder && cartCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            Pre-order · {cartCount} item{cartCount === 1 ? '' : 's'} · ${cartTotal.toFixed(2)}
          </p>
          <Link
            to="/checkout"
            state={{ event, preorderCart: cart }}
            className="rounded-lg bg-[#0a84ff] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#0070e0]"
          >
            Continue to checkout →
          </Link>
        </div>
      )}

      {!isAuthenticated && menu.preorderEnabled && (
        <p className="text-center text-xs text-[rgba(235,235,245,0.4)]">
          <button type="button" onClick={onGetTickets} className="text-[#0a84ff] hover:underline">
            Get tickets
          </button>
          {' '}to unlock menu pre-order
        </p>
      )}
    </div>
  )
}
