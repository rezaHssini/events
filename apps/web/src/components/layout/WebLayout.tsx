import { Outlet } from 'react-router-dom'
import { WebFooter, WebNavbar } from './WebNavbar'

export function WebLayout({ showFooter = true }: { showFooter?: boolean }) {
  return (
    <div className="web-app flex min-h-screen flex-col">
      <WebNavbar />
      <main className="web-main flex-1">
        <Outlet />
      </main>
      {showFooter && <WebFooter />}
    </div>
  )
}

export function WebPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="web-container mb-6 flex flex-col gap-3 pt-6 sm:flex-row sm:items-end sm:justify-between lg:pt-8">
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[rgba(235,235,245,0.5)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function WebContentGrid({
  main,
  sidebar,
  sidebarPosition = 'right',
}: {
  main: React.ReactNode
  sidebar?: React.ReactNode
  sidebarPosition?: 'left' | 'right'
}) {
  if (!sidebar) {
    return <div className="web-container py-6 lg:py-8">{main}</div>
  }

  return (
    <div className="web-container py-6 lg:py-8">
      <div
        className={`grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] ${
          sidebarPosition === 'left' ? 'lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]' : ''
        }`}
      >
        {sidebarPosition === 'left' ? (
          <>
            <aside className="hidden lg:block">{sidebar}</aside>
            <div className="min-w-0">{main}</div>
          </>
        ) : (
          <>
            <div className="min-w-0">{main}</div>
            <aside className="hidden lg:block">{sidebar}</aside>
          </>
        )}
      </div>
    </div>
  )
}

export function WebCard({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}>
      {title && (
        <h2 className="mb-3 text-left text-xs font-bold uppercase tracking-widest text-[rgba(235,235,245,0.45)]">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
