import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type UserPreferences = {
  privateAccount: boolean
  showActivity: boolean
  showEventsOnProfile: boolean
  pushNotifications: boolean
  emailDigests: boolean
  eventReminders: boolean
  messageNotifications: boolean
  plannerUpdates: boolean
  friendActivity: boolean
  reduceMotion: boolean
  language: string
  location: string
  appearance: 'dark' | 'light' | 'system'
  receiptEmails: boolean
  email: string
  phone: string
  bio: string
  name: string
  onboardingCompleted: boolean
  preferredCategories: string[]
}

const STORAGE_KEY = 'planner-user-settings'

const defaults: UserPreferences = {
  privateAccount: false,
  showActivity: true,
  showEventsOnProfile: true,
  pushNotifications: true,
  emailDigests: false,
  eventReminders: true,
  messageNotifications: true,
  plannerUpdates: true,
  friendActivity: true,
  reduceMotion: false,
  language: 'English',
  location: 'Los Angeles, CA',
  appearance: 'dark',
  receiptEmails: true,
  email: 'reza@email.com',
  phone: '',
  bio: '',
  name: '',
  onboardingCompleted: false,
  preferredCategories: [],
}

function load(): UserPreferences {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

type UserSettingsContextValue = {
  prefs: UserPreferences
  updatePref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  updatePrefs: (patch: Partial<UserPreferences>) => void
}

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(load)

  const persist = useCallback((next: UserPreferences) => {
    setPrefs(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const updatePref = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      persist({ ...prefs, [key]: value })
    },
    [prefs, persist],
  )

  const updatePrefs = useCallback(
    (patch: Partial<UserPreferences>) => {
      persist({ ...prefs, ...patch })
    },
    [prefs, persist],
  )

  return (
    <UserSettingsContext.Provider value={{ prefs, updatePref, updatePrefs }}>
      {children}
    </UserSettingsContext.Provider>
  )
}

export function useUserSettings() {
  const ctx = useContext(UserSettingsContext)
  if (!ctx) throw new Error('useUserSettings must be used within UserSettingsProvider')
  return ctx
}
