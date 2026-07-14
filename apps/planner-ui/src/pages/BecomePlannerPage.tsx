import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { BecomePlannerCard } from '../components/planner/BecomePlannerCard'

export default function BecomePlannerPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-10">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/profile"
          className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="flex-1 text-sm font-bold">Planner Studio</h1>
      </header>
      <BecomePlannerCard variant="page" />
    </div>
  )
}
