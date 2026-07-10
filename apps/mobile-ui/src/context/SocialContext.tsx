/* @refresh reset */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { userProfiles, type UserProfile } from '../data/socialData'

interface SocialContextValue {
  followingIds: Set<string>
  pendingRequestIds: Set<string>
  isFollowing: (userId: string) => boolean
  isRequestPending: (userId: string) => boolean
  canViewProfile: (profile: UserProfile, isOwn: boolean) => boolean
  follow: (userId: string) => void
  unfollow: (userId: string) => void
  requestFollow: (userId: string) => void
  cancelRequest: (userId: string) => void
  toggleFollow: (userId: string) => void
  getProfile: (handle: string) => UserProfile | undefined
  isPrivateAccount: (userId: string) => boolean
}

const SocialContext = createContext<SocialContextValue | null>(null)

const INITIAL_FOLLOWING = ['1', '2', '3', '4', '5', '7', '8']
const SETTINGS_KEY = 'event-user-settings'

function hasCompletedOnboarding(): boolean {
  try {
    const raw = sessionStorage.getItem(SETTINGS_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { onboardingCompleted?: boolean }
    if (parsed.onboardingCompleted === undefined) return true
    return parsed.onboardingCompleted === true
  } catch {
    return false
  }
}

function getProfileById(userId: string) {
  return userProfiles.find((p) => p.id === userId)
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(() =>
    new Set(hasCompletedOnboarding() ? INITIAL_FOLLOWING : []),
  )
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(new Set())

  const isPrivateAccount = useCallback((userId: string) => {
    return getProfileById(userId)?.isPrivate === true
  }, [])

  const isFollowing = useCallback(
    (userId: string) => followingIds.has(userId),
    [followingIds],
  )

  const isRequestPending = useCallback(
    (userId: string) => pendingRequestIds.has(userId),
    [pendingRequestIds],
  )

  const canViewProfile = useCallback(
    (profile: UserProfile, isOwn: boolean) => {
      if (isOwn) return true
      if (!profile.isPrivate) return true
      return followingIds.has(profile.id)
    },
    [followingIds],
  )

  const follow = useCallback((userId: string) => {
    setFollowingIds((prev) => new Set([...prev, userId]))
    setPendingRequestIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  }, [])

  const unfollow = useCallback((userId: string) => {
    setFollowingIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  }, [])

  const requestFollow = useCallback((userId: string) => {
    if (isPrivateAccount(userId)) {
      setPendingRequestIds((prev) => new Set([...prev, userId]))
      // Demo: auto-accept after 2.5s
      setTimeout(() => {
        setPendingRequestIds((prev) => {
          if (!prev.has(userId)) return prev
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
        setFollowingIds((prev) => new Set([...prev, userId]))
      }, 2500)
    } else {
      follow(userId)
    }
  }, [isPrivateAccount, follow])

  const cancelRequest = useCallback((userId: string) => {
    setPendingRequestIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  }, [])

  const toggleFollow = useCallback(
    (userId: string) => {
      if (followingIds.has(userId)) {
        unfollow(userId)
      } else if (pendingRequestIds.has(userId)) {
        cancelRequest(userId)
      } else {
        requestFollow(userId)
      }
    },
    [followingIds, pendingRequestIds, unfollow, cancelRequest, requestFollow],
  )

  const getProfile = useCallback(
    (handle: string) => userProfiles.find((p) => p.handle === handle),
    [],
  )

  return (
    <SocialContext.Provider
      value={{
        followingIds,
        pendingRequestIds,
        isFollowing,
        isRequestPending,
        canViewProfile,
        follow,
        unfollow,
        requestFollow,
        cancelRequest,
        toggleFollow,
        getProfile,
        isPrivateAccount,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error('useSocial must be used within SocialProvider')
  return ctx
}
