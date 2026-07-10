import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Plus,
  Trash2,
  Layers,
  UtensilsCrossed,
  Theater,
  Mic2,
  Settings2,
  Pencil,
  Map,
  FolderOpen,
} from 'lucide-react'
import {
  type SeatingPlan,
  type SeatingSection,
  type SeatingFloor,
  type DiningTable,
  type StageConfig,
  type FloorMode,
  type StagePosition,
  buildSectionSeats,
  buildTableChairs,
  createDefaultFloor,
  createDefaultSection,
  createDefaultTable,
  normalizePlan,
  planStats,
  planFromTemplate,
  formatPlanSummary,
  SECTION_COLORS,
} from '../../types/seating'
import { useToast } from '../../context/ToastContext'
import { useSeatingTemplates } from '../../context/SeatingTemplatesContext'
import { BottomSheet } from './BottomSheet'

function rebuildSection(section: SeatingSection, rows: number, cols: number): SeatingSection {
  const seats = buildSectionSeats(rows, cols, section.id)
  const blocked = new Set(section.seats.filter((s) => s.blocked).map((s) => `${s.row}-${s.col}`))
  return {
    ...section,
    rows,
    cols,
    seats: seats.map((s) => ({ ...s, blocked: blocked.has(`${s.row}-${s.col}`) })),
  }
}

function chairPositions(count: number): { x: number; y: number }[] {
  const radius = 42
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    }
  })
}

function StageBlock({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[16px] border border-[#bf5af2]/30 bg-gradient-to-b from-[#bf5af2]/25 to-[#bf5af2]/5 text-center ${
        compact ? 'px-2 py-4' : 'px-4 py-3'
      }`}
    >
      <Mic2 className={`mx-auto text-[#bf5af2] ${compact ? 'h-5 w-5' : 'h-4 w-4'}`} />
      {!compact && (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">Stage</p>
      )}
    </div>
  )
}

function StagePositionPicker({
  position,
  onChange,
}: {
  position: StagePosition
  onChange: (pos: StagePosition) => void
}) {
  const slots: { value: StagePosition; className: string }[] = [
    { value: 'top', className: 'col-start-2 row-start-1' },
    { value: 'left', className: 'col-start-1 row-start-2' },
    { value: 'right', className: 'col-start-3 row-start-2' },
    { value: 'bottom', className: 'col-start-2 row-start-3' },
  ]

  return (
    <div className="mx-auto grid w-full max-w-[200px] grid-cols-3 grid-rows-3 gap-1.5">
      {slots.map((slot) => (
        <button
          key={slot.value}
          type="button"
          onClick={() => onChange(slot.value)}
          className={`rounded-[10px] border py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${slot.className} ${
            position === slot.value
              ? 'border-[#0a84ff] bg-[#0a84ff]/25 text-white'
              : 'border-white/10 bg-white/5 text-white/45'
          }`}
        >
          {slot.value}
        </button>
      ))}
      <div className="col-start-2 row-start-2 flex items-center justify-center rounded-[12px] border border-dashed border-white/15 bg-white/5 text-[10px] text-white/35">
        Floor
      </div>
    </div>
  )
}

function FloorCanvas({
  stage,
  children,
}: {
  stage: StageConfig
  children: React.ReactNode
}) {
  const stageEl = stage.enabled ? <StageBlock compact={stage.position === 'left' || stage.position === 'right'} /> : null

  const floor = (
    <div className="min-h-[320px] rounded-[24px] border border-white/10 bg-gradient-to-b from-[#1a1a24] to-[#101018] p-4 shadow-inner">
      {children}
    </div>
  )

  if (!stage.enabled) return floor

  if (stage.position === 'top') {
    return (
      <div className="space-y-3">
        {stageEl}
        {floor}
      </div>
    )
  }
  if (stage.position === 'bottom') {
    return (
      <div className="space-y-3">
        {floor}
        {stageEl}
      </div>
    )
  }
  if (stage.position === 'left') {
    return (
      <div className="flex gap-3">
        <div className="w-[72px] shrink-0">{stageEl}</div>
        <div className="min-w-0 flex-1">{floor}</div>
      </div>
    )
  }
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">{floor}</div>
      <div className="w-[72px] shrink-0">{stageEl}</div>
    </div>
  )
}

