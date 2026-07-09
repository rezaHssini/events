import { Link } from 'react-router-dom'
import { LogIn, Ticket } from 'lucide-react'

export function AuthGateBanner({
  variant,
  className = '',
}: {
  variant: 'sign-in' | 'get-ticket'
  className?: string
}) {
  if (variant === 'sign-in') {
    return (
      <div
        className={`flex flex-col gap-3 rounded-xl border border-[#0a84ff]/25 bg-[#0a84ff]/10 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
      >
        <div className="text-left">
          <p className="text-sm font-semibold">Sign in to participate</p>
          <p className="mt-0.5 text-xs text-[rgba(235,235,245,0.55)]">
            Comments and menu pre-orders are available to signed-in guests with tickets.
          </p>
        </div>
        <Link
          to="/auth"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0a84ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0070e0]"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-[#ffd60a]/25 bg-[#ffd60a]/10 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="text-left">
        <p className="text-sm font-semibold">Ticket required for pre-order</p>
        <p className="mt-0.5 text-xs text-[rgba(235,235,245,0.55)]">
          You can browse the menu. Get a ticket to add items to your pre-order.
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#ffd60a]/30 bg-[#ffd60a]/15 px-4 py-2 text-sm font-medium text-[#ffd60a]">
        <Ticket className="h-4 w-4" />
        Get tickets below
      </span>
    </div>
  )
}
