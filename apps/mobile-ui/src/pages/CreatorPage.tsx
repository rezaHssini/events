import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Tag, User } from 'lucide-react'
import { Badge, StarRating } from '../components/UI'
import { FollowButton } from '../components/Social'
import { getCreatorProfile } from '../data/creatorProfiles'
import { plannerManagedEvents } from '../data/plannerData'
import { memories } from '../data/mockData'
import { ProfileHeaderSkeleton, EventCardSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'

const tabs = ['Events', 'Posts', 'Reviews', 'About'] as const

export default function CreatorPage() {
  const { handle = 'neoncollective' } = useParams<{ handle: string }>()
  const profile = getCreatorProfile(handle)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Events')

  const publicEvents = plannerManagedEvents.filter((e) => e.status !== 'draft')
  const upcomingEvents = publicEvents.filter((e) => e.status !== 'past')
  const pastEvents = publicEvents.filter((e) => e.status === 'past')
  const { isLoading } = useSimulatedQuery(profile, [handle, tab], { delay: 600 })

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 pb-8 pt-[max(env(safe-area-inset-top,0px),16px)]">
        <ProfileHeaderSkeleton />
        <div className="mt-6 space-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="relative h-44">
        <img src={profile.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        <Link to="/feed" className="absolute left-4 top-4 rounded-full bg-black/50 p-2 backdrop-blur">
          ←
        </Link>
        <div className="absolute left-4 top-14">
          <Badge variant="primary">🎪 Planner Page</Badge>
        </div>
      </div>

      <div className="relative -mt-10 px-4">
        <div className="flex items-end justify-between">
          <img
            src={profile.avatar}
            alt=""
            className="h-20 w-20 rounded-2xl border-4 border-[#0a0a0f] object-cover shadow-xl"
          />
          <div className="flex gap-2 pb-1">
            <Link
              to="/messages?chat=creator-1"
              className="rounded-full glass px-4 py-2 text-sm font-semibold"
            >
              💬 Message
            </Link>
            <FollowButton userId={profile.followId} />
          </div>
        </div>

        <div className="mt-3 text-left">
          <h1 className="flex items-center gap-1.5 text-xl font-bold">
            {profile.name}
            {profile.verified && <span className="text-secondary text-sm">✓</span>}
          </h1>
          <p className="text-slate-400">@{profile.handle}</p>
          <p className="mt-2 text-sm text-slate-300">{profile.bio}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.categories.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-medium text-primary-light"
              >
                <Tag className="h-3 w-3" />
                {cat}
              </span>
            ))}
          </div>

          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {profile.cities.join(' · ')}
          </p>

          <Link
            to="/profile"
            className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-light"
          >
            <User className="h-3 w-3" />
            Managed by @reza
          </Link>
        </div>

        <div className="mt-4 flex gap-5 text-sm">
          <div className="text-left">
            <p className="font-bold">{profile.followers.toLocaleString()}</p>
            <p className="text-slate-400">followers</p>
          </div>
          <div className="text-left">
            <p className="font-bold flex items-center gap-1">
              {profile.rating} <StarRating rating={profile.rating} size="sm" />
            </p>
            <p className="text-slate-400">{profile.reviewCount} reviews</p>
          </div>
          <div className="text-left">
            <p className="font-bold">{profile.eventsHosted}</p>
            <p className="text-slate-400">events</p>
          </div>
          <div className="text-left">
            <p className="font-bold">{(profile.totalAttendees / 1000).toFixed(1)}k</p>
            <p className="text-slate-400">attendees</p>
          </div>
        </div>

        <div className="mt-6 flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium ${
                tab === t ? 'border-b-2 border-primary text-primary-light' : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 text-left">
          {tab === 'Events' && (
            <div>
              {upcomingEvents.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Upcoming
                  </p>
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    {upcomingEvents.map((e) => (
                      <Link key={e.id} to="/event" state={{ eventId: e.id }} className="overflow-hidden rounded-xl glass card-hover">
                        <img src={e.cover} alt="" className="aspect-square w-full object-cover" />
                        <div className="p-2">
                          <p className="text-sm font-medium line-clamp-2">{e.title}</p>
                          <p className="text-[10px] text-slate-400">{e.date}</p>
                          <p className="text-[10px] text-slate-500">{e.category} · {e.city}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {pastEvents.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Past
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {pastEvents.map((e) => (
                      <Link key={e.id} to="/event" className="overflow-hidden rounded-xl glass card-hover opacity-80">
                        <img src={e.cover} alt="" className="aspect-square w-full object-cover" />
                        <div className="p-2">
                          <p className="text-sm font-medium line-clamp-2">{e.title}</p>
                          <p className="text-[10px] text-slate-400">{e.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/10 p-4">
                <p className="font-semibold">★ {profile.rating} average across all events</p>
                <p className="text-sm text-slate-400">{profile.reviewCount} verified attendee reviews</p>
              </div>
              {memories.map((m) => (
                <div key={m.id} className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <img src={m.user.avatar} alt="" className="h-8 w-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <Badge variant="success">Verified attendee</Badge>
                    </div>
                    <span className="ml-auto text-sm text-warning">{'★'.repeat(m.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm">{m.body}</p>
                  {m.media[0] && (
                    <img src={m.media[0]} alt="" className="mt-2 aspect-video w-full rounded-lg object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'Posts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="rounded-xl glass p-4">
                <p>🚨 Early bird tickets for Neon Nights are 80% gone!</p>
                <p className="mt-2 text-xs text-slate-400">2 days ago</p>
              </div>
              <div className="rounded-xl glass p-4">
                <p>🎷 Rooftop Jazz & Wine — new menu preview dropping Friday</p>
                <p className="mt-2 text-xs text-slate-400">5 days ago</p>
              </div>
            </motion.div>
          )}

          {tab === 'About' && (
            <div className="space-y-3 text-sm text-slate-300">
              <p>📍 {profile.cities.join(', ')}</p>
              <p>🌐 <a href={profile.website} target="_blank" rel="noreferrer" className="text-[#0a84ff]">{profile.website.replace('https://', '')}</a></p>
              <p>
                Hosting {profile.categories.join(', ').toLowerCase()} events since 2019.{' '}
                {profile.eventsHosted}+ events, {profile.totalAttendees.toLocaleString()}+ attendees.
              </p>
              <p className="text-slate-500">
                This is a planner/brand page — not a personal social profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
