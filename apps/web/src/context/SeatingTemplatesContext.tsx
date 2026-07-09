import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type SeatingPlan,
  type SeatingPlanTemplate,
  createDefaultPlan,
  createDiningPlan,
  templateFromPlan,
} from '../types/seating'

const TEMPLATES_KEY = 'event-seating-templates'

const BUILTIN_TEMPLATES: SeatingPlanTemplate[] = [
  {
    id: 'builtin-theater',
    name: 'Two-section theater',
    savedAt: '',
    plan: createDefaultPlan(),
  },
  {
    id: 'builtin-restaurant',
    name: 'Restaurant floor',
    savedAt: '',
    plan: createDiningPlan(),
  },
]

function readTemplates(): SeatingPlanTemplate[] {
  try {
    const raw = sessionStorage.getItem(TEMPLATES_KEY)
    const saved = raw ? (JSON.parse(raw) as SeatingPlanTemplate[]) : []
    return [...BUILTIN_TEMPLATES, ...saved.filter((t) => !t.id.startsWith('builtin-'))]
  } catch {
    return BUILTIN_TEMPLATES
  }
}

type SeatingTemplatesContextValue = {
  templates: SeatingPlanTemplate[]
  saveTemplate: (name: string, plan: SeatingPlan) => SeatingPlanTemplate
  deleteTemplate: (id: string) => void
}

const SeatingTemplatesContext = createContext<SeatingTemplatesContextValue | null>(null)

export function SeatingTemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<SeatingPlanTemplate[]>(readTemplates)

  const persistTemplates = (next: SeatingPlanTemplate[]) => {
    setTemplates(next)
    const custom = next.filter((t) => !t.id.startsWith('builtin-'))
    sessionStorage.setItem(TEMPLATES_KEY, JSON.stringify(custom))
  }

  const saveTemplate = useCallback(
    (name: string, plan: SeatingPlan) => {
      const template = templateFromPlan(plan, name.trim() || 'My seating plan')
      const next = [...templates.filter((t) => t.id !== template.id), template]
      persistTemplates(next)
      return template
    },
    [templates],
  )

  const deleteTemplate = useCallback(
    (id: string) => {
      if (id.startsWith('builtin-')) return
      persistTemplates(templates.filter((t) => t.id !== id))
    },
    [templates],
  )

  const value = useMemo(
    () => ({ templates, saveTemplate, deleteTemplate }),
    [templates, saveTemplate, deleteTemplate],
  )

  return (
    <SeatingTemplatesContext.Provider value={value}>{children}</SeatingTemplatesContext.Provider>
  )
}

export function useSeatingTemplates() {
  const ctx = useContext(SeatingTemplatesContext)
  if (!ctx) throw new Error('useSeatingTemplates must be used within SeatingTemplatesProvider')
  return ctx
}
