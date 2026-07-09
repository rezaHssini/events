import { Calendar, List, Map, SlidersHorizontal } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { formatDateRangeLabel, type DateRange } from '../../utils/explorerDateRange'

const CATEGORY_FILTERS = ['Music', 'Free', '21+', 'Standing'] as const

type ExplorerTab = 'nearby' | 'trends' | 'following'
type ViewMode = 'list' | 'map'

export function ExplorerFiltersSheet({
  open,
  onClose,
  tab,
  viewMode,
  onViewModeChange,
  dateRange,
  onOpenDatePicker,
  activeFilters,
  onToggleCategoryFilter,
  onClear,
}: {
  open: boolean
  onClose: () => void
  tab: ExplorerTab
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  dateRange: DateRange
  onOpenDatePicker: () => void
  activeFilters: string[]
  onToggleCategoryFilter: (filter: string) => void
  onClear: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filters">
      <div className="space-y-5 text-left">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
            When
          </p>
          <button
            type="button"
            onClick={onOpenDatePicker}
            className="flex w-full items-center justify-between rounded-[16px] liquid-glass-subtle px-4 py-3.5"
          >
            <span className="flex items-center gap-2 text-[15px] font-medium">
              <Calendar className="h-4 w-4 text-[#0a84ff]" />
              {formatDateRangeLabel(dateRange)}
            </span>
            <span className="text-sm text-[#0a84ff]">Change</span>
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onToggleCategoryFilter(f)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeFilters.includes(f) ? 'bg-[#0a84ff] text-white' : 'bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {tab === 'nearby' && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
              View
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-medium ${
                  viewMode === 'list' ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('map')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-medium ${
                  viewMode === 'map' ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
                }`}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-[14px] py-3.5 text-[17px] font-medium text-[#0a84ff]"
          >
            Clear all
          </button>
          <button type="button" onClick={onClose} className="ios-button flex-1 py-3.5 text-[17px]">
            Apply
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

export function ExplorerFilterIconButton({
  onClick,
  badgeCount,
}: {
  onClick: () => void
  badgeCount: number
}) {
  return (
    <button
      type="button"
      aria-label="Open filters"
      onClick={onClick}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full liquid-glass-subtle"
    >
      <SlidersHorizontal className="h-4 w-4" />
      {badgeCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a84ff] px-1 text-[10px] font-bold text-white ring-2 ring-black/30">
          {badgeCount}
        </span>
      )}
    </button>
  )
}
