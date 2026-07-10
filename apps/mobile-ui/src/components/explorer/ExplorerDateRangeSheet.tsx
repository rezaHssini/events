import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import {
  MONTH_LABELS,
  clampDay,
  daysInMonth,
  formatDateRangeLabel,
  normalizeRange,
  type DateRange,
} from '../../utils/explorerDateRange'

const WHEEL_ITEM_H = 36
const YEARS = [2025, 2026, 2027, 2028]

function WheelColumn({
  options,
  value,
  onChange,
  width = 'flex-1',
}: {
  options: { value: number; label: string }[]
  value: number
  onChange: (value: number) => void
  width?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  useEffect(() => {
    setActiveIndex(index)
  }, [index])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = index * WHEEL_ITEM_H
  }, [index, options.length])

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    const nextIndex = Math.round(el.scrollTop / WHEEL_ITEM_H)
    const clamped = Math.min(Math.max(nextIndex, 0), options.length - 1)
    setActiveIndex(clamped)
    if (options[clamped] && options[clamped].value !== value) {
      onChange(options[clamped].value)
    }
  }

  return (
    <div className={`relative ${width}`}>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-[180px] snap-y snap-mandatory overflow-y-auto scroll-smooth scrollbar-hide"
      >
        <div className="h-[72px]" aria-hidden />
        {options.map((opt, i) => (
          <div
            key={opt.value}
            className={`flex h-9 snap-center items-center justify-center text-[17px] transition-colors ${
              i === activeIndex ? 'font-semibold text-white' : 'text-white/35'
            }`}
          >
            {opt.label}
          </div>
        ))}
        <div className="h-[72px]" aria-hidden />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[72px] bg-gradient-to-b from-[#1c1c1e] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] bg-gradient-to-t from-[#1c1c1e] to-transparent" />
    </div>
  )
}

function DateWheel({
  label,
  date,
  onChange,
}: {
  label: string
  date: Date
  onChange: (date: Date) => void
}) {
  const month = date.getMonth()
  const year = date.getFullYear()
  const day = date.getDate()

  const monthOptions = MONTH_LABELS.map((name, i) => ({ value: i, label: name }))
  const dayOptions = Array.from({ length: daysInMonth(month, year) }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }))
  const yearOptions = YEARS.map((y) => ({ value: y, label: String(y) }))

  const setMonth = (m: number) => {
    const nextDay = clampDay(m, day, year)
    onChange(new Date(year, m, nextDay))
  }

  const setDay = (d: number) => {
    onChange(new Date(year, month, d))
  }

  const setYear = (y: number) => {
    const nextDay = clampDay(month, day, y)
    onChange(new Date(y, month, nextDay))
  }

  return (
    <div>
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
        {label}
      </p>
      <div className="flex gap-1">
        <WheelColumn options={monthOptions} value={month} onChange={setMonth} width="flex-[1.4]" />
        <WheelColumn options={dayOptions} value={day} onChange={setDay} width="flex-[0.6]" />
        <WheelColumn options={yearOptions} value={year} onChange={setYear} width="flex-[0.8]" />
      </div>
    </div>
  )
}

export function ExplorerDateRangeSheet({
  open,
  range,
  onClose,
  onApply,
}: {
  open: boolean
  range: DateRange
  onClose: () => void
  onApply: (range: DateRange) => void
}) {
  const [draft, setDraft] = useState(range)

  useEffect(() => {
    if (open) setDraft(normalizeRange(range))
  }, [open, range])

  const apply = () => {
    onApply(normalizeRange(draft))
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="When">
      <div className="space-y-5 text-left">
        <p className="text-center text-[15px] text-[rgba(235,235,245,0.7)]">
          {formatDateRangeLabel(draft)}
        </p>

        <DateWheel
          label="Start"
          date={draft.start}
          onChange={(start) => setDraft((prev) => normalizeRange({ start, end: prev.end }))}
        />

        <DateWheel
          label="End"
          date={draft.end}
          onChange={(end) => setDraft((prev) => normalizeRange({ start: prev.start, end }))}
        />

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[14px] py-3.5 text-[17px] font-medium text-[#0a84ff]"
          >
            Cancel
          </button>
          <button type="button" onClick={apply} className="ios-button flex-1 py-3.5 text-[17px]">
            Apply
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
