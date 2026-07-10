import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Tag, User } from 'lucide-react'
import { Badge, StarRating } from '../components/UI'
import { FollowButton } from '../components/Social'
import { AppImage } from '../components/ui/AppImage'
import { getCreatorProfile } from '../data/creatorProfiles'
import { plannerManagedEvents } from '../data/plannerData'
import { memories } from '../data/mockData'

const tabs = ['Events', 'Posts', 'Reviews', 'About'] as const

export default function CreatorPage() {
  const { handle = 'neoncollective' } = useParams<{ handle: string }>()
  const profile = getCreatorProfile(handle)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Events')

  const publicEvents = plannerManagedEvents.filter((e) => e.status !== 'draft')
  const upcomingEvents = publicEvents.filter((e) => e.status !== 'past')
  const pastEvents = publicEvents.filter((e) => e.status === 'past')

  return (
    <div className="pb-10">
      <div className="relative h-48 lg:h-64">
        <AppImage src={profile.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
        <div className="absolute left-4 top-4 lg:left-8">
          <Badge variant="primary">🎪 Planner Page</Badge>
        </div>
      </div>

      <div className="web-container relative -mt-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <AppImage
                src={profile.avatar}
                alt=""
                className="h-24 w-24 rounded-2xl border-4 border-[#0a0a0f] object-cover shadow-xl lg:h-28 lg:w-28"
              />
              <div className="flex gap-2 pb-1">
                <Link
                  to="/messages?chat=creator-1"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  💬 Message
                </Link>
                <FollowButton userId={profile.followId} />
              </div>
            </div>

            <div className="mt-4 text-left">
              <h1 className="flex items-center gap-1.5 text-2xl font-bold lg:text-3xl">
                {profile.name}
                {profile.verified && <span className="text-secondary text-sm">✓</span>}
              </h1>
              <p className="text-slate-400">@{profile.handle}</p>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">{profile.bio}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.categories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary-light"
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

            <div className="mt-6 flex gap-1 border-b border-white/10">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === t ? 'border-b-2 border-primary text-primary-light' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 text-left">
              {tab === 'Events' && (
                <div className="space-y-8">
                  {upcomingEvents.length > 0 && (
                    <section>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Upcoming
                      </p>
                      <div className="web-event-grid">
                        {upcomingEvents.map((e) => (
                          <Link
                            key={e.id}
                            to="/event"
                            state={{ eventId: e.id }}
                            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] card-hover"
                          >
                            <AppImage
                              src={e.cover}
                              alt=""
                              className="aspect-[16/10] w-full object-cover transition group-hover:scale-[1.02]"
                            />
                            <div className="p-3">
                              <p className="font-medium leading-snug line-clamp-2">{e.title}</p>
                              <p className="mt-1 text-xs text-slate-400">{e.date}</p>
                              <p className="text-xs text-slate-500">{e.category} · {e.city}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                  {pastEvents.length > 0 && (
                    <section>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Past
                      </p>
                      <div className="web-event-grid">
                        {pastEvents.map((e) => (
                          <Link
                            key={e.id}
                            to="/event"
                            state={{ eventId: e.id }}
                            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] opacity-90 card-hover"
                          >
                            <AppImage src={e.cover} alt="" className="aspect-[16/10] w-full object-cover" />
                            <div className="p-3">
                              <p className="font-medium leading-snug line-clamp-2">{e.title}</p>
                              <p className="mt-1 text-xs text-slate-400">{e.date}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {tab === 'Reviews' && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 lg:col-span-2">
                    <p className="font-semibold">★ {profile.rating} average across all events</p>
                    <p className="text-sm text-slate-400">{profile.reviewCount} verified attendee reviews</p>
                  </div>
                  {memories.map((m) => (
                    <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-3">
                        <AppImage src={m.user.avatar} alt="" className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{m.user.name}</p>
                          <Badge variant="success">Verified attendee</Badge>
                        </div>
                        <span className="ml-auto text-sm text-warning">{'★'.repeat(m.rating)}</span>
                      </div>
                      <p className="mt-2 text-sm">{m.body}</p>
                      {m.media[0] && (
                        <AppImage src={m.media[0]} alt="" className="mt-2 aspect-video w-full rounded-lg object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'Posts' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p>🚨 Early bird tickets for Neon Nights are 80% gone!</p>
                    <p className="mt-2 text-xs text-slate-400">2 days ago</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p>🎷 Rooftop Jazz & Wine — new menu preview dropping Friday</p>
                    <p className="mt-2 text-xs text-slate-400">5 days ago</p>
                  </div>
                </motion.div>
              )}

              {tab === 'About' && (
                <div className="max-w-2xl space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
                  <p>📍 {profile.cities.join(', ')}</p>
                  <p>
                    🌐{' '}
                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary-light hover:underline">
                      {profile.website.replace('https://', '')}
                    </a>
                  </p>
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

          <aside className="mt-6 hidden lg:block">
            <div className="sticky top-20 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xl font-bold">{profile.followers.toLocaleString()}</p>
                  <p className="text-slate-400">followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{profile.eventsHosted}</p>
                  <p className="text-slate-400">events</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xl font-bold">
                    {profile.rating} <StarRating rating={profile.rating} size="sm" />
                  </p>
                  <p className="text-slate-400">{profile.reviewCount} reviews</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{(profile.totalAttendees / 1000).toFixed(1)}k</p>
                  <p className="text-slate-400">attendees</p>
                </div>
              </div>
              <Link
                to="/checkout"
                state={{ event: upcomingEvents[0] }}
                className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold"
              >
                Get tickets
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
