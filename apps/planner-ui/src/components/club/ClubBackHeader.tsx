import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function ClubBackHeader({
  title,
  subtitle,
  backTo = '/',
}: {
  title: string
  subtitle?: string
  backTo?: string
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
      <Link
        to={backTo}
        className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="min-w-0 flex-1 text-left">
        <h1 className="truncate text-sm font-bold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
    </header>
  )
}
