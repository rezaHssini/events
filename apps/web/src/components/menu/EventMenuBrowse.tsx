import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import {
  type EventMenuConfig,
  type EventMenuItem,
  itemImages,
  itemsForTab,
  menuTabsWithCounts,
} from '../../types/menu'
import { useMenuReviews } from '../../context/MenuReviewsContext'
import { StarRating } from '../UI'
import { MenuItemDetailSheet } from './MenuItemDetailSheet'
import type { PreorderCart } from './CheckoutMenuAddons'

export function EventMenuBrowse({
  menu,
  eventId,
  canOrder,
  cart,
  onCartChange,
  layout = 'mobile',
  isAuthenticated = false,
}: {
  menu: EventMenuConfig
  eventId: string
  canOrder: boolean
  cart?: PreorderCart
  onCartChange?: (cart: PreorderCart) => void
  layout?: 'mobile' | 'web'
  isAuthenticated?: boolean
}) {
  const { getAverageRating, getReviewCount } = useMenuReviews()
  const [activeTabId, setActiveTabId] = useState(menu.tabs[0]?.id ?? '')
  const [detailItem, setDetailItem] = useState<EventMenuItem | null>(null)

  const activeTab = menu.tabs.find((t) => t.id === activeTabId) ?? menu.tabs[0]
  const tabItems = activeTab ? itemsForTab(menu, activeTab.id) : []

  const setQty = (itemId: string, qty: number) => {
    if (!onCartChange || !cart) return
    const next = { ...cart }
    if (qty <= 0) delete next[itemId]
    else next[itemId] = qty
    onCartChange(next)
  }

  if (!menu.enabled) {
    return (
      <div className="rounded-[18px] liquid-glass-subtle p-6 text-center">
        <p className="font-medium">No menu for this event</p>
        <p className="mt-1 ios-caption">The organizer has not enabled food & drink</p>
      </div>
    )
  }

  return (
    <>
      <div
        className={`mb-4 flex gap-1 overflow-x-auto scrollbar-hide ${
          layout === 'web' ? 'border-b border-white/10 pb-0' : 'gap-1.5'
        }`}
      >
        {menuTabsWithCounts(menu).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`shrink-0 font-semibold transition-colors ${
              layout === 'web'
                ? `border-b-2 px-4 py-2.5 text-sm ${
                    tab.id === activeTab?.id
                      ? 'border-[#0a84ff] text-[#64b5ff]'
                      : 'border-transparent text-[rgba(235,235,245,0.45)] hover:text-white'
                  }`
                : `rounded-full px-3 py-1.5 text-xs ${
                    tab.id === activeTab?.id ? 'bg-[#0a84ff] text-white' : 'bg-white/8 text-white/55'
                  }`
            }`}
          >
            {tab.emoji} {tab.name}
            {layout === 'web' && (
              <span className="ml-1 text-xs opacity-50">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      <div className={layout === 'web' ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'space-y-2'}>
        {tabItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            qty={cart?.[item.id] ?? 0}
            canOrder={canOrder && menu.preorderEnabled}
            avgRating={getAverageRating(eventId, item.id)}
            reviewCount={getReviewCount(eventId, item.id)}
            onOpen={() => setDetailItem(item)}
            onQtyChange={(qty) => setQty(item.id, qty)}
            layout={layout}
          />
        ))}
        {tabItems.length === 0 && (
          <p className="rounded-[16px] liquid-glass-subtle py-8 text-center ios-caption">
            No items in this category
          </p>
        )}
      </div>

      <MenuItemDetailSheet
        item={detailItem}
        eventId={eventId}
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        canOrder={canOrder && menu.preorderEnabled}
        isAuthenticated={isAuthenticated}
        qty={detailItem ? (cart?.[detailItem.id] ?? 0) : 0}
        onQtyChange={
          detailItem && onCartChange
            ? (qty) => setQty(detailItem.id, qty)
            : undefined
        }
      />
    </>
  )
}

function MenuItemCard({
  item,
  qty,
  canOrder,
  avgRating,
  reviewCount,
  onOpen,
  onQtyChange,
  layout = 'mobile',
}: {
  item: EventMenuItem
  qty: number
  canOrder: boolean
  avgRating: number | null
  reviewCount: number
  onOpen: () => void
  onQtyChange: (qty: number) => void
  layout?: 'mobile' | 'web'
}) {
  const images = itemImages(item)
  const thumb = images[0]

  if (layout === 'web') {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]">
        <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left">
          {thumb ? (
            <img src={thumb} alt="" className="aspect-[16/10] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-white/5 text-2xl">
              🍽️
            </div>
          )}
          <div className="flex flex-1 flex-col p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-snug">{item.name}</p>
              <p className="shrink-0 font-bold text-[#64b5ff]">${item.price}</p>
            </div>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-[rgba(235,235,245,0.45)]">{item.description}</p>
            )}
            {avgRating !== null && (
              <div className="mt-2 flex items-center gap-1.5">
                <StarRating rating={avgRating} size="sm" />
                <span className="text-[10px] text-white/35">({reviewCount})</span>
              </div>
            )}
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              {item.popular && (
                <span className="rounded bg-[#ffd60a]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#ffd60a]">
                  Popular
                </span>
              )}
              {item.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] text-[#30d158]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>
        {canOrder && (
          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
            <span className="text-xs text-[rgba(235,235,245,0.45)]">Pre-order</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={qty <= 0}
                onClick={() => onQtyChange(qty - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => onQtyChange(qty + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a84ff]/30 text-[#64b5ff]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full gap-3 rounded-[18px] liquid-glass-subtle p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 gap-3 text-left transition-colors active:opacity-80"
      >
        {thumb ? (
          <img src={thumb} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
            🍽️
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{item.name}</p>
              {item.popular && (
                <span className="text-[10px] font-semibold text-[#ffd60a]">Popular</span>
              )}
            </div>
            <p className="shrink-0 font-bold">${item.price}</p>
          </div>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{item.description}</p>
          )}
          {avgRating !== null && (
            <div className="mt-1 flex items-center gap-1.5">
              <StarRating rating={avgRating} size="sm" />
              <span className="text-[10px] text-white/35">({reviewCount})</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags?.map((tag) => (
              <span key={tag} className="text-[10px] text-[#30d158]">
                {tag}
              </span>
            ))}
            {images.length > 1 && (
              <span className="text-[10px] text-white/35">{images.length} photos</span>
            )}
            {!canOrder && (
              <span className="text-[11px] text-white/35">Tap for details</span>
            )}
          </div>
        </div>
      </button>
      {canOrder && (
        <div className="flex shrink-0 flex-col justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={qty <= 0}
              onClick={() => onQtyChange(qty - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => onQtyChange(qty + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a84ff]/30 text-[#64b5ff]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
