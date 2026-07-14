import {
  type EventRecurrence,
  type RecurrenceFrequency,
  WEEKDAY_LABELS,
  defaultRecurrence,
  formatRecurrence,
  isRecurring,
} from '../../types/recurrence'
import { FormChip, FormField, FormInput, FormToggle } from './FormPrimitives'

const FREQUENCIES: { id: RecurrenceFrequency; label: string; desc: string }[] = [
  { id: 'daily', label: 'Daily', desc: 'Every night or every N days' },
  { id: 'weekly', label: 'Weekly', desc: 'Specific days each week' },
  { id: 'monthly', label: 'Monthly', desc: 'Specific dates each month' },
]

type RecurrencePickerProps = {
  recurrence: EventRecurrence
  onChange: (next: EventRecurrence) => void
  startTime?: string
}

export function RecurrencePicker({ recurrence, onChange, startTime }: RecurrencePickerProps) {
  const enabled = isRecurring(recurrence)

  const setEnabled = (on: boolean) => {
    if (!on) {
      onChange(defaultRecurrence())
      return
    }
    onChange({
      ...defaultRecurrence(),
      frequency: 'weekly',
      daysOfWeek: [5, 6],
    })
  }

  const patch = (partial: Partial<EventRecurrence>) => onChange({ ...recurrence, ...partial })

  const toggleWeekday = (day: number) => {
    const days = recurrence.daysOfWeek.includes(day)
      ? recurrence.daysOfWeek.filter((d) => d !== day)
      : [...recurrence.daysOfWeek, day].sort((a, b) => a - b)
    patch({ daysOfWeek: days })
  }

  const toggleMonthDay = (day: number) => {
    const days = recurrence.daysOfMonth.includes(day)
      ? recurrence.daysOfMonth.filter((d) => d !== day)
      : [...recurrence.daysOfMonth, day].sort((a, b) => a - b)
    patch({ daysOfMonth: days })
  }

  return (
    <div className="space-y-3">
      <FormToggle
        label="Recurring event"
        desc="Repeats on a schedule — daily, weekly, or monthly"
        checked={enabled}
        onChange={setEnabled}
      />

      {enabled && (
        <>
          <FormField label="Repeat">
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <FormChip
                  key={f.id}
                  label={f.label}
                  selected={recurrence.frequency === f.id}
                  onClick={() => patch({ frequency: f.id })}
                />
              ))}
            </div>
            <p className="mt-2 ios-caption">
              {FREQUENCIES.find((f) => f.id === recurrence.frequency)?.desc}
            </p>
          </FormField>

          <FormField label="Interval" hint={`Every how many ${recurrence.frequency === 'daily' ? 'days' : recurrence.frequency === 'weekly' ? 'weeks' : 'months'}?`}>
            <FormInput
              type="number"
              min={1}
              max={30}
              value={recurrence.interval}
              onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
            />
          </FormField>

          {recurrence.frequency === 'weekly' && (
            <FormField label="On these days">
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleWeekday(i)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
                      recurrence.daysOfWeek.includes(i)
                        ? 'bg-[#0a84ff] text-white'
                        : 'liquid-glass-subtle text-white/50'
                    }`}
                  >
                    {label.charAt(0)}
                  </button>
                ))}
              </div>
              <p className="mt-2 ios-caption">
                {recurrence.daysOfWeek.length > 0
                  ? recurrence.daysOfWeek.map((d) => WEEKDAY_LABELS[d]).join(', ')
                  : 'Select at least one day'}
              </p>
            </FormField>
          )}

          {recurrence.frequency === 'monthly' && (
            <FormField label="On these dates">
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleMonthDay(day)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium ${
                      recurrence.daysOfMonth.includes(day)
                        ? 'bg-[#0a84ff] text-white'
                        : 'bg-white/8 text-white/45'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </FormField>
          )}

          <FormField label="Ends">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'never' as const, label: 'Never' },
                  { id: 'on_date' as const, label: 'On date' },
                  { id: 'after_count' as const, label: 'After N times' },
                ] as const
              ).map((opt) => (
                <FormChip
                  key={opt.id}
                  label={opt.label}
                  selected={recurrence.end.type === opt.id}
                  onClick={() => {
                    if (opt.id === 'never') patch({ end: { type: 'never' } })
                    else if (opt.id === 'on_date') patch({ end: { type: 'on_date', date: '2026-12-31' } })
                    else patch({ end: { type: 'after_count', count: 12 } })
                  }}
                />
              ))}
            </div>
            {recurrence.end.type === 'on_date' && (
              <FormInput
                type="date"
                className="mt-2"
                value={recurrence.end.date}
                onChange={(e) => patch({ end: { type: 'on_date', date: e.target.value } })}
              />
            )}
            {recurrence.end.type === 'after_count' && (
              <FormInput
                type="number"
                min={1}
                className="mt-2"
                value={recurrence.end.count}
                onChange={(e) =>
                  patch({ end: { type: 'after_count', count: Math.max(1, Number(e.target.value) || 1) } })
                }
              />
            )}
          </FormField>

          <div className="rounded-[18px] liquid-glass-subtle p-4 text-left">
            <p className="ios-caption">Schedule preview</p>
            <p className="mt-1 text-sm font-medium text-[#64d2ff]">
              {formatRecurrence(recurrence, startTime)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