function SectionGrid({
  section,
  onToggleSeat,
}: {
  section: SeatingSection
  onToggleSeat: (seatId: string) => void
}) {
  const available = section.seats.filter((s) => !s.blocked).length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section.color }} />
          <p className="text-sm font-semibold">{section.name}</p>
        </div>
        <p className="text-xs text-white/45">
          {available}/{section.seats.length} · ${section.price}
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-min flex-col items-center gap-1.5 pb-1">
          {Array.from({ length: section.rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="w-4 text-center text-[10px] font-semibold text-white/35">
                {String.fromCharCode(65 + r)}
              </span>
              <div className="flex gap-1">
                {section.seats
                  .filter((s) => s.row === r)
                  .map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      aria-label={`Seat ${String.fromCharCode(65 + r)}${seat.col + 1}`}
                      onClick={() => onToggleSeat(seat.id)}
                      style={{
                        backgroundColor: seat.blocked ? 'rgba(255,255,255,0.04)' : `${section.color}44`,
                        borderColor: seat.blocked ? 'transparent' : section.color,
                      }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[9px] font-semibold transition-transform active:scale-90 ${
                        seat.blocked ? 'text-white/15 line-through' : 'text-white'
                      }`}
                    >
                      {seat.col + 1}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RestaurantFloorPlan({
  table,
  onToggleChair,
}: {
  table: DiningTable | undefined
  onToggleChair: (tableId: string, chairId: string) => void
}) {
  if (!table) {
    return <p className="py-16 text-center ios-caption">Add a table to start your floor plan</p>
  }

  const positions = chairPositions(table.chairs.length)
  const available = table.chairs.filter((c) => !c.blocked).length

  return (
    <div className="flex flex-col items-center py-2">
      <p className="mb-1 text-sm font-semibold">{table.label}</p>
      <p className="mb-5 text-xs text-white/45">
        {available} of {table.chairs.length} seats · ${table.pricePerSeat} each
      </p>
      <div className={`relative aspect-square w-full max-w-[240px] ${table.blocked ? 'opacity-40' : ''}`}>
        {positions.map((pos, i) => {
          const chair = table.chairs[i]
          return (
            <button
              key={chair.id}
              type="button"
              aria-label={`Chair ${i + 1}`}
              onClick={() => onToggleChair(table.id, chair.id)}
              className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-[11px] font-semibold transition-transform active:scale-90 ${
                chair.blocked
                  ? 'border-white/10 bg-white/5 text-white/20 line-through'
                  : 'border-[#30d158] bg-[#30d158]/35 text-white shadow-[0_0_12px_rgba(48,209,88,0.25)]'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {i + 1}
            </button>
          )
        })}
        <div className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#bf5af2]/40 bg-[#bf5af2]/20 text-sm font-semibold">
          {table.label}
        </div>
      </div>
    </div>
  )
}

type FloorViewMode = 'overview' | 'detail'

function MiniSectionBlock({
  section,
  selected,
  onSelect,
}: {
  section: SeatingSection
  selected: boolean
  onSelect: () => void
}) {
  const available = section.seats.filter((s) => !s.blocked).length

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[18px] border p-3 text-left transition-all active:scale-[0.99] ${
        selected
          ? 'border-white/30 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]'
          : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: section.color }} />
          <p className="truncate text-sm font-semibold">{section.name}</p>
        </div>
        <p className="shrink-0 text-[10px] text-white/45">
          {available}/{section.seats.length} · ${section.price}
        </p>
      </div>
      <div
        className="mx-auto grid max-w-full gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${section.cols}, minmax(0, 1fr))` }}
      >
        {section.seats.map((seat) => (
          <span
            key={seat.id}
            className="aspect-square min-h-[5px] min-w-[5px] rounded-[2px]"
            style={{
              backgroundColor: seat.blocked ? 'rgba(255,255,255,0.06)' : `${section.color}88`,
            }}
          />
        ))}
      </div>
    </button>
  )
}

function TheaterFloorOverview({
  floor,
  activeSectionId,
  onSelectSection,
}: {
  floor: SeatingFloor
  activeSectionId: string
  onSelectSection: (id: string) => void
}) {
  if (floor.sections.length === 0) {
    return <p className="py-16 text-center ios-caption">Add a section to build your floor plan</p>
  }

  return (
    <div className="space-y-3 py-1">
      <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-white/35">
        Floor overview · {floor.sections.length} section{floor.sections.length === 1 ? '' : 's'}
      </p>
      {floor.sections.map((section) => (
        <MiniSectionBlock
          key={section.id}
          section={section}
          selected={section.id === activeSectionId}
          onSelect={() => onSelectSection(section.id)}
        />
      ))}
    </div>
  )
}

function MiniTableBlock({
  table,
  selected,
  onSelect,
}: {
  table: DiningTable
  selected: boolean
  onSelect: () => void
}) {
  const positions = chairPositions(table.chairs.length)
  const available = table.chairs.filter((c) => !c.blocked).length

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-square w-full rounded-[16px] border p-2 transition-all active:scale-[0.98] ${
        selected
          ? 'border-[#bf5af2] bg-[#bf5af2]/15 shadow-[0_0_0_1px_rgba(191,90,242,0.35)]'
          : 'border-white/10 bg-white/[0.04]'
      } ${table.blocked ? 'opacity-40' : ''}`}
    >
      {positions.map((pos, i) => {
        const chair = table.chairs[i]
        return (
          <span
            key={chair.id}
            className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              chair.blocked ? 'bg-white/10' : 'bg-[#30d158]/70'
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        )
      })}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
        <p className="text-center text-[11px] font-semibold leading-tight">{table.label}</p>
        <p className="mt-0.5 text-center text-[9px] text-white/45">{available} seats</p>
      </div>
    </button>
  )
}

function RestaurantFloorOverview({
  floor,
  activeTableId,
  onSelectTable,
}: {
  floor: SeatingFloor
  activeTableId: string
  onSelectTable: (id: string) => void
}) {
  if (floor.tables.length === 0) {
    return <p className="py-16 text-center ios-caption">Add a table to build your floor plan</p>
  }

  const totalSeats = floor.tables.reduce(
    (n, t) => n + (t.blocked ? 0 : t.chairs.filter((c) => !c.blocked).length),
    0,
  )

  return (
    <div className="py-1">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-white/35">
        Floor overview · {floor.tables.length} table{floor.tables.length === 1 ? '' : 's'} · {totalSeats} seats
      </p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {floor.tables.map((table) => (
          <MiniTableBlock
            key={table.id}
            table={table}
            selected={table.id === activeTableId}
            onSelect={() => onSelectTable(table.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; icon?: React.ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-full bg-white/8 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
            value === opt.value ? 'bg-white/18 text-white shadow-sm' : 'text-white/45'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[14px] liquid-glass-subtle px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}

export function SeatingStudio({
  open,
  initialPlan,
  onClose,
  onSave,
}: {
  open: boolean
  initialPlan?: SeatingPlan | null
  onClose: () => void
  onSave: (plan: SeatingPlan) => void
}) {
  const { toast } = useToast()
  const { templates, saveTemplate } = useSeatingTemplates()
  const [plan, setPlan] = useState<SeatingPlan>(() => normalizePlan(initialPlan))
  const [activeFloorId, setActiveFloorId] = useState(plan.floors[0]?.id ?? '')
  const [activeSectionId, setActiveSectionId] = useState(plan.floors[0]?.sections[0]?.id ?? '')
  const [activeTableId, setActiveTableId] = useState(plan.floors[0]?.tables[0]?.id ?? '')
  const [venueSheetOpen, setVenueSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<FloorViewMode>('overview')

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const normalized = normalizePlan(initialPlan)
      setPlan(normalized)
      setActiveFloorId(normalized.floors[0]?.id ?? '')
      setActiveSectionId(normalized.floors[0]?.sections[0]?.id ?? '')
      setActiveTableId(normalized.floors[0]?.tables[0]?.id ?? '')
      setVenueSheetOpen(false)
      setEditSheetOpen(false)
      setViewMode('overview')
    }
  }, [open, initialPlan])

  const activeFloor = plan.floors.find((f) => f.id === activeFloorId) ?? plan.floors[0]
  const activeSection =
    activeFloor?.sections.find((s) => s.id === activeSectionId) ?? activeFloor?.sections[0]
  const activeTable = activeFloor?.tables.find((t) => t.id === activeTableId) ?? activeFloor?.tables[0]
  const stats = useMemo(() => planStats(plan), [plan])

  if (!open || !activeFloor) return null

  const updatePlan = (updater: (prev: SeatingPlan) => SeatingPlan) => setPlan(updater)

  const applyPlan = (next: SeatingPlan) => {
    const normalized = normalizePlan(next)
    setPlan(normalized)
    setActiveFloorId(normalized.floors[0]?.id ?? '')
    setActiveSectionId(normalized.floors[0]?.sections[0]?.id ?? '')
    setActiveTableId(normalized.floors[0]?.tables[0]?.id ?? '')
    setViewMode('overview')
    setVenueSheetOpen(false)
    setEditSheetOpen(false)
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    applyPlan(planFromTemplate(template))
    setTemplateSheetOpen(false)
    toast(`✓ Loaded “${template.name}”`)
  }

  const handleSave = () => {
    onSave(plan)
    const templateName = plan.floors.map((f) => f.name).join(' · ') || formatPlanSummary(plan)
    saveTemplate(templateName, plan)
    toast(`✓ Seating plan saved — ${stats.seats} seats across ${stats.floorCount} floor${stats.floorCount === 1 ? '' : 's'}`)
    onClose()
  }

  const updateFloor = (floorId: string, patch: Partial<SeatingFloor>) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => (f.id === floorId ? { ...f, ...patch } : f)),
    }))
  }

  const setFloorMode = (floorId: string, mode: FloorMode) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f
        if (f.mode === mode) return f
        if (mode === 'theater') {
          const sections = f.sections.length > 0 ? f.sections : [createDefaultSection(0, f.id)]
          setActiveSectionId(sections[0].id)
          return { ...f, mode, sections, tables: [] }
        }
        const tables = f.tables.length > 0 ? f.tables : [createDefaultTable(0, f.id)]
        setActiveTableId(tables[0].id)
        return { ...f, mode, tables, sections: [] }
      }),
    }))
  }

  const updateSection = (floorId: string, sectionId: string, patch: Partial<SeatingSection>) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId
          ? { ...f, sections: f.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)) }
          : f,
      ),
    }))
  }

  const resizeSection = (floorId: string, sectionId: string, rows: number, cols: number) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId
          ? {
              ...f,
              sections: f.sections.map((s) => (s.id === sectionId ? rebuildSection(s, rows, cols) : s)),
            }
          : f,
      ),
    }))
  }

  const toggleSeat = (floorId: string, sectionId: string, seatId: string) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId
          ? {
              ...f,
              sections: f.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      seats: s.seats.map((seat) =>
                        seat.id === seatId ? { ...seat, blocked: !seat.blocked } : seat,
                      ),
                    }
                  : s,
              ),
            }
          : f,
      ),
    }))
  }

  const addSection = (floorId: string) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    if (!floor) return
    const next = createDefaultSection(floor.sections.length, floorId)
    updateFloor(floorId, { sections: [...floor.sections, next] })
    setActiveSectionId(next.id)
    setViewMode('overview')
    setEditSheetOpen(true)
  }

  const removeSection = (floorId: string, sectionId: string) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    if (!floor || floor.sections.length <= 1) return
    const sections = floor.sections.filter((s) => s.id !== sectionId)
    updateFloor(floorId, { sections })
    if (activeSectionId === sectionId) setActiveSectionId(sections[0].id)
    setEditSheetOpen(false)
  }

  const updateTable = (floorId: string, tableId: string, patch: Partial<DiningTable>) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId
          ? { ...f, tables: f.tables.map((t) => (t.id === tableId ? { ...t, ...patch } : t)) }
          : f,
      ),
    }))
  }

  const resizeTable = (floorId: string, tableId: string, chairCount: number) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    const table = floor?.tables.find((t) => t.id === tableId)
    if (!table) return
    const chairs = buildTableChairs(tableId, chairCount).map((c, i) => ({
      ...c,
      blocked: table.chairs[i]?.blocked ?? false,
    }))
    updateTable(floorId, tableId, { chairs })
  }

  const toggleChair = (floorId: string, tableId: string, chairId: string) => {
    updatePlan((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId
          ? {
              ...f,
              tables: f.tables.map((t) =>
                t.id === tableId
                  ? {
                      ...t,
                      chairs: t.chairs.map((c) =>
                        c.id === chairId ? { ...c, blocked: !c.blocked } : c,
                      ),
                    }
                  : t,
              ),
            }
          : f,
      ),
    }))
  }

  const addTable = (floorId: string) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    if (!floor) return
    const next = createDefaultTable(floor.tables.length, floorId)
    updateFloor(floorId, { tables: [...floor.tables, next] })
    setActiveTableId(next.id)
    setViewMode('overview')
    setEditSheetOpen(true)
  }

  const removeTable = (floorId: string, tableId: string) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    if (!floor || floor.tables.length <= 1) return
    const tables = floor.tables.filter((t) => t.id !== tableId)
    updateFloor(floorId, { tables })
    if (activeTableId === tableId) setActiveTableId(tables[0].id)
    setEditSheetOpen(false)
  }

  const addFloor = () => {
    const next = createDefaultFloor(plan.floors.length, activeFloor.mode)
    updatePlan((prev) => ({ ...prev, floors: [...prev.floors, next] }))
    setActiveFloorId(next.id)
    if (next.mode === 'theater') setActiveSectionId(next.sections[0]?.id ?? '')
    else setActiveTableId(next.tables[0]?.id ?? '')
  }

  const removeFloor = (floorId: string) => {
    if (plan.floors.length <= 1) return
    updatePlan((prev) => {
      const floors = prev.floors.filter((f) => f.id !== floorId)
      if (activeFloorId === floorId) {
        setActiveFloorId(floors[0].id)
        setActiveSectionId(floors[0].sections[0]?.id ?? '')
        setActiveTableId(floors[0].tables[0]?.id ?? '')
      }
      return { ...prev, floors }
    })
    setVenueSheetOpen(false)
  }

  const selectFloor = (floorId: string) => {
    const floor = plan.floors.find((f) => f.id === floorId)
    if (!floor) return
    setActiveFloorId(floorId)
    setActiveSectionId(floor.sections[0]?.id ?? '')
    setActiveTableId(floor.tables[0]?.id ?? '')
    setViewMode('overview')
  }

  const openSectionDetail = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setViewMode('detail')
  }

  const openTableDetail = (tableId: string) => {
    setActiveTableId(tableId)
    setViewMode('detail')
  }

  const setFloorModeAndReset = (floorId: string, mode: FloorMode) => {
    setFloorMode(floorId, mode)
    setViewMode('overview')
  }

  const content = (
    <motion.div
      data-testid="seating-studio"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="fixed inset-0 z-[80] flex flex-col bg-[#0a0a0f]"
    >
      <header className="border-b border-white/10 px-4 pb-3 pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full liquid-glass-subtle"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-left">
            <p className="ios-headline">Seating studio</p>
            <p className="truncate ios-caption">{activeFloor.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setTemplateSheetOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full liquid-glass-subtle"
            aria-label="Load template"
          >
            <FolderOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setVenueSheetOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full liquid-glass-subtle"
            aria-label="Venue settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleSave} className="ios-button px-4 py-2 text-sm">
            Save
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <StatChip label="Seats" value={String(stats.seats)} />
          <StatChip label="Revenue" value={`$${stats.revenue.toLocaleString()}`} />
          <StatChip label="Floors" value={String(stats.floorCount)} />
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide">
          <Layers className="mt-2 h-4 w-4 shrink-0 text-white/35" />
          {plan.floors.map((floor) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => selectFloor(floor.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                floor.id === activeFloorId ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
              }`}
            >
              {floor.name}
            </button>
          ))}
          <button
            type="button"
            onClick={addFloor}
            aria-label="Add floor"
            className="flex shrink-0 items-center gap-1 rounded-full liquid-glass-subtle px-3 py-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Floor
          </button>
        </div>

        <div className="space-y-2 px-4 pb-3">
          <SegmentedControl
            value={activeFloor.mode}
            onChange={(mode) => setFloorModeAndReset(activeFloor.id, mode)}
            options={[
              { value: 'theater', label: 'Theater', icon: <Theater className="h-3.5 w-3.5" /> },
              { value: 'dining', label: 'Restaurant', icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
            ]}
          />

          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'overview', label: 'Overview', icon: <Map className="h-3.5 w-3.5" /> },
              { value: 'detail', label: 'Detail', icon: <Pencil className="h-3.5 w-3.5" /> },
            ]}
          />

          {viewMode === 'detail' && activeFloor.mode === 'theater' && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {activeFloor.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    section.id === activeSection?.id ? 'text-white' : 'bg-white/8 text-white/55'
                  }`}
                  style={
                    section.id === activeSection?.id ? { backgroundColor: section.color } : undefined
                  }
                >
                  {section.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addSection(activeFloor.id)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 text-xs font-medium text-white/55"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {viewMode === 'detail' && activeFloor.mode === 'dining' && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {activeFloor.tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setActiveTableId(table.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    table.id === activeTable?.id ? 'bg-[#bf5af2] text-white' : 'bg-white/8 text-white/55'
                  }`}
                >
                  {table.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addTable(activeFloor.id)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 text-xs font-medium text-white/55"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg">
          <FloorCanvas stage={plan.stage}>
            {viewMode === 'overview' ? (
              activeFloor.mode === 'theater' ? (
                <TheaterFloorOverview
                  floor={activeFloor}
                  activeSectionId={activeSection?.id ?? ''}
                  onSelectSection={openSectionDetail}
                />
              ) : (
                <RestaurantFloorOverview
                  floor={activeFloor}
                  activeTableId={activeTable?.id ?? ''}
                  onSelectTable={openTableDetail}
                />
              )
            ) : activeFloor.mode === 'theater' && activeSection ? (
              <SectionGrid
                section={activeSection}
                onToggleSeat={(seatId) => toggleSeat(activeFloor.id, activeSection.id, seatId)}
              />
            ) : (
              <RestaurantFloorPlan
                table={activeTable}
                onToggleChair={(tableId, chairId) => toggleChair(activeFloor.id, tableId, chairId)}
              />
            )}
          </FloorCanvas>

          <div className="mt-4 flex gap-2">
            {viewMode === 'overview' ? (
              <button
                type="button"
                onClick={() =>
                  activeFloor.mode === 'theater' && activeSection
                    ? openSectionDetail(activeSection.id)
                    : activeTable && openTableDetail(activeTable.id)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold"
              >
                <Pencil className="h-4 w-4" />
                Edit selected
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className="flex flex-1 items-center justify-center gap-2 rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold"
              >
                <Map className="h-4 w-4" />
                Floor map
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditSheetOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold"
            >
              <Settings2 className="h-4 w-4" />
              {activeFloor.mode === 'theater' ? 'Section' : 'Table'} settings
            </button>
            <button
              type="button"
              onClick={() =>
                activeFloor.mode === 'theater'
                  ? addSection(activeFloor.id)
                  : addTable(activeFloor.id)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#0a84ff]/20 py-3 text-sm font-semibold text-[#64b5ff]"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-white/40">
            {viewMode === 'overview'
              ? activeFloor.mode === 'theater'
                ? 'Tap a section to zoom in and edit seats'
                : 'Tap a table to zoom in and edit chairs'
              : activeFloor.mode === 'theater'
                ? 'Tap seats on the map to block unavailable ones'
                : 'Tap chairs to mark unavailable'}
          </p>
        </div>
      </div>

      <BottomSheet open={venueSheetOpen} onClose={() => setVenueSheetOpen(false)} title="Venue & stage">
        <div className="space-y-4 text-left">
          <label className="block text-sm">
            Floor name
            <input
              value={activeFloor.name}
              onChange={(e) => updateFloor(activeFloor.id, { name: e.target.value })}
              className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
            />
          </label>

          <div className="flex items-center justify-between rounded-[16px] bg-white/6 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Stage</p>
              <p className="ios-caption">Show stage on floor plan</p>
            </div>
            <button
              type="button"
              onClick={() =>
                updatePlan((prev) => ({
                  ...prev,
                  stage: { ...prev.stage, enabled: !prev.stage.enabled },
                }))
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                plan.stage.enabled ? 'bg-[#30d158]/20 text-[#30d158]' : 'bg-white/10 text-white/50'
              }`}
            >
              {plan.stage.enabled ? 'On' : 'Off'}
            </button>
          </div>

          {plan.stage.enabled && (
            <div>
              <p className="mb-2 text-xs text-white/50">Stage position</p>
              <StagePositionPicker
                position={plan.stage.position}
                onChange={(position) =>
                  updatePlan((prev) => ({ ...prev, stage: { ...prev.stage, position } }))
                }
              />
            </div>
          )}

          {plan.floors.length > 1 && (
            <button
              type="button"
              onClick={() => removeFloor(activeFloor.id)}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff453a]/15 py-3 text-sm font-medium text-[#ff453a]"
            >
              <Trash2 className="h-4 w-4" />
              Remove {activeFloor.name}
            </button>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        title={activeFloor.mode === 'theater' ? 'Section settings' : 'Table settings'}
      >
        {activeFloor.mode === 'theater' && activeSection && (
          <div className="space-y-4 text-left">
            <label className="block text-sm">
              Name
              <input
                value={activeSection.name}
                onChange={(e) => updateSection(activeFloor.id, activeSection.id, { name: e.target.value })}
                className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              Price per seat ($)
              <input
                type="number"
                min={0}
                value={activeSection.price}
                onChange={(e) =>
                  updateSection(activeFloor.id, activeSection.id, { price: Number(e.target.value) || 0 })
                }
                className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Rows
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={activeSection.rows}
                  onChange={(e) =>
                    resizeSection(activeFloor.id, activeSection.id, Number(e.target.value) || 2, activeSection.cols)
                  }
                  className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                Seats per row
                <input
                  type="number"
                  min={4}
                  max={16}
                  value={activeSection.cols}
                  onChange={(e) =>
                    resizeSection(activeFloor.id, activeSection.id, activeSection.rows, Number(e.target.value) || 4)
                  }
                  className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
                />
              </label>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Section color</p>
              <div className="flex flex-wrap gap-2">
                {SECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateSection(activeFloor.id, activeSection.id, { color })}
                    className={`h-9 w-9 rounded-full border-2 ${
                      activeSection.color === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {activeFloor.sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(activeFloor.id, activeSection.id)}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff453a]/15 py-3 text-sm font-medium text-[#ff453a]"
              >
                <Trash2 className="h-4 w-4" />
                Remove section
              </button>
            )}
          </div>
        )}

        {activeFloor.mode === 'dining' && activeTable && (
          <div className="space-y-4 text-left">
            <label className="block text-sm">
              Table name
              <input
                value={activeTable.label}
                onChange={(e) => updateTable(activeFloor.id, activeTable.id, { label: e.target.value })}
                className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              Price per seat ($)
              <input
                type="number"
                min={0}
                value={activeTable.pricePerSeat}
                onChange={(e) =>
                  updateTable(activeFloor.id, activeTable.id, {
                    pricePerSeat: Number(e.target.value) || 0,
                  })
                }
                className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              Chairs
              <input
                type="number"
                min={2}
                max={12}
                value={activeTable.chairs.length}
                onChange={(e) =>
                  resizeTable(activeFloor.id, activeTable.id, Number(e.target.value) || 2)
                }
                className="mt-1.5 w-full rounded-[14px] bg-white/10 px-3 py-2.5"
              />
            </label>
            <label className="flex items-center gap-3 rounded-[14px] bg-white/6 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={activeTable.blocked}
                onChange={(e) => updateTable(activeFloor.id, activeTable.id, { blocked: e.target.checked })}
                className="rounded"
              />
              Table unavailable
            </label>
            {activeFloor.tables.length > 1 && (
              <button
                type="button"
                onClick={() => removeTable(activeFloor.id, activeTable.id)}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff453a]/15 py-3 text-sm font-medium text-[#ff453a]"
              >
                <Trash2 className="h-4 w-4" />
                Remove table
              </button>
            )}
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={templateSheetOpen} onClose={() => setTemplateSheetOpen(false)} title="Load seating template">
        <div className="space-y-2">
          {templates.map((template) => {
            const summary = formatPlanSummary(template.plan)
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="flex w-full items-center justify-between rounded-[16px] liquid-glass-subtle px-4 py-3 text-left"
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="ios-caption">{summary}</p>
                </div>
                <span className="text-sm font-semibold text-[#0a84ff]">Use</span>
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </motion.div>
  )

  return createPortal(content, document.body)
}
