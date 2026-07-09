import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { type MenuItemReview, averageRating } from '../types/menu'
import { INITIAL_MENU_REVIEWS } from '../data/menuReviewsData'
import { media } from '../data/media'

const STORAGE_KEY = 'menu-item-reviews'

function readReviews(): MenuItemReview[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const saved = raw ? (JSON.parse(raw) as MenuItemReview[]) : []
    return [...INITIAL_MENU_REVIEWS, ...saved]
  } catch {
    return INITIAL_MENU_REVIEWS
  }
}

type MenuReviewsContextValue = {
  getReviews: (eventId: string, itemId: string) => MenuItemReview[]
  getAverageRating: (eventId: string, itemId: string) => number | null
  getReviewCount: (eventId: string, itemId: string) => number
  hasUserReviewed: (eventId: string, itemId: string) => boolean
  addReview: (eventId: string, itemId: string, rating: number, body: string) => void
}

const MenuReviewsContext = createContext<MenuReviewsContextValue | null>(null)

export function MenuReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<MenuItemReview[]>(readReviews)

  const persist = (next: MenuItemReview[]) => {
    setReviews(next)
    const custom = next.filter((r) => !INITIAL_MENU_REVIEWS.some((i) => i.id === r.id))
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
  }

  const getReviews = useCallback(
    (eventId: string, itemId: string) =>
      reviews.filter((r) => r.eventId === eventId && r.itemId === itemId),
    [reviews],
  )

  const getAverageRating = useCallback(
    (eventId: string, itemId: string) => averageRating(getReviews(eventId, itemId)),
    [getReviews],
  )

  const getReviewCount = useCallback(
    (eventId: string, itemId: string) => getReviews(eventId, itemId).length,
    [getReviews],
  )

  const hasUserReviewed = useCallback(
    (eventId: string, itemId: string) =>
      reviews.some((r) => r.eventId === eventId && r.itemId === itemId && r.user.id === 'me'),
    [reviews],
  )

  const addReview = useCallback(
    (eventId: string, itemId: string, rating: number, body: string) => {
      const review: MenuItemReview = {
        id: `mr-${Date.now()}`,
        itemId,
        eventId,
        user: { id: 'me', name: 'You', avatar: media.avatarReza },
        rating,
        body: body.trim(),
        time: 'Just now',
      }
      persist([review, ...reviews])
    },
    [reviews],
  )

  const value = useMemo(
    () => ({
      getReviews,
      getAverageRating,
      getReviewCount,
      hasUserReviewed,
      addReview,
    }),
    [getReviews, getAverageRating, getReviewCount, hasUserReviewed, addReview],
  )

  return <MenuReviewsContext.Provider value={value}>{children}</MenuReviewsContext.Provider>
}

export function useMenuReviews() {
  const ctx = useContext(MenuReviewsContext)
  if (!ctx) throw new Error('useMenuReviews must be used within MenuReviewsProvider')
  return ctx
}
