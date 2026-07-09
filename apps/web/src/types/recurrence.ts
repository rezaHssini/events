export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly'

export type RecurrenceEnd =
  | { type: 'never' }
  | { type: 'on_date'; date: string }
  | { type: 'after_count'; count: number }

export interface EventRecurrence {
  frequency: RecurrenceFrequency
  /** Every N days / weeks / months */
  interval: number
  /** 0 = Sunday … 6 = Saturday (weekly) */
  daysOfWeek: number[]
  /** 1–31 (monthly) */
  daysOfMonth: number[]
  end: RecurrenceEnd
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const defaultRecurrence = (): EventRecurrence => ({
  frequency: 'none',
  interval: 1,
  daysOfWeek: [5, 6],
  daysOfMonth: [1, 15],
  end: { type: 'never' },
})

export function isRecurring(recurrence?: EventRecurrence | null): boolean {
  return !!recurrence && recurrence.frequency !== 'none'
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function endAllows(recurrence: EventRecurrence, date: Date, occurrenceIndex: number): boolean {
  if (recurrence.end.type === 'never') return true
  if (recurrence.end.type === 'on_date') return date <= parseIso(recurrence.end.date)
  return occurrenceIndex <= recurrence.end.count
}

export function formatRecurrence(recurrence: EventRecurrence, time?: string): string {
  if (!isRecurring(recurrence)) return 'One-time event'

  const timeSuffix = time ? ` at ${formatTime12(time)}` : ''
  const interval = recurrence.interval

  if (recurrence.frequency === 'daily') {
    const base = interval === 1 ? 'Every night' : `Every ${interval} days`
    return `${base}${timeSuffix}`
  }

  if (recurrence.frequency === 'weekly') {
    const days = recurrence.daysOfWeek
      .slice()
      .sort((a, b) => a - b)
      .map((d) => WEEKDAY_LABELS[d])
      .join(', ')
    const base =
      interval === 1
        ? `Every week on ${days || 'selected days'}`
        : `Every ${interval} weeks on ${days || 'selected days'}`
    return `${base}${timeSuffix}`
  }

  if (recurrence.frequency === 'monthly') {
    const days = recurrence.daysOfMonth
      .slice()
      .sort((a, b) => a - b)
      .map((d) => ordinal(d))
      .join(', ')
    const base =
      interval === 1
        ? `Every month on the ${days || 'selected days'}`
        : `Every ${interval} months on the ${days || 'selected days'}`
    return `${base}${timeSuffix}`
  }

  return 'Recurring'
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function getNextOccurrences(
  recurrence: EventRecurrence,
  seriesStartIso: string,
  count: number,
  from: Date = new Date(),
): Date[] {
  if (!isRecurring(recurrence)) return []

  const results: Date[] = []
  const seriesStart = parseIso(seriesStartIso)
  let cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  if (cursor < seriesStart) cursor = new Date(seriesStart)

  let occurrenceIndex = 0
  const limit = 400

  for (let i = 0; i < limit && results.length < count; i += 1) {
    const date = addDays(cursor, i)
    if (date < seriesStart) continue

    let matches = false

    if (recurrence.frequency === 'daily') {
      const daysSince = daysBetween(seriesStart, date)
      matches = daysSince % recurrence.interval === 0
    } else if (recurrence.frequency === 'weekly') {
      if (!recurrence.daysOfWeek.includes(date.getDay())) continue
      const weeksSince = Math.floor(daysBetween(seriesStart, date) / 7)
      matches = weeksSince % recurrence.interval === 0
    } else if (recurrence.frequency === 'monthly') {
      if (!recurrence.daysOfMonth.includes(date.getDate())) continue
      const monthsSince =
        (date.getFullYear() - seriesStart.getFullYear()) * 12 +
        (date.getMonth() - seriesStart.getMonth())
      matches = monthsSince >= 0 && monthsSince % recurrence.interval === 0
    }

    if (matches) {
      occurrenceIndex += 1
      if (endAllows(recurrence, date, occurrenceIndex)) {
        results.push(date)
      } else {
        break
      }
    }
  }

  return results
}

export function getNextOccurrence(
  recurrence: EventRecurrence,
  seriesStartIso: string,
  from?: Date,
): Date | null {
  return getNextOccurrences(recurrence, seriesStartIso, 1, from)[0] ?? null
}

export function formatEventSchedule(event: {
  date: string
  time: string
  recurrence?: EventRecurrence
  seriesStart?: string
}): string {
  if (!isRecurring(event.recurrence)) {
    return `${event.date} · ${formatTime12(event.time)}`
  }

  const seriesStart = event.seriesStart ?? parseDisplayDateToIso(event.date) ?? '2026-01-01'
  const next = getNextOccurrence(event.recurrence!, seriesStart)
  const label = formatRecurrence(event.recurrence!, event.time)
  if (next) {
    return `${label} · Next ${formatDisplayDate(next)}`
  }
  return label
}

/** Best-effort parse for display dates like "Jul 12, 2026" */
function parseDisplayDateToIso(display: string): string | null {
  const parsed = Date.parse(display)
  if (Number.isNaN(parsed)) return null
  return toIso(new Date(parsed))
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / 86400000)
}

export function formatOccurrenceList(dates: Date[]): string[] {
  return dates.map((d) => formatDisplayDate(d))
}
