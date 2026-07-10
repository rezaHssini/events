import { useState } from 'react'
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  type EventMenuItem,
  itemImages,
} from '../../types/menu'
import { useMenuReviews } from '../../context/MenuReviewsContext'
import { BottomSheet } from '../ui/BottomSheet'
import { StarRating } from '../UI'

export function MenuItemDetailSheet({
  item,
  eventId,
  open,
  onClose,
  canOrder,
  qty = 0,
  onQtyChange,
}: {
  item: EventMenuItem | null
  eventId: string
  open: boolean
  onClose: () => void
  canOrder: boolean
  qty?: number
  onQtyChange?: (qty: number) => void
}) {
  const { getReviews, getAverageRating, getReviewCount, hasUserReviewed, addReview } =
    useMenuReviews()
  const [imageIndex, setImageIndex] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  if (!item) return null

  const images = itemImages(item)
  const reviews = getReviews(eventId, item.id)
  const avg = getAverageRating(eventId, item.id)
  const reviewCount = getReviewCount(eventId, item.id)
  const userReviewed = hasUserReviewed(eventId, item.id)

  const handleSubmitReview = () => {
    if (!comment.trim()) return
    addReview(eventId, item.id, rating, comment)
    setComment('')
    setShowReviewForm(false)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={item.name}>
      <div className="space-y-5 text-left">
        {images.length > 0 && (
          <div className="relative overflow-hidden rounded-[18px]">
            <img
              src={images[imageIndex]}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
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
                      className={`h-1.5 w-1.5 rounded-full ${
                        i === imageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            {item.popular && (
              <span className="text-[10px] font-semibold text-[#ffd60a]">Popular</span>
            )}
            <p className="text-2xl font-bold">${item.price}</p>
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => onQtyChange(qty + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a84ff]/30 text-[#64b5ff]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-white/70">{item.description}</p>
        )}

        {item.longDescription && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
              About
            </h4>
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
                <span
                  key={ing}
                  className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/60"
                >
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
          {item.ageRestricted && (
            <span className="text-xs text-[#ffd60a]">21+</span>
          )}
        </div>

        {!canOrder && (
          <p className="rounded-[14px] bg-white/6 px-3 py-2 text-center text-xs text-white/45">
            {item.ageRestricted ? '21+ · ' : ''}View-only — get a ticket to pre-order
          </p>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Reviews</h4>
            {!userReviewed && (
              <button
                type="button"
                onClick={() => setShowReviewForm((v) => !v)}
                className="text-sm font-medium text-[#0a84ff]"
              >
                {showReviewForm ? 'Cancel' : 'Rate & review'}
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-4 space-y-3 rounded-[16px] liquid-glass-subtle p-4">
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
                className="w-full rounded-[14px] bg-white/8 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={!comment.trim()}
                className="ios-button w-full py-2.5 text-sm disabled:opacity-40"
              >
                Post review
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-white/35">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-[16px] liquid-glass-subtle p-3">
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
      </div>
    </BottomSheet>
  )
}
