import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export const MAIN_TAB_ROUTES = ['/feed', '/explorer', '/my-events', '/planner'] as const
export type MainTabRoute = (typeof MAIN_TAB_ROUTES)[number]

export function isMainTabRoute(path: string): path is MainTabRoute {
  return (MAIN_TAB_ROUTES as readonly string[]).includes(path)
}

export function useMainBack(fallback: MainTabRoute = '/feed') {
  const navigate = useNavigate()
  const location = useLocation()

  const fromTab = (location.state as { fromTab?: string } | null)?.fromTab
  const target = fromTab && isMainTabRoute(fromTab) ? fromTab : fallback

  return () => navigate(target)
}

export function MainBackButton({
  fallback = '/feed',
  label = 'Back',
}: {
  fallback?: MainTabRoute
  label?: string
}) {
  const goBack = useMainBack(fallback)

  return (
    <button
      type="button"
      onClick={goBack}
      className="flex items-center gap-1 rounded-full liquid-glass-subtle px-3 py-1.5 text-sm text-[rgba(235,235,245,0.8)] transition-transform active:scale-95"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  )
}

export function mainTabLinkState(fromTab: MainTabRoute = '/feed') {
  return { fromTab }
}

/** Use on Link/navigate when opening a full-screen page from a main tab */
export function withMainTabState(
  to: string,
  fromTab: MainTabRoute = '/feed',
): { to: string; state: { fromTab: MainTabRoute } } {
  return { to, state: { fromTab } }
}

export function MainBackLink({
  fallback = '/feed',
  label = 'Back',
}: {
  fallback?: MainTabRoute
  label?: string
}) {
  const location = useLocation()
  const fromTab = (location.state as { fromTab?: string } | null)?.fromTab
  const to = fromTab && isMainTabRoute(fromTab) ? fromTab : fallback

  return (
    <Link
      to={to}
      className="flex items-center gap-1 rounded-full liquid-glass-subtle px-3 py-1.5 text-sm text-[rgba(235,235,245,0.8)]"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}
