import { useMemo } from 'react'
import { Info } from 'lucide-react'
import {
  type EventMenuConfig,
  includedItemsFromPerks,
} from '../../types/menu'
import { Badge } from '../UI'
import { EventMenuBrowse } from './EventMenuBrowse'

export type PreorderCart = Record<string, number>

export function CheckoutMenuAddons({
  menu,
  eventId,
  ticketPerks,
  cart,
  onCartChange,
}: {
  menu: EventMenuConfig
  eventId: string
  ticketPerks: string[]
  cart: PreorderCart
  onCartChange: (cart: PreorderCart) => void
}) {
  const included = useMemo(() => includedItemsFromPerks(ticketPerks, menu), [ticketPerks, menu])

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.items.find((i) => i.id === id)
    return sum + (item?.price ?? 0) * qty
  }, 0)

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  if (!menu.enabled) {
    return (
      <div className="rounded-[18px] liquid-glass-subtle p-6 text-center">
        <p className="font-medium">No menu for this event</p>
        <p className="mt-1 ios-caption">The organizer has not enabled food & drink ordering</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {included.length > 0 && (
        <section>
          <h3 className="mb-2 ios-headline">Included with your ticket</h3>
          <p className="mb-3 ios-caption">These perks are bundled — no extra charge at checkout</p>
          <div className="space-y-2">
            {included.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-[18px] border border-[#30d158]/25 bg-[#30d158]/10 p-4"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-0.5 text-sm text-white/55">{item.detail}</p>
                </div>
                <div className="shrink-0">
                  <Badge variant="success">Included</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="ios-headline">Event menu</h3>
          {menu.preorderEnabled && cartCount > 0 && (
            <p className="text-sm font-semibold text-[#64b5ff]">
              +${cartTotal.toFixed(2)} · {cartCount} item{cartCount === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {!menu.preorderEnabled && (
          <div className="mb-4 flex gap-3 rounded-[16px] border border-[#ffd60a]/25 bg-[#ffd60a]/10 p-4 text-left">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd60a]" />
            <div>
              <p className="text-sm font-medium">Pre-order is not enabled</p>
              <p className="mt-1 text-sm text-white/55">
                Tap items to browse details. You can order once you arrive at the event.
              </p>
            </div>
          </div>
        )}

        <p className="mb-3 ios-caption">Tap any item for photos, ingredients & reviews</p>

        <EventMenuBrowse
          menu={menu}
          eventId={eventId}
          canOrder={menu.preorderEnabled}
          cart={cart}
          onCartChange={onCartChange}
        />
      </section>
    </div>
  )
}

export function preorderCartTotal(menu: EventMenuConfig, cart: PreorderCart): number {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.items.find((i) => i.id === id)
    return sum + (item?.price ?? 0) * qty
  }, 0)
}
