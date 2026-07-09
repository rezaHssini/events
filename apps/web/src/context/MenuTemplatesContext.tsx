import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type EventMenuConfig,
  type MenuTemplate,
  createDefaultEventMenu,
  templateFromConfig,
} from '../types/menu'

const DRAFT_KEY = 'event-menu-draft'
const TEMPLATES_KEY = 'event-menu-templates'

const BUILTIN_TEMPLATES: MenuTemplate[] = [
  {
    id: 'builtin-bar',
    name: 'Standard bar menu',
    menuType: 'Bar',
    savedAt: '',
    tabs: [
      { id: 'beverages', name: 'Beverages', emoji: '🍹' },
      { id: 'food', name: 'Food', emoji: '🍽️' },
    ],
    items: createDefaultEventMenu().items.filter((i) => i.tabId !== 'snacks'),
  },
]

function readTemplates(): MenuTemplate[] {
  try {
    const raw = sessionStorage.getItem(TEMPLATES_KEY)
    const saved = raw ? (JSON.parse(raw) as MenuTemplate[]) : []
    return [...BUILTIN_TEMPLATES, ...saved.filter((t) => !t.id.startsWith('builtin-'))]
  } catch {
    return BUILTIN_TEMPLATES
  }
}

function readDraft(): EventMenuConfig | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as EventMenuConfig) : null
  } catch {
    return null
  }
}

type MenuTemplatesContextValue = {
  templates: MenuTemplate[]
  draftMenu: EventMenuConfig
  setDraftMenu: (menu: EventMenuConfig) => void
  saveTemplate: (name: string, menu: EventMenuConfig) => MenuTemplate
  deleteTemplate: (id: string) => void
  getCheckoutMenu: () => EventMenuConfig
}

const MenuTemplatesContext = createContext<MenuTemplatesContextValue | null>(null)

export function MenuTemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<MenuTemplate[]>(readTemplates)
  const [draftMenu, setDraftMenuState] = useState<EventMenuConfig>(
    () => readDraft() ?? createDefaultEventMenu(),
  )

  const persistTemplates = (next: MenuTemplate[]) => {
    setTemplates(next)
    const custom = next.filter((t) => !t.id.startsWith('builtin-'))
    sessionStorage.setItem(TEMPLATES_KEY, JSON.stringify(custom))
  }

  const setDraftMenu = useCallback((menu: EventMenuConfig) => {
    setDraftMenuState(menu)
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(menu))
  }, [])

  const saveTemplate = useCallback((name: string, menu: EventMenuConfig) => {
    const template = templateFromConfig(menu, name.trim() || 'My menu')
    const next = [...templates.filter((t) => t.id !== template.id), template]
    persistTemplates(next)
    return template
  }, [templates])

  const deleteTemplate = useCallback((id: string) => {
    if (id.startsWith('builtin-')) return
    persistTemplates(templates.filter((t) => t.id !== id))
  }, [templates])

  const getCheckoutMenu = useCallback(() => draftMenu, [draftMenu])

  const value = useMemo(
    () => ({
      templates,
      draftMenu,
      setDraftMenu,
      saveTemplate,
      deleteTemplate,
      getCheckoutMenu,
    }),
    [templates, draftMenu, setDraftMenu, saveTemplate, deleteTemplate, getCheckoutMenu],
  )

  return (
    <MenuTemplatesContext.Provider value={value}>{children}</MenuTemplatesContext.Provider>
  )
}

export function useMenuTemplates() {
  const ctx = useContext(MenuTemplatesContext)
  if (!ctx) throw new Error('useMenuTemplates must be used within MenuTemplatesProvider')
  return ctx
}
