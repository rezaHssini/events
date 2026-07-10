export type StagePosition = 'top' | 'bottom' | 'left' | 'right'

export type StageConfig = {
  enabled: boolean
  position: StagePosition
}

export type FloorMode = 'theater' | 'dining'

export type SeatCell = {
  id: string
  row: number
  col: number
  blocked: boolean
}

export type SeatingSection = {
  id: string
  name: string
  color: string
  price: number
  rows: number
  cols: number
  seats: SeatCell[]
}

export type DiningChair = {
  id: string
  blocked: boolean
}

export type DiningTable = {
  id: string
  label: string
  pricePerSeat: number
  blocked: boolean
  chairs: DiningChair[]
}

export type SeatingFloor = {
  id: string
  name: string
  mode: FloorMode
  sections: SeatingSection[]
  tables: DiningTable[]
}

export type SeatingPlan = {
  stage: StageConfig
  floors: SeatingFloor[]
}

/** Legacy shape kept for migration from older saved plans */
export type LegacySeatingPlan = {
  sections: SeatingSection[]
}

export const SECTION_COLORS = ['#0a84ff', '#bf5af2', '#30d158', '#ffd60a', '#ff453a', '#64d2ff'] as const

export const STAGE_POSITIONS: { value: StagePosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

export function buildSectionSeats(rows: number, cols: number, sectionId: string): SeatCell[] {
  const seats: SeatCell[] = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const rowLabel = String.fromCharCode(65 + r)
      seats.push({
        id: `${sectionId}-${rowLabel}${c + 1}`,
        row: r,
        col: c,
        blocked: false,
      })
    }
  }
  return seats
}

export function buildTableChairs(tableId: string, count: number): DiningChair[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${tableId}-chair-${i + 1}`,
    blocked: false,
  }))
}

export function createDefaultSection(index: number, floorId: string): SeatingSection {
  const id = `${floorId}-section-${index}`
  const rows = 4
  const cols = 8
  return {
    id,
    name: index === 0 ? 'Orchestra' : index === 1 ? 'Balcony' : `Section ${index + 1}`,
    color: SECTION_COLORS[index % SECTION_COLORS.length],
    price: index === 0 ? 85 : index === 1 ? 55 : 35,
    rows,
    cols,
    seats: buildSectionSeats(rows, cols, id),
  }
}

export function createDefaultTable(index: number, floorId: string): DiningTable {
  const id = `${floorId}-table-${index}`
  const chairs = 4
  return {
    id,
    label: `Table ${index + 1}`,
    pricePerSeat: 45,
    blocked: false,
    chairs: buildTableChairs(id, chairs),
  }
}

export function createDefaultFloor(index: number, mode: FloorMode = 'theater'): SeatingFloor {
  const id = `floor-${index}`
  return {
    id,
    name: index === 0 ? 'Ground floor' : index === 1 ? 'Mezzanine' : `Floor ${index + 1}`,
    mode,
    sections: mode === 'theater' ? [createDefaultSection(0, id), createDefaultSection(1, id)] : [],
    tables: mode === 'dining' ? [createDefaultTable(0, id), createDefaultTable(1, id)] : [],
  }
}

export function createDefaultPlan(): SeatingPlan {
  return {
    stage: { enabled: true, position: 'top' },
    floors: [createDefaultFloor(0, 'theater')],
  }
}

export function normalizePlan(plan: SeatingPlan | LegacySeatingPlan | null | undefined): SeatingPlan {
  if (!plan) return createDefaultPlan()
  if ('floors' in plan) return plan
  return {
    stage: { enabled: true, position: 'top' },
    floors: [
      {
        id: 'floor-0',
        name: 'Ground floor',
        mode: 'theater',
        sections: plan.sections,
        tables: [],
      },
    ],
  }
}

export function planStats(plan: SeatingPlan) {
  let seats = 0
  let revenue = 0
  let sectionCount = 0
  let tableCount = 0

  for (const floor of plan.floors) {
    if (floor.mode === 'theater') {
      sectionCount += floor.sections.length
      for (const section of floor.sections) {
        const available = section.seats.filter((s) => !s.blocked).length
        seats += available
        revenue += available * section.price
      }
    } else {
      tableCount += floor.tables.length
      for (const table of floor.tables) {
        if (table.blocked) continue
        const available = table.chairs.filter((c) => !c.blocked).length
        seats += available
        revenue += available * table.pricePerSeat
      }
    }
  }

  return {
    seats,
    revenue,
    floorCount: plan.floors.length,
    sectionCount,
    tableCount,
  }
}

export function formatPlanSummary(plan: SeatingPlan): string {
  const stats = planStats(plan)
  const parts: string[] = []
  if (stats.floorCount > 0) parts.push(`${stats.floorCount} floor${stats.floorCount === 1 ? '' : 's'}`)
  if (stats.sectionCount > 0) parts.push(`${stats.sectionCount} section${stats.sectionCount === 1 ? '' : 's'}`)
  if (stats.tableCount > 0) parts.push(`${stats.tableCount} table${stats.tableCount === 1 ? '' : 's'}`)
  parts.push(`${stats.seats} seats`)
  return parts.join(' · ')
}

export type SeatingPlanTemplate = {
  id: string
  name: string
  savedAt: string
  plan: SeatingPlan
}

export function clonePlan(plan: SeatingPlan): SeatingPlan {
  return JSON.parse(JSON.stringify(plan)) as SeatingPlan
}

export function planFromTemplate(template: SeatingPlanTemplate): SeatingPlan {
  return clonePlan(template.plan)
}

export function templateFromPlan(plan: SeatingPlan, name: string): SeatingPlanTemplate {
  return {
    id: `seat-${Date.now()}`,
    name,
    savedAt: new Date().toISOString(),
    plan: clonePlan(plan),
  }
}

export function createDiningPlan(): SeatingPlan {
  return {
    stage: { enabled: false, position: 'top' },
    floors: [
      createDefaultFloor(0, 'dining'),
      {
        ...createDefaultFloor(1, 'dining'),
        tables: [
          createDefaultTable(0, 'floor-1'),
          createDefaultTable(1, 'floor-1'),
          createDefaultTable(2, 'floor-1'),
        ],
      },
    ],
  }
}
