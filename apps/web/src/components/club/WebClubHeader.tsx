import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { WebPageHeader } from '../layout/WebLayout'

export function WebClubHeader({
  title,
  subtitle,
  backTo = '/planner',
  backLabel = 'Back to planner',
  actions,
}: {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  actions?: React.ReactNode
}) {
  return (
    <WebPageHeader
      title={title}
      subtitle={subtitle}
      actions={
        <>
          {actions}
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </>
      }
    />
  )
}
