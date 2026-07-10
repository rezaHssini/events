import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  defaultClubProfile,
  slugifyClubName,
  type PlannerManagedEvent,
  plannerManagedEvents,
} from '../data/plannerData'

export type StaffRole = 'security' | 'bar'

export interface ClubProfile {
  name: string
  handle: string
  bio: string
  banner?: string
  avatar?: string
  website?: string
  categories: string[]
  cities: string[]
}

interface PlannerContextValue {
  isPlanner: boolean
  clubProfile: ClubProfile | null
  managedEvents: PlannerManagedEvent[]
  becomePlanner: (profile: Omit<ClubProfile, 'handle'>) => void
  updateClubProfile: (updates: Partial<ClubProfile>) => void
  addManagedEvent: (event: Omit<PlannerManagedEvent, 'id' | 'sold' | 'revenue' | 'staff'> & { id?: string }) => string
  assignedStaffRoles: StaffRole[]
  toggleAssignedRole: (role: StaffRole) => void
  toggleEventStaff: (eventId: string, role: StaffRole, memberId: string, memberName: string, avatar: string) => void
}

const PlannerContext = createContext<PlannerContextValue | null>(null)

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [isPlanner, setIsPlanner] = useState(false)
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null)
  const [managedEvents, setManagedEvents] = useState(plannerManagedEvents)
  const [assignedStaffRoles, setAssignedStaffRoles] = useState<StaffRole[]>([])

  const becomePlanner = useCallback((profile: Omit<ClubProfile, 'handle'>) => {
    const handle = slugifyClubName(profile.name) || 'myclub'
    setClubProfile({
      ...profile,
      handle,
      categories: profile.categories.length > 0 ? profile.categories : ['Music', 'Nightlife'],
      cities: profile.cities.length > 0 ? profile.cities : ['Los Angeles'],
    })
    setIsPlanner(true)
  }, [])

  const updateClubProfile = useCallback((updates: Partial<ClubProfile>) => {
    setClubProfile((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      if (updates.name && !updates.handle) {
        next.handle = slugifyClubName(updates.name)
      }
      return next
    })
  }, [])

  const addManagedEvent = useCallback(
    (
      event: Omit<PlannerManagedEvent, 'id' | 'sold' | 'revenue' | 'staff'> & { id?: string },
    ) => {
      const id = event.id ?? `evt-${Date.now()}`
      const newEvent: PlannerManagedEvent = {
        ...event,
        id,
        sold: 0,
        revenue: 0,
        staff: { security: [], bar: [] },
      }
      setManagedEvents((prev) => [newEvent, ...prev])
      return id
    },
    [],
  )

  const toggleAssignedRole = useCallback((role: StaffRole) => {
    setAssignedStaffRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }, [])

  const toggleEventStaff = useCallback(
    (eventId: string, role: StaffRole, memberId: string, memberName: string, avatar: string) => {
      setManagedEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event
          const list = event.staff[role]
          const exists = list.some((m) => m.id === memberId)
          return {
            ...event,
            staff: {
              ...event.staff,
              [role]: exists
                ? list.filter((m) => m.id !== memberId)
                : [...list, { id: memberId, name: memberName, avatar }],
            },
          }
        }),
      )
    },
    [],
  )

  return (
    <PlannerContext.Provider
      value={{
        isPlanner,
        clubProfile,
        managedEvents,
        becomePlanner,
        updateClubProfile,
        addManagedEvent,
        assignedStaffRoles,
        toggleAssignedRole,
        toggleEventStaff,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}

export function useClubProfile() {
  const { clubProfile, isPlanner } = usePlanner()
  if (!isPlanner || !clubProfile) return defaultClubProfile
  return {
    ...defaultClubProfile,
    name: clubProfile.name,
    handle: clubProfile.handle,
    bio: clubProfile.bio,
    banner: clubProfile.banner ?? defaultClubProfile.banner,
    avatar: clubProfile.avatar ?? defaultClubProfile.avatar,
    website: clubProfile.website ?? defaultClubProfile.website,
    categories: clubProfile.categories,
    cities: clubProfile.cities,
  }
}
