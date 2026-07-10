import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, List, SlidersHorizontal, ChevronDown, Calendar } from 'lucide-react'
import { EventCard, Badge } from '../components/UI'
import { FeedMemoryPost, FeedAnnouncementPost } from '../components/feed/FeedPosts'
import { ExplorerDateRangeSheet } from '../components/explorer/ExplorerDateRangeSheet'
import {
  ExplorerFiltersSheet,
  ExplorerFilterIconButton,
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
import { EventCardSkeleton, MapBlockSkeleton, UserRowSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'

import type { Event } from '../data/mockData'

type ExplorerTab = 'nearby' | 'trends' | 'following'
type ViewMode = 'list' | 'map'

const COMPACT_ENTER_Y = 72
const COMPACT_EXIT_Y = 16

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
  const [dateRange, setDateRange] = useState<DateRange>(() => todayRange())
  const [activeFilters, setActiveFilters] = useState<string[]>(() =>
    defaultExplorerFilters(prefs.preferredCategories),
  )
  const [selectedPin, setSelectedPin] = useState(events[0].id)
  const [compact, setCompact] = useState(false)
  const compactRef = useRef(false)
  const { isFollowing, getProfile } = useSocial()

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const next =
          !compactRef.current && y > COMPACT_ENTER_Y
            ? true
            : compactRef.current && y < COMPACT_EXIT_Y
              ? false
              : compactRef.current
        if (next !== compactRef.current) {
          compactRef.current = next
          setCompact(next)
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

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

  const tabs: { id: ExplorerTab; label: string }[] = [
    { id: 'nearby', label: 'Nearby' },
    { id: 'trends', label: 'Trends' },
    { id: 'following', label: 'Following' },
  ]

  const toggleCategoryFilter = (f: string) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  const filterLabel = [formatDateRangeLabel(dateRange), ...activeFilters].filter(Boolean).join(', ')
  const dateButtonLabel = formatDateRangeLabel(dateRange)
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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-2">
        <div
          className={`liquid-glass overflow-hidden rounded-[22px] transition-[padding] duration-200 ease-out ${
            compact ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
        >
          <h1
            className={`text-left font-bold transition-[font-size,line-height] duration-200 ease-out ${
              compact ? 'text-lg leading-6' : 'ios-large-title !text-[28px] !leading-8'
            }`}
          >
            Explore
          </h1>
          <p
            className={`ios-caption overflow-hidden text-left transition-[max-height,opacity,margin] duration-200 ease-out ${
              compact ? 'mt-0 max-h-0 opacity-0' : 'mt-0.5 max-h-6 opacity-100'
            }`}
          >
            Discover events near you
          </p>

          <div
            className={`flex items-center gap-2 transition-[margin] duration-200 ease-out ${
              compact ? 'mt-2' : 'mt-3'
            }`}
          >
            <div className="flex min-w-0 flex-1 gap-0.5 rounded-[14px] liquid-glass-subtle p-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative flex-1 rounded-xl font-medium transition-[padding,font-size] duration-200 ease-out ${
                    compact ? 'py-1.5 text-[11px]' : 'py-2.5 text-sm'
                  } ${tab === t.id ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'}`}
                >
                  {tab === t.id && <div className="absolute inset-0 rounded-xl bg-white/14" />}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
            {compact && (
              <ExplorerFilterIconButton
                onClick={() => setShowFilterSheet(true)}
                badgeCount={filterBadgeCount}
              />
            )}
          </div>

          {!compact && (
            <>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDateSheet(true)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#0a84ff] px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {dateButtonLabel}
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterSheet(true)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    showFilterSheet ? 'bg-[#0a84ff] text-white' : 'liquid-glass-subtle'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  More
                  {activeFilters.length > 0 && (
                    <span className="rounded-full bg-white/20 px-1.5">{activeFilters.length}</span>
                  )}
                </button>
                {tab === 'nearby' && (
                  <div className="flex shrink-0 rounded-xl liquid-glass-subtle p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-white/15' : ''}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`rounded-lg p-2 ${viewMode === 'map' ? 'bg-white/15' : ''}`}
                    >
                      <Map className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}-${viewMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-4"
        >
          {contentLoading ? (
            <>
              {tab === 'nearby' && viewMode === 'map' ? (
                <>
                  <MapBlockSkeleton height={280} />
                  <div className="mt-3 flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-surface-2" />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 h-4 w-48 animate-pulse rounded-full bg-surface-2" />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </>
              )}
              {tab === 'following' && <UserRowSkeleton count={3} />}
            </>
          ) : (
            <>
          {tab === 'nearby' && viewMode === 'map' && selectedEvent && (
            <>
              <EventMap
                lat={selectedEvent.lat}
                lng={selectedEvent.lng}
                label={`${selectedEvent.location} · ${selectedEvent.address}`}
                height={280}
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
                      setDateRange(todayRange())
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
            </>
          )}
        </motion.div>
      </AnimatePresence>

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
    </div>
  )
}
