import { Repeat } from 'lucide-react'
import { formatRecurrence, isRecurring, type EventRecurrence } from '../../types/recurrence'

export function RecurrenceBadge({
  recurrence,
  time,
  compact,
}: {
  recurrence?: EventRecurrence
  time?: string
  compact?: boolean
}) {
  if (!isRecurring(recurrence)) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#bf5af2]/25 text-[#e0b3ff] ${
        compact ? 'px-2 py-0.5 text-[10px] font-semibold' : 'px-2.5 py-1 text-[11px] font-semibold'
      }`}
    >
      <Repeat className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {compact ? 'Recurring' : formatRecurrence(recurrence!, time).split(' at ')[0]}
    </span>
  )
}
