import type { Event } from '../data/mockData'

/** Demo "today" anchor for the mock app */
export const EXPLORER_DEMO_TODAY = new Date(2026, 6, 9)

export type DateRange = {
  start: Date
  end: Date
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function normalizeRange(range: DateRange): DateRange {
  const a = startOfDay(range.start).getTime()
  const b = startOfDay(range.end).getTime()
  if (a <= b) return { start: new Date(a), end: new Date(b) }
  return { start: new Date(b), end: new Date(a) }
}

export function todayRange(): DateRange {
  const today = startOfDay(EXPLORER_DEMO_TODAY)
  return { start: today, end: today }
}

export function formatDateRangeLabel(range: DateRange): string {
  const { start, end } = normalizeRange(range)
  const today = startOfDay(EXPLORER_DEMO_TODAY).getTime()

  if (start.getTime() === end.getTime()) {
    if (start.getTime() === today) return 'Today'
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const sameYear = start.getFullYear() === end.getFullYear()
  const startFmt = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endFmt = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startFmt} – ${endFmt}`
}

export function parseEventDate(event: Event): Date | null {
  if (event.seriesStart) {
    const fromSeries = new Date(event.seriesStart)
    if (!Number.isNaN(fromSeries.getTime())) return fromSeries
  }
  const parsed = Date.parse(event.date)
  if (!Number.isNaN(parsed)) return new Date(parsed)
  return null
}

export function eventInDateRange(event: Event, range: DateRange): boolean {
  const eventDate = parseEventDate(event)
  if (!eventDate) return true
  const { start, end } = normalizeRange(range)
  const t = startOfDay(eventDate).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function clampDay(month: number, day: number, year: number): number {
  return Math.min(day, daysInMonth(month, year))
}
