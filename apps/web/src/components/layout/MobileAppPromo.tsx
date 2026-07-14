import { Crown, Smartphone } from 'lucide-react'

const EVENT_APP_STORE_URL = 'https://apps.apple.com/app/event'
const PLANNER_APP_STORE_URL = 'https://apps.apple.com/app/planner-studio'

const EVENT_APK_URL =
  import.meta.env.VITE_ANDROID_APK_URL ??
  'http://65.109.221.245:3040/downloads/event.apk'

const PLANNER_APK_URL =
  import.meta.env.VITE_PLANNER_APK_URL ??
  'http://65.109.221.245:3040/downloads/planner.apk'

function StoreBadge({
  store,
  href,
}: {
  store: 'apple' | 'google'
  href: string
}) {
  const label = store === 'apple' ? 'Download on the App Store' : 'Download Android app (APK)'
  const isApk = store === 'google'
  return (
    <a
      href={href}
      target={isApk ? '_self' : '_blank'}
      rel={isApk ? undefined : 'noopener noreferrer'}
      aria-label={label}
      className="inline-flex min-w-[140px] flex-1 items-center gap-2.5 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 transition-colors hover:border-white/25 hover:bg-black/55 sm:flex-none"
    >
      <span className="text-xl leading-none">{store === 'apple' ? '' : '▶'}</span>
      <span className="text-left leading-tight">
        <span className="block text-[9px] uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
          {store === 'apple' ? 'Download on the' : 'Get it on'}
        </span>
        <span className="block text-sm font-semibold">
          {store === 'apple' ? 'App Store' : 'Google Play'}
        </span>
        {isApk && (
          <span className="mt-0.5 block text-[9px] text-[rgba(235,235,245,0.4)]">
            Signed release APK
          </span>
        )}
      </span>
    </a>
  )
}

function storeLinks(product: 'event' | 'planner') {
  if (product === 'planner') {
    return { apple: PLANNER_APP_STORE_URL, android: PLANNER_APK_URL }
  }
  return { apple: EVENT_APP_STORE_URL, android: EVENT_APK_URL }
}

export function MobileAppPromo({
  variant = 'card',
  product = 'event',
  className = '',
}: {
  variant?: 'card' | 'compact' | 'banner'
  /** Consumer Event app vs Planner Studio for organizers */
  product?: 'event' | 'planner'
  className?: string
}) {
  const links = storeLinks(product)
  const isPlanner = product === 'planner'

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <p className="text-sm text-[rgba(235,235,245,0.55)]">
          {isPlanner ? 'Planner Studio on mobile' : 'Also on mobile'}
        </p>
        <div className="flex flex-wrap gap-2">
          <StoreBadge store="apple" href={links.apple} />
          <StoreBadge store="google" href={links.android} />
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-6 ${
          isPlanner
            ? 'bg-gradient-to-r from-warning/20 via-[#0a84ff]/15 to-[#bf5af2]/20'
            : 'bg-gradient-to-r from-[#0a84ff]/20 via-[#5e5ce6]/15 to-[#bf5af2]/20'
        } ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-left">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isPlanner ? 'bg-warning/20' : 'bg-white/10'
              }`}
            >
              {isPlanner ? (
                <Crown className="h-5 w-5 text-warning" />
              ) : (
                <Smartphone className="h-5 w-5 text-[#64b5ff]" />
              )}
            </span>
            <div>
              <p className="font-semibold">
                {isPlanner
                  ? 'Run your club on Planner Studio'
                  : 'Stories, tickets & live updates — on your phone'}
              </p>
              <p className="mt-1 text-sm text-[rgba(235,235,245,0.55)]">
                {isPlanner
                  ? 'Create events, seating, menus, scanner & analytics in the dedicated organizer app.'
                  : 'The full Event experience with QR tickets, story sharing, and push reminders.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <StoreBadge store="apple" href={links.apple} />
            <StoreBadge store="google" href={links.android} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        {isPlanner ? (
          <Crown className="h-4 w-4 text-warning" />
        ) : (
          <Smartphone className="h-4 w-4 text-[#64b5ff]" />
        )}
        <h3 className="text-sm font-semibold">
          {isPlanner ? 'Get Planner Studio' : 'Get the Event app'}
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-[rgba(235,235,245,0.5)]">
        {isPlanner
          ? 'Build events, design seating, manage staff, and run the door — purpose-built for planners.'
          : 'Scan tickets at the door, share stories from the night, and never miss a drop.'}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <StoreBadge store="apple" href={links.apple} />
        <StoreBadge store="google" href={links.android} />
      </div>
    </div>
  )
}
