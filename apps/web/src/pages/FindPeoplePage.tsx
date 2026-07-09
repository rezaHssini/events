import { useState, useMemo } from 'react'
import { useSocial } from '../context/SocialContext'
import { UserRow } from '../components/Social'
import { UserRowSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { suggestedUsers, userProfiles } from '../data/socialData'
import { WebPageHeader } from '../components/layout/WebLayout'

export default function FindPeoplePage() {
  const [query, setQuery] = useState('')
  const { followingIds } = useSocial()

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return suggestedUsers
    return userProfiles.filter(
      (u) =>
        u.id !== 'me' &&
        !u.isCreator &&
        (u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)),
    )
  }, [query])

  const notFollowing = filtered.filter((u) => !followingIds.has(u.id))
  const alreadyFollowing = filtered.filter((u) => followingIds.has(u.id))
  const { isLoading } = useSimulatedQuery(filtered, [query], { delay: query ? 400 : 650 })

  return (
    <div className="pb-10">
      <WebPageHeader
        title="Find People"
        subtitle="Discover friends & event buddies"
        actions={
          <div className="flex w-full min-w-[240px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 sm:w-72">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or @handle"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
        }
      />

      <div className="web-container">
        {isLoading ? (
          <div className="mt-4">
            <UserRowSkeleton count={query ? 5 : 4} />
          </div>
        ) : (
          <>
        {!query && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold text-slate-300">Suggested for you</h2>
            <p className="text-xs text-slate-500">Based on events you attend & mutual friends</p>
            <div className="mt-2 divide-y divide-white/5">
              {notFollowing.slice(0, 4).map((user) => (
                <UserRow key={user.id} user={user} showMutual action="follow" />
              ))}
            </div>
          </section>
        )}

        {query && (
          <section className="mt-4">
            <p className="text-sm text-slate-400">{filtered.length} people found</p>
            <div className="mt-2 divide-y divide-white/5">
              {filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  action={followingIds.has(user.id) ? 'message' : 'follow'}
                />
              ))}
            </div>
          </section>
        )}

        {!query && alreadyFollowing.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-slate-300">People you follow</h2>
            <div className="mt-2 divide-y divide-white/5">
              {alreadyFollowing.map((user) => (
                <UserRow key={user.id} user={user} action="message" />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-xl glass p-4 text-center">
          <p className="text-sm text-slate-400">
            Connect your contacts to find friends already on Event
          </p>
          <button type="button" className="mt-3 rounded-xl bg-primary/20 px-6 py-2 text-sm font-medium text-primary-light">
            Sync contacts
          </button>
        </section>
          </>
        )}
      </div>
    </div>
  )
}
