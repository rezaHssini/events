import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { useToast } from '../../context/ToastContext'

type Seat = { id: string; row: number; col: number; label: string; blocked: boolean }

function buildSeats(rows: number, cols: number): Seat[] {
  const seats: Seat[] = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const rowLabel = String.fromCharCode(65 + r)
      seats.push({
        id: `${rowLabel}${c + 1}`,
        row: r,
        col: c,
        label: `${rowLabel}${c + 1}`,
        blocked: false,
      })
    }
  }
  return seats
}

export function SeatingDesignerSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (capacity: number, layout: string) => void
}) {
  const { toast } = useToast()
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(6)
  const [seats, setSeats] = useState(() => buildSeats(4, 6))

  const rebuild = (r: number, c: number) => {
    setRows(r)
    setCols(c)
    setSeats(buildSeats(r, c))
  }

  const toggleSeat = (id: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, blocked: !s.blocked } : s)),
    )
  }

  const available = seats.filter((s) => !s.blocked).length

  return (
    <BottomSheet open={open} onClose={onClose} title="Seating designer">
      <div className="space-y-4 text-left">
        <p className="ios-caption">Tap seats to block them. Stage is at the top.</p>
        <div className="rounded-[14px] bg-white/10 py-2 text-center text-xs font-semibold uppercase tracking-wider">
          Stage
        </div>
        <div className="flex flex-col items-center gap-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-1.5">
              {seats
                .filter((s) => s.row === r)
                .map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => toggleSeat(seat.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold ${
                      seat.blocked ? 'bg-white/5 text-white/20 line-through' : 'bg-[#0a84ff]/30 text-white'
                    }`}
                  >
                    {seat.col + 1}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="flex-1 ios-caption">
            Rows
            <input
              type="number"
              min={2}
              max={10}
              value={rows}
              onChange={(e) => rebuild(Number(e.target.value), cols)}
              className="mt-1 w-full rounded-[12px] bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex-1 ios-caption">
            Seats per row
            <input
              type="number"
              min={4}
              max={12}
              value={cols}
              onChange={(e) => rebuild(rows, Number(e.target.value))}
              className="mt-1 w-full rounded-[12px] bg-white/10 px-3 py-2"
            />
          </label>
        </div>
        <p className="ios-caption">{available} seats available</p>
        <button
          type="button"
          onClick={() => {
            onSave(available, `${rows}×${cols} seated`)
            toast(`✓ Seating saved — ${available} seats`)
            onClose()
          }}
          className="ios-button w-full py-3.5"
        >
          Save layout
        </button>
      </div>
    </BottomSheet>
  )
}
