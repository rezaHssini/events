import { memo } from 'react'
import { Map, List, SlidersHorizontal, ChevronDown, Calendar } from 'lucide-react'
import { ExplorerFilterIconButton } from './ExplorerFiltersSheet'

type Tab = { id: 'nearby' | 'trends' | 'following'; label: string }

type ExplorerHeaderProps = {
  compact: boolean
  tab: Tab['id']
  tabs: Tab[]
  onTabChange: (id: Tab['id']) => void
  dateButtonLabel: string
  filterBadgeCount: number
  showFilterSheet: boolean
  activeFilterCount: number
  viewMode: 'list' | 'map'
  onViewModeChange: (mode: 'list' | 'map') => void
  onOpenDateSheet: () => void
  onOpenFilterSheet: () => void
}

export const ExplorerHeader = memo(function ExplorerHeader({
  compact,
  tab,
  tabs,
  onTabChange,
  dateButtonLabel,
  filterBadgeCount,
  showFilterSheet,
  activeFilterCount,
  viewMode,
  onViewModeChange,
  onOpenDateSheet,
  onOpenFilterSheet,
}: ExplorerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-2">
      <div
        className={`floating-top-bar overflow-hidden rounded-[22px] px-4 py-3 ${
          compact ? 'floating-top-bar-compact' : ''
        }`}
      >
        <h1 className="ios-large-title text-left !text-[28px] !leading-8">Discover</h1>
        <p className={`ios-caption mt-0.5 text-left ${compact ? 'sr-only' : ''}`}>
          Find events near you
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-0.5 rounded-[14px] liquid-glass-subtle p-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`relative flex-1 rounded-xl py-2.5 text-sm font-medium ${
                  tab === t.id ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
                }`}
              >
                {tab === t.id && <div className="absolute inset-0 rounded-xl bg-white/14" />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
          {compact && (
            <ExplorerFilterIconButton onClick={onOpenFilterSheet} badgeCount={filterBadgeCount} />
          )}
        </div>

        <div className={compact ? 'hidden' : 'mt-3'}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDateSheet}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#0a84ff] px-3 py-1.5 text-xs font-medium text-white"
            >
              <Calendar className="h-3.5 w-3.5" />
              {dateButtonLabel}
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </button>
            <button
              type="button"
              onClick={onOpenFilterSheet}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                showFilterSheet ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white/20 px-1.5">{activeFilterCount}</span>
              )}
            </button>
            {tab === 'nearby' && (
              <div className="flex shrink-0 rounded-xl liquid-glass-subtle p-0.5">
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-white/15' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('map')}
                  className={`rounded-lg p-2 ${viewMode === 'map' ? 'bg-white/15' : ''}`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
})
