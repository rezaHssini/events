import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { type EventMenuItem, itemImages } from '../../types/menu'
import { useMenuReviews } from '../../context/MenuReviewsContext'
import { ResponsiveDialog } from '../ui/ResponsiveDialog'
import { StarRating } from '../UI'
import { useMediaQuery } from '../../hooks/useMediaQuery'

function MenuItemDetailContent({
  item,
  eventId,
  canOrder,
  isAuthenticated,
  qty,
  onQtyChange,
  layout,
}: {
  item: EventMenuItem
  eventId: string
  canOrder: boolean
  isAuthenticated: boolean
  qty: number
  onQtyChange?: (qty: number) => void
  layout: 'mobile' | 'desktop'
}) {
  const { getReviews, getAverageRating, getReviewCount, hasUserReviewed, addReview } =
    useMenuReviews()
  const [imageIndex, setImageIndex] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const images = itemImages(item)
  const reviews = getReviews(eventId, item.id)
  const avg = getAverageRating(eventId, item.id)
  const reviewCount = getReviewCount(eventId, item.id)
  const userReviewed = hasUserReviewed(eventId, item.id)

  const handleSubmitReview = () => {
    if (!comment.trim() || !isAuthenticated) return
    addReview(eventId, item.id, rating, comment)
    setComment('')
    setShowReviewForm(false)
  }

  const imageBlock = images.length > 0 && (
    <div className="relative overflow-hidden rounded-xl">
      <img src={images[imageIndex]} alt="" className="aspect-[16/10] w-full object-cover" />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setImageIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )

  const headerBlock = (
    <div className="flex items-start justify-between gap-3">
      <div>
        {item.popular && (
          <span className="text-[10px] font-semibold text-[#ffd60a]">Popular</span>
        )}
        {layout === 'mobile' && <h3 className="text-lg font-bold">{item.name}</h3>}
        <p className="text-xl font-bold text-[#64b5ff]">${item.price}</p>
        {avg !== null && (
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={avg} size="sm" />
            <span className="text-xs text-white/45">
              {avg} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
      {canOrder && onQtyChange && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={qty <= 0}
            onClick={() => onQtyChange(qty - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => onQtyChange(qty + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a84ff]/30 text-[#64b5ff]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  const detailsBlock = (
    <>
      {item.description && <p className="text-sm text-white/70">{item.description}</p>}

      {item.longDescription && (
        <section>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">About</h4>
          <p className="text-sm leading-relaxed text-white/65">{item.longDescription}</p>
        </section>
      )}

      {item.ingredients && item.ingredients.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            Ingredients
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {item.ingredients.map((ing) => (
              <span key={ing} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/60">
                {ing}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {item.tags?.map((tag) => (
          <span key={tag} className="text-xs text-[#30d158]">
            {tag}
          </span>
        ))}
        {item.ageRestricted && <span className="text-xs text-[#ffd60a]">21+</span>}
      </div>

      {!canOrder && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-white/45">
          {isAuthenticated
            ? `${item.ageRestricted ? '21+ · ' : ''}Get a ticket to pre-order this item`
            : `${item.ageRestricted ? '21+ · ' : ''}Sign in and get a ticket to pre-order`}
        </p>
      )}
    </>
  )

  const reviewsBlock = (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold">Reviews</h4>
        {isAuthenticated && !userReviewed && (
          <button
            type="button"
            onClick={() => setShowReviewForm((v) => !v)}
            className="text-sm font-medium text-[#0a84ff]"
          >
            {showReviewForm ? 'Cancel' : 'Rate & review'}
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <p className="mb-3 rounded-lg border border-[#0a84ff]/20 bg-[#0a84ff]/10 px-3 py-2 text-xs text-[rgba(235,235,245,0.55)]">
          <Link to="/auth" className="font-medium text-[#0a84ff] hover:underline">
            Sign in
          </Link>{' '}
          to rate menu items after your visit.
        </p>
      )}

      {showReviewForm && isAuthenticated && (
        <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-xl ${n <= rating ? 'text-[#ffd60a]' : 'text-white/20'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={!comment.trim()}
            className="w-full rounded-lg bg-[#0a84ff] py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Post review
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/35">No reviews yet</p>
      ) : (
        <div className={`grid gap-3 ${layout === 'desktop' ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2">
                <img src={review.user.avatar} alt="" className="h-8 w-8 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{review.user.name}</p>
                  <p className="text-[10px] text-white/35">{review.time}</p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="mt-2 text-sm text-white/65">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  if (layout === 'desktop') {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 text-left">
        <div className="space-y-4">{imageBlock}</div>
        <div className="space-y-5">
          {headerBlock}
          {detailsBlock}
          {reviewsBlock}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 text-left">
      {imageBlock}
      {headerBlock}
      {detailsBlock}
      {reviewsBlock}
    </div>
  )
}

export function MenuItemDetailSheet({
  item,
  eventId,
  open,
  onClose,
  canOrder,
  isAuthenticated = false,
  qty = 0,
  onQtyChange,
}: {
  item: EventMenuItem | null
  eventId: string
  open: boolean
  onClose: () => void
  canOrder: boolean
  isAuthenticated?: boolean
  qty?: number
  onQtyChange?: (qty: number) => void
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (!item) return null

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={item.name}
      maxWidthClass="max-w-4xl"
    >
      <MenuItemDetailContent
        item={item}
        eventId={eventId}
        canOrder={canOrder}
        isAuthenticated={isAuthenticated}
        qty={qty}
        onQtyChange={onQtyChange}
        layout={isDesktop ? 'desktop' : 'mobile'}
      />
    </ResponsiveDialog>
  )
}
