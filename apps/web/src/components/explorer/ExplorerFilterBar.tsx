import { Calendar, List, Map, SlidersHorizontal } from 'lucide-react'
import { formatDateRangeLabel, type DateRange } from '../../utils/explorerDateRange'

const CATEGORY_FILTERS = ['Music', 'Free', '21+', 'Standing'] as const

type ExplorerTab = 'nearby' | 'trends' | 'following'
type ViewMode = 'list' | 'map'

export function ExplorerFilterBar({
  tab,
  onTabChange,
  viewMode,
  onViewModeChange,
  dateRange,
  onOpenDatePicker,
  activeFilters,
  onToggleCategoryFilter,
  onClearFilters,
  onOpenMobileFilters,
  filterBadgeCount,
}: {
  tab: ExplorerTab
  onTabChange: (tab: ExplorerTab) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  dateRange: DateRange
  onOpenDatePicker: () => void
  activeFilters: string[]
  onToggleCategoryFilter: (f: string) => void
  onClearFilters: () => void
  onOpenMobileFilters?: () => void
  filterBadgeCount?: number
}) {
  const tabs: { id: ExplorerTab; label: string }[] = [
    { id: 'nearby', label: 'Nearby' },
    { id: 'trends', label: 'Trending' },
    { id: 'following', label: 'Following' },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-white/6 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id ? 'bg-[#0a84ff] text-white' : 'text-[rgba(235,235,245,0.55)] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="hidden h-5 w-px bg-white/10 sm:block" />

        <button
          type="button"
          onClick={onOpenDatePicker}
          className="flex items-center gap-1.5 rounded-lg bg-white/6 px-2.5 py-1.5 text-xs font-medium hover:bg-white/10"
        >
          <Calendar className="h-3.5 w-3.5 text-[#0a84ff]" />
          {formatDateRangeLabel(dateRange)}
        </button>

        <div className="hidden h-5 w-px bg-white/10 md:block" />

        <div className="hidden flex-wrap gap-1 md:flex">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onToggleCategoryFilter(f)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                activeFilters.includes(f)
                  ? 'bg-[#0a84ff] text-white'
                  : 'bg-white/8 text-[rgba(235,235,245,0.55)] hover:bg-white/12'
              }`}
            >
              {f}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2 py-1 text-[11px] font-medium text-[#0a84ff]"
            >
              Clear
            </button>
          )}
        </div>

        {tab === 'nearby' && (
          <>
            <div className="ml-auto hidden h-5 w-px bg-white/10 sm:block" />
            <div className="flex rounded-lg bg-white/6 p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  viewMode === 'list' ? 'bg-white/14 text-white' : 'text-[rgba(235,235,245,0.55)]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('map')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  viewMode === 'map' ? 'bg-white/14 text-white' : 'text-[rgba(235,235,245,0.55)]'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                Map
              </button>
            </div>
          </>
        )}

        {onOpenMobileFilters && (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="relative ml-auto flex items-center gap-1 rounded-lg bg-white/6 px-2.5 py-1.5 text-xs font-medium md:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {filterBadgeCount != null && filterBadgeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a84ff] px-1 text-[9px] font-bold">
                {filterBadgeCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
