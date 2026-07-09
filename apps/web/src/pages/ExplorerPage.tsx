import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../components/UI'
import { ExplorerEventCard } from '../components/explorer/ExplorerEventCard'
import { ExplorerFilterBar } from '../components/explorer/ExplorerFilterBar'
import { FeedMemoryPost, FeedAnnouncementPost } from '../components/feed/FeedPosts'
import { ExplorerDateRangeSheet } from '../components/explorer/ExplorerDateRangeSheet'
import {
  ExplorerFiltersSheet,
} from '../components/explorer/ExplorerFiltersSheet'
import {
  eventInDateRange,
  formatDateRangeLabel,
  todayRange,
  type DateRange,
} from '../utils/explorerDateRange'
import {
  events,
  feedPostsNearby,
  feedPostsTrending,
  feedPostsFollowing,
} from '../data/mockData'
import { userProfiles } from '../data/socialData'
import { useSocial } from '../context/SocialContext'
import { useUserSettings } from '../context/UserSettingsContext'
import { EventMap } from '../components/ui/EventMap'
import { EventCardSkeleton, MapBlockSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { WebPageHeader } from '../components/layout/WebLayout'

import type { Event } from '../data/mockData'

type ExplorerTab = 'nearby' | 'trends' | 'following'
type ViewMode = 'list' | 'map'

function matchesCategoryFilter(event: Event, filter: string): boolean {
  switch (filter) {
    case 'Music':
      return event.category === 'Music' || event.category === 'Nightlife'
    case 'Free':
      return event.price === 'free'
    case '21+':
      return event.ageRestriction.includes('21')
    case 'Standing':
      return event.format === 'standing'
    default:
      return true
  }
}

function eventPassesFilters(
  event: Event,
  dateRange: DateRange,
  categoryFilters: string[],
): boolean {
  if (!eventInDateRange(event, dateRange)) return false
  if (categoryFilters.length === 0) return true
  return categoryFilters.every((f) => matchesCategoryFilter(event, f))
}

function defaultExplorerFilters(_preferred: string[]): string[] {
  return []
}

export default function ExplorerPage() {
  const [searchParams] = useSearchParams()
  const { prefs } = useUserSettings()
  const initialTab = (searchParams.get('tab') as ExplorerTab) || 'nearby'
  const [tab, setTab] = useState<ExplorerTab>(initialTab)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>(() => todayRange())
  const [activeFilters, setActiveFilters] = useState<string[]>(() =>
    defaultExplorerFilters(prefs.preferredCategories),
  )
  const [selectedPin, setSelectedPin] = useState(events[0].id)
  const { isFollowing, getProfile } = useSocial()

  const followedCreatorPosts = feedPostsFollowing.filter((post) => {
    if (post.type === 'event') {
      const profile = getProfile(post.event.creator.handle)
      const creatorOk = profile?.isCreator && isFollowing(profile.id)
      return creatorOk && eventPassesFilters(post.event, dateRange, activeFilters)
    }
    if (post.type === 'announcement') {
      const profile = getProfile(post.creator.handle)
      return profile?.isCreator && isFollowing(profile.id)
    }
    if (post.type === 'memory') {
      return true
    }
    return false
  })

  const followedCreators = userProfiles.filter((u) => u.isCreator && isFollowing(u.id))

  const filteredNearbyPosts = feedPostsNearby.filter(
    (post) =>
      post.type === 'event' && eventPassesFilters(post.event, dateRange, activeFilters),
  )
  const filteredMapEvents = events.filter((e) => eventPassesFilters(e, dateRange, activeFilters))
  const filteredTrendingPosts = feedPostsTrending.filter((post) => {
    if (post.type === 'event') {
      return eventPassesFilters(post.event, dateRange, activeFilters)
    }
    return true
  })
  const selectedEvent = filteredMapEvents.find((e) => e.id === selectedPin) ?? filteredMapEvents[0]

  const toggleCategoryFilter = (f: string) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  const filterLabel = [formatDateRangeLabel(dateRange), ...activeFilters].filter(Boolean).join(', ')
  const filterBadgeCount =
    activeFilters.length + (formatDateRangeLabel(dateRange) !== 'Today' ? 1 : 0)

  const openDatePicker = () => {
    setShowFilterSheet(false)
    setShowDateSheet(true)
  }

  const explorerQueryKey = `${tab}-${viewMode}-${formatDateRangeLabel(dateRange)}-${activeFilters.join(',')}`
  const { isLoading: contentLoading } = useSimulatedQuery(true, [explorerQueryKey], {
    delay: 550,
  })

  const filterProps = {
    tab,
    onTabChange: setTab,
    viewMode,
    onViewModeChange: setViewMode,
    dateRange,
    onOpenDatePicker: () => setShowDateSheet(true),
    activeFilters,
    onToggleCategoryFilter: toggleCategoryFilter,
    onClearFilters: () => {
      setDateRange(todayRange())
      setActiveFilters([])
    },
    onOpenMobileFilters: () => setShowFilterSheet(true),
    filterBadgeCount,
  }

  const mainContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${tab}-${viewMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Mobile filter bar */}
        <div className="mb-4 lg:hidden">
          <ExplorerFilterBar {...filterProps} />
        </div>

        {contentLoading ? (
          <>
            {tab === 'nearby' && viewMode === 'map' ? (
              <>
                <MapBlockSkeleton height={360} />
                <div className="mt-3 flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-surface-2" />
                  ))}
                </div>
              </>
            ) : (
              <div className="web-event-grid">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <>
            {tab === 'nearby' && viewMode === 'map' && selectedEvent && (
              <>
                <EventMap
                  lat={selectedEvent.lat}
                  lng={selectedEvent.lng}
                  label={`${selectedEvent.location} · ${selectedEvent.address}`}
                  height={360}
                />
                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {filteredMapEvents.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedPin(e.id)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                        selectedPin === e.id ? 'bg-[#0a84ff]' : 'liquid-glass-subtle'
                      }`}
                    >
                      {e.price === 'free' ? 'FREE' : `$${e.price}`} · {e.title.slice(0, 18)}
                    </button>
                  ))}
                </div>
                <Link
                  key={selectedEvent.id}
                  to="/event"
                  state={{ eventId: selectedEvent.id }}
                  className="mt-4 flex gap-3 rounded-2xl liquid-glass-subtle p-3"
                >
                  <img src={selectedEvent.cover} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="text-left">
                    <p className="font-semibold">{selectedEvent.title}</p>
                    <p className="text-sm text-slate-400">
                      {selectedEvent.date} · {selectedEvent.location}
                    </p>
                    <Badge variant="success">Nearby</Badge>
                  </div>
                </Link>
              </>
            )}

            {tab === 'nearby' && viewMode === 'list' && (
              <>
                <p className="mb-4 text-left text-sm text-slate-400">
                  {filteredNearbyPosts.length} events nearby
                  {filterLabel && ` · ${filterLabel}`}
                </p>
                {filteredNearbyPosts.length === 0 ? (
                  <div className="rounded-2xl glass p-8 text-center">
                    <p className="font-semibold">No events match your filters</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDateRange(todayRange())
                        setActiveFilters([])
                      }}
                      className="mt-3 text-sm text-[#0a84ff]"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="web-event-grid">
                    {filteredNearbyPosts.map((post, i) => (
                      <ExplorerEventCard
                        key={`nearby-${post.event.id}-${i}`}
                        event={post.event}
                        distance={'distance' in post ? post.distance : undefined}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'trends' && (
              <>
                <p className="mb-4 text-left text-sm text-slate-400">
                  Trending in LA
                  {filterLabel && ` · ${filterLabel}`}
                </p>
                <div className="web-event-grid">
                  {filteredTrendingPosts.map((post, i) =>
                    post.type === 'event' ? (
                      <ExplorerEventCard
                        key={`${post.event.id}-${post.trendingRank ?? i}`}
                        event={post.event}
                        trendingRank={'trendingRank' in post ? post.trendingRank : undefined}
                      />
                    ) : post.type === 'memory' ? (
                      <div key={`trend-memory-${i}`} className="md:col-span-2 xl:col-span-3">
                        <FeedMemoryPost memory={post.memory} />
                      </div>
                    ) : null,
                  )}
                </div>
              </>
            )}

            {tab === 'following' && (
              <>
                {followedCreators.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {followedCreators.map((creator) => (
                      <Link
                        key={creator.id}
                        to={`/page/${creator.handle}`}
                        className="flex items-center gap-2 rounded-full glass px-3 py-1.5"
                      >
                        <img src={creator.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                        <span className="text-xs font-medium">{creator.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {followedCreatorPosts.length > 0 ? (
                  <>
                    <p className="mb-4 text-left text-sm text-slate-400">
                      {followedCreatorPosts.length} posts from people & planners you follow
                      {filterLabel && ` · ${filterLabel}`}
                    </p>
                    <div className="web-event-grid">
                      {followedCreatorPosts.map((post, i) => (
                        <div
                          key={
                            post.type === 'event'
                              ? `following-event-${post.event.id}-${i}`
                              : post.type === 'memory'
                                ? `following-memory-${post.memory.id}-${i}`
                                : `following-ann-${post.creator.handle}-${i}`
                          }
                          className={post.type !== 'event' ? 'md:col-span-2 xl:col-span-3' : ''}
                        >
                          {post.type === 'event' && (
                            <ExplorerEventCard event={post.event} />
                          )}
                          {post.type === 'memory' && <FeedMemoryPost memory={post.memory} />}
                          {post.type === 'announcement' && (
                            <FeedAnnouncementPost creator={post.creator} text={post.text} />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl glass p-8 text-center">
                    <p className="text-4xl">🎪</p>
                    <p className="mt-3 font-semibold">No posts from people you follow</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Follow friends and planners to see their posts here
                    </p>
                    <Link
                      to="/explorer?tab=trends"
                      className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
                    >
                      Discover planners
                    </Link>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <WebPageHeader
        title="Explore"
        subtitle="Discover events near you"
      />
      <div className="web-container pb-10">
        <div className="mb-5 hidden lg:block">
          <ExplorerFilterBar {...filterProps} />
        </div>
        {mainContent}
      </div>

      <ExplorerFiltersSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        tab={tab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        onOpenDatePicker={openDatePicker}
        activeFilters={activeFilters}
        onToggleCategoryFilter={toggleCategoryFilter}
        onClear={() => {
          setDateRange(todayRange())
          setActiveFilters([])
        }}
      />

      <ExplorerDateRangeSheet
        open={showDateSheet}
        range={dateRange}
        onClose={() => setShowDateSheet(false)}
        onApply={(range) => {
          setDateRange(range)
          setShowDateSheet(false)
        }}
      />
    </>
  )
}
