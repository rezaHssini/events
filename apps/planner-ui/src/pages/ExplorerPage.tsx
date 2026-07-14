import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EventCard, Badge } from '../components/UI'
import { FeedMemoryPost, FeedAnnouncementPost } from '../components/feed/FeedPosts'
import { ExplorerHeader } from '../components/explorer/ExplorerHeader'
import { ExplorerDateRangeSheet } from '../components/explorer/ExplorerDateRangeSheet'
import { ExplorerFiltersSheet } from '../components/explorer/ExplorerFiltersSheet'
import { InteractiveMap } from '../components/ui/InteractiveMap'
import {
  eventInDateRange,
  formatDateRangeLabel,
  defaultExplorerRange,
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

import type { Event } from '../data/mockData'

type ExplorerTab = 'nearby' | 'trends' | 'following'
type ViewMode = 'list' | 'map'

const COMPACT_ENTER_Y = 64
const COMPACT_EXIT_Y = 12

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

function defaultExplorerFilters(preferred: string[]): string[] {
  const filters: string[] = []
  if (preferred.some((c) => c === 'Music' || c === 'Nightlife')) {
    filters.push('Music')
  }
  return filters.length > 0 ? filters : ['Music']
}

export default function ExplorerPage() {
  const [searchParams] = useSearchParams()
  const { prefs } = useUserSettings()
  const initialTab = (searchParams.get('tab') as ExplorerTab) || 'nearby'
  const [tab, setTab] = useState<ExplorerTab>(initialTab)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultExplorerRange())
  const [activeFilters, setActiveFilters] = useState<string[]>(() =>
    defaultExplorerFilters(prefs.preferredCategories),
  )
  const [selectedPin, setSelectedPin] = useState(events[0].id)
  const [compact, setCompact] = useState(false)
  const compactRef = useRef(false)
  const lastScrollYRef = useRef(0)
  const { isFollowing, getProfile } = useSocial()

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const scrollingDown = y > lastScrollYRef.current
        lastScrollYRef.current = y

        let next = compactRef.current
        if (!compactRef.current && y > COMPACT_ENTER_Y && scrollingDown) {
          next = true
        } else if (compactRef.current && y < COMPACT_EXIT_Y && !scrollingDown) {
          next = false
        }

        if (next !== compactRef.current) {
          compactRef.current = next
          setCompact(next)
        }
      })
    }
    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const filteredMapEvents = useMemo(
    () => events.filter((e) => eventPassesFilters(e, dateRange, activeFilters)),
    [dateRange, activeFilters],
  )

  const filteredNearbyPosts = useMemo(
    () =>
      feedPostsNearby.filter(
        (post) =>
          post.type === 'event' && eventPassesFilters(post.event, dateRange, activeFilters),
      ),
    [dateRange, activeFilters],
  )

  const filteredTrendingPosts = useMemo(
    () =>
      feedPostsTrending.filter((post) => {
        if (post.type === 'event') {
          return eventPassesFilters(post.event, dateRange, activeFilters)
        }
        return true
      }),
    [dateRange, activeFilters],
  )

  const followedCreatorPosts = useMemo(
    () =>
      feedPostsFollowing.filter((post) => {
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
      }),
    [dateRange, activeFilters, getProfile, isFollowing],
  )

  const followedCreators = useMemo(
    () => userProfiles.filter((u) => u.isCreator && isFollowing(u.id)),
    [isFollowing],
  )

  const selectedEvent =
    filteredMapEvents.find((e) => e.id === selectedPin) ?? filteredMapEvents[0]

  useEffect(() => {
    if (filteredMapEvents.length > 0 && !filteredMapEvents.some((e) => e.id === selectedPin)) {
      setSelectedPin(filteredMapEvents[0].id)
    }
  }, [filteredMapEvents, selectedPin])

  const tabs = useMemo(
    () =>
      [
        { id: 'nearby' as const, label: 'Nearby' },
        { id: 'trends' as const, label: 'Trends' },
        { id: 'following' as const, label: 'Following' },
      ] as const,
    [],
  )

  const toggleCategoryFilter = (f: string) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  const filterLabel = [formatDateRangeLabel(dateRange), ...activeFilters].filter(Boolean).join(', ')
  const dateButtonLabel = formatDateRangeLabel(dateRange)
  const filterBadgeCount =
    activeFilters.length + (formatDateRangeLabel(dateRange) !== 'Today' ? 1 : 0)

  const mapPins = useMemo(
    () =>
      filteredMapEvents.map((e) => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        label: e.title,
        selected: e.id === selectedPin,
        onSelect: () => setSelectedPin(e.id),
      })),
    [filteredMapEvents, selectedPin],
  )

  return (
    <div className="min-h-screen">
      <ExplorerHeader
        compact={compact}
        tab={tab}
        tabs={[...tabs]}
        onTabChange={setTab}
        dateButtonLabel={dateButtonLabel}
        filterBadgeCount={filterBadgeCount}
        showFilterSheet={showFilterSheet}
        activeFilterCount={activeFilters.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenDateSheet={() => setShowDateSheet(true)}
        onOpenFilterSheet={() => setShowFilterSheet(true)}
      />

      <div className="p-4">
        {tab === 'nearby' && viewMode === 'map' && (
          <>
            <InteractiveMap
              pins={mapPins}
              height={300}
              caption={
                selectedEvent
                  ? `${selectedEvent.location} · ${selectedEvent.address}`
                  : undefined
              }
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
            {selectedEvent ? (
              <Link
                to="/event"
                state={{ eventId: selectedEvent.id }}
                className="mt-3 flex gap-3 rounded-2xl liquid-glass-subtle p-3"
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
            ) : (
              <div className="mt-3 rounded-2xl glass p-6 text-center text-sm text-slate-400">
                No events match your filters on the map
              </div>
            )}
          </>
        )}

        {tab === 'nearby' && viewMode === 'list' && (
          <>
            <p className="mb-3 text-left text-sm text-slate-400">
              {filteredNearbyPosts.length} events nearby
              {filterLabel && ` · ${filterLabel}`}
            </p>
            {filteredNearbyPosts.length === 0 ? (
              <div className="rounded-2xl glass p-8 text-center">
                <p className="font-semibold">No events match your filters</p>
                <button
                  type="button"
                  onClick={() => {
                    setDateRange(defaultExplorerRange())
                    setActiveFilters([])
                  }}
                  className="mt-3 text-sm text-[#0a84ff]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredNearbyPosts.map((post, i) => (
                <EventCard
                  key={`nearby-${post.event.id}-${i}`}
                  event={post.event}
                  distance={'distance' in post ? post.distance : undefined}
                />
              ))
            )}
          </>
        )}

        {tab === 'trends' && (
          <>
            <p className="mb-3 text-left text-sm text-slate-400">
              Trending in LA
              {filterLabel && ` · ${filterLabel}`}
            </p>
            {filteredTrendingPosts.map((post, i) =>
              post.type === 'event' ? (
                <EventCard
                  key={`${post.event.id}-${post.trendingRank ?? i}`}
                  event={post.event}
                  trendingRank={'trendingRank' in post ? post.trendingRank : undefined}
                />
              ) : post.type === 'memory' ? (
                <FeedMemoryPost key={`trend-memory-${i}`} memory={post.memory} />
              ) : null,
            )}
          </>
        )}

        {tab === 'following' && (
          <>
            {followedCreators.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
                {followedCreators.map((creator) => (
                  <Link
                    key={creator.id}
                    to={`/page/${creator.handle}`}
                    className="flex shrink-0 items-center gap-2 rounded-full glass px-3 py-1.5"
                  >
                    <img src={creator.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="text-xs font-medium">{creator.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {followedCreatorPosts.length > 0 ? (
              <>
                <p className="mb-3 text-left text-sm text-slate-400">
                  {followedCreatorPosts.length} posts from people & planners you follow
                  {filterLabel && ` · ${filterLabel}`}
                </p>
                {followedCreatorPosts.map((post, i) => (
                  <div
                    key={
                      post.type === 'event'
                        ? `following-event-${post.event.id}-${i}`
                        : post.type === 'memory'
                          ? `following-memory-${post.memory.id}-${i}`
                          : `following-ann-${post.creator.handle}-${i}`
                    }
                  >
                    {post.type === 'event' && <EventCard event={post.event} />}
                    {post.type === 'memory' && <FeedMemoryPost memory={post.memory} />}
                    {post.type === 'announcement' && (
                      <FeedAnnouncementPost creator={post.creator} text={post.text} />
                    )}
                  </div>
                ))}
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
      </div>

      <ExplorerFiltersSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        tab={tab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        onOpenDatePicker={() => {
          setShowFilterSheet(false)
          setShowDateSheet(true)
        }}
        activeFilters={activeFilters}
        onToggleCategoryFilter={toggleCategoryFilter}
        onClear={() => {
          setDateRange(defaultExplorerRange())
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
    </div>
  )
}
