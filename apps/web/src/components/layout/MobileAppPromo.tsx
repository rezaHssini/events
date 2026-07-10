import { Smartphone } from 'lucide-react'

const APP_STORE_URL = 'https://apps.apple.com/app/event'
/** Direct APK install — styled as Google Play until Play Store listing is live. */
const ANDROID_APK_URL = import.meta.env.VITE_ANDROID_APK_URL ?? '/downloads/event.apk'

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
        <span className="block text-sm font-semibold">{store === 'apple' ? 'App Store' : 'Google Play'}</span>
        {isApk && (
          <span className="mt-0.5 block text-[9px] text-[rgba(235,235,245,0.4)]">
            Direct APK · browser may ask to confirm
          </span>
        )}
      </span>
    </a>
  )
}

export function MobileAppPromo({
  variant = 'card',
  className = '',
}: {
  variant?: 'card' | 'compact' | 'banner'
  className?: string
}) {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <p className="text-sm text-[rgba(235,235,245,0.55)]">Also on mobile</p>
        <div className="flex flex-wrap gap-2">
          <StoreBadge store="apple" href={APP_STORE_URL} />
          <StoreBadge store="google" href={ANDROID_APK_URL} />
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0a84ff]/20 via-[#5e5ce6]/15 to-[#bf5af2]/20 p-5 sm:p-6 ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Smartphone className="h-5 w-5 text-[#64b5ff]" />
            </span>
            <div>
              <p className="font-semibold">Stories, tickets & live updates — on your phone</p>
              <p className="mt-1 text-sm text-[rgba(235,235,245,0.55)]">
                The full Event experience with QR tickets, story sharing, and push reminders.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <StoreBadge store="apple" href={APP_STORE_URL} />
            <StoreBadge store="google" href={ANDROID_APK_URL} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-[#64b5ff]" />
        <h3 className="text-sm font-semibold">Get the Event app</h3>
      </div>
      <p className="text-xs leading-relaxed text-[rgba(235,235,245,0.5)]">
        Scan tickets at the door, share stories from the night, and never miss a drop.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <StoreBadge store="apple" href={APP_STORE_URL} />
        <StoreBadge store="google" href={ANDROID_APK_URL} />
      </div>
    </div>
  )
}
