import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { events } from '../data/mockData'

const STORAGE_KEY = 'event-saved-events'
const DEFAULT_SAVED = ['2', '4']

function readSavedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set(DEFAULT_SAVED)
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed.length > 0 ? parsed : DEFAULT_SAVED)
  } catch {
    return new Set(DEFAULT_SAVED)
  }
}

function persistSavedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

type SavedEventsContextValue = {
  savedIds: Set<string>
  isSaved: (eventId: string) => boolean
  save: (eventId: string) => void
  unsave: (eventId: string) => void
  toggleSave: (eventId: string) => boolean
  getSavedEvents: () => typeof events
}

const SavedEventsContext = createContext<SavedEventsContextValue | null>(null)

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(readSavedIds)

  const update = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setSavedIds((prev) => {
      const next = updater(prev)
      persistSavedIds(next)
      return next
    })
  }, [])

  const isSaved = useCallback((eventId: string) => savedIds.has(eventId), [savedIds])

  const save = useCallback(
    (eventId: string) => {
      update((prev) => new Set([...prev, eventId]))
    },
    [update],
  )

  const unsave = useCallback(
    (eventId: string) => {
      update((prev) => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    },
    [update],
  )

  const toggleSave = useCallback(
    (eventId: string) => {
      const wasSaved = savedIds.has(eventId)
      update((prev) => {
        const next = new Set(prev)
        if (wasSaved) next.delete(eventId)
        else next.add(eventId)
        return next
      })
      return !wasSaved
    },
    [savedIds, update],
  )

  const getSavedEvents = useCallback(
    () => events.filter((e) => savedIds.has(e.id)),
    [savedIds],
  )

  return (
    <SavedEventsContext.Provider
      value={{ savedIds, isSaved, save, unsave, toggleSave, getSavedEvents }}
    >
      {children}
    </SavedEventsContext.Provider>
  )
}

export function useSavedEvents() {
  const ctx = useContext(SavedEventsContext)
  if (!ctx) throw new Error('useSavedEvents must be used within SavedEventsProvider')
  return ctx
}
