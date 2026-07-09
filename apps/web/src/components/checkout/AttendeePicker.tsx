import { useMemo, useState } from 'react'
import { ResponsiveDialog } from '../ui/ResponsiveDialog'
import { Search, UserPlus, X, Check, User } from 'lucide-react'
import { userProfiles, currentUser } from '../../data/socialData'
import type { TicketHolder } from '../../context/TicketsContext'

export type TicketAssignment = TicketHolder | { kind: 'unassigned' }

type AttendeePickerProps = {
  quantity: number
  assignments: TicketAssignment[]
  onChange: (assignments: TicketAssignment[]) => void
}

function isAssigned(a: TicketAssignment): a is TicketHolder {
  return a.kind !== 'unassigned'
}

export function AttendeePicker({ quantity, assignments, onChange }: AttendeePickerProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [mode, setMode] = useState<'search' | 'manual' | null>(null)
  const [query, setQuery] = useState('')
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const assignedCount = assignments.slice(0, quantity).filter(isAssigned).length
  const selfCount = assignments
    .slice(0, quantity)
    .filter((a) => a.kind === 'self').length

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = userProfiles.filter((u) => u.id !== 'me' && !u.isCreator)
    if (!q) return pool.slice(0, 6)
    return pool.filter(
      (u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
    )
  }, [query])

  const openSlot = (index: number) => {
    setActiveSlot(index)
    setMode(null)
    setQuery('')
    setGuestForm({ firstName: '', lastName: '', email: '', phone: '' })
  }

  const closeSheet = () => {
    setActiveSlot(null)
    setMode(null)
    setQuery('')
  }

  const assignHolder = (index: number, holder: TicketHolder) => {
    const next = [...assignments]
    next[index] = holder
    onChange(next)
    closeSheet()
  }

  const clearAssignment = (index: number) => {
    const next = [...assignments]
    next[index] = { kind: 'unassigned' }
    onChange(next)
  }

  const assignAllToSelf = () => {
    onChange(
      Array.from({ length: quantity }, () => ({ kind: 'self' as const })),
    )
  }

  const renderHolder = (assignment: TicketAssignment, index: number) => {
    if (assignment.kind === 'self') {
      return (
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="ios-caption">@{currentUser.handle} · This ticket is for you</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-[#30d158]/20 px-2.5 py-1 text-[11px] font-semibold text-[#30d158]">
              You
            </span>
            <button
              type="button"
              onClick={() => openSlot(index)}
              className="rounded-full p-2 text-[rgba(235,235,245,0.45)] hover:bg-white/10"
              aria-label="Change attendee"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )
    }

    if (assignment.kind === 'user') {
      return (
        <div className="flex items-center gap-3">
          <img src={assignment.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold">{assignment.name}</p>
            <p className="ios-caption">@{assignment.handle} · App user</p>
          </div>
          <button
            type="button"
            onClick={() => clearAssignment(index)}
            className="rounded-full p-2 text-[rgba(235,235,245,0.45)] hover:bg-white/10"
            aria-label="Remove attendee"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    if (assignment.kind === 'guest') {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {assignment.firstName[0]}
            {assignment.lastName[0]}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold">
              {assignment.firstName} {assignment.lastName}
            </p>
            <p className="ios-caption">
              Guest · {assignment.email || assignment.phone || 'Manual entry'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => clearAssignment(index)}
            className="rounded-full p-2 text-[rgba(235,235,245,0.45)] hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={() => openSlot(index)}
        className="flex w-full items-center justify-between rounded-[16px] border border-dashed border-white/20 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold">Who is ticket {index + 1} for?</p>
          <p className="ios-caption">You, a friend on the app, or a guest</p>
        </div>
        <UserPlus className="h-5 w-5 text-[#0a84ff]" />
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="ios-headline">Who&apos;s going?</h3>
        <p className="mt-1 ios-caption">
          Assign each ticket to an attendee — yourself or someone else. You can buy every ticket for
          friends and family.
        </p>
      </div>

      {quantity > 1 && (
        <button
          type="button"
          onClick={assignAllToSelf}
          className="w-full rounded-[16px] liquid-glass-subtle px-4 py-3 text-left text-sm font-medium text-primary-light"
        >
          All {quantity} tickets are for me
        </button>
      )}

      {assignedCount > 0 && selfCount === 0 && (
        <div className="rounded-[16px] border border-[#0a84ff]/30 bg-[#0a84ff]/10 px-4 py-3 text-left">
          <p className="text-sm font-medium text-[#64b5ff]">Buying for others</p>
          <p className="mt-0.5 ios-caption">
            Tickets will be sent to each person&apos;s email or app account after payment.
          </p>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {assignments.slice(0, quantity).map((assignment, index) => (
          <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Ticket {index + 1}
            </p>
            {renderHolder(assignment, index)}
          </div>
        ))}
      </div>

      <ResponsiveDialog
        open={activeSlot !== null}
        onClose={closeSheet}
        title={activeSlot !== null ? `Ticket ${activeSlot + 1}` : 'Assign ticket'}
        maxWidthClass="max-w-lg"
      >
        <p className="mb-4 text-center text-sm text-slate-400">Choose who this ticket is for</p>

        {!mode && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => activeSlot !== null && assignHolder(activeSlot, { kind: 'self' })}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06]"
            >
              <img src={currentUser.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">This ticket is for me</p>
                <p className="text-xs text-slate-400">@{currentUser.handle}</p>
              </div>
              <User className="h-4 w-4 text-success" />
            </button>
            <button
              type="button"
              onClick={() => setMode('search')}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06]"
            >
              <Search className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Someone on Event</p>
                <p className="text-xs text-slate-400">Search friends and send to their account</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06]"
            >
              <UserPlus className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Someone not on the app</p>
                <p className="text-xs text-slate-400">Enter their name and contact details</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'search' && (
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or @handle"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/40"
              autoFocus
            />
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() =>
                    activeSlot !== null &&
                    assignHolder(activeSlot, {
                      kind: 'user',
                      userId: user.id,
                      name: user.name,
                      handle: user.handle,
                      avatar: user.avatar,
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/8"
                >
                  <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-slate-400">@{user.handle}</p>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              We&apos;ll email or text them their ticket after you complete checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={guestForm.firstName}
                onChange={(e) => setGuestForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="First name"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              />
              <input
                value={guestForm.lastName}
                onChange={(e) => setGuestForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Last name"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              />
            </div>
            <input
              value={guestForm.email}
              onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <input
              value={guestForm.phone}
              onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone (optional)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              disabled={
                !guestForm.firstName.trim() ||
                !guestForm.lastName.trim() ||
                !guestForm.email.trim()
              }
              onClick={() =>
                activeSlot !== null &&
                assignHolder(activeSlot, {
                  kind: 'guest',
                  id: `guest-${Date.now()}`,
                  firstName: guestForm.firstName.trim(),
                  lastName: guestForm.lastName.trim(),
                  email: guestForm.email.trim() || undefined,
                  phone: guestForm.phone.trim() || undefined,
                })
              }
              className="w-full rounded-xl bg-primary py-3 font-semibold disabled:opacity-40"
            >
              Add guest
            </button>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  )
}

export function buildAssignments(quantity: number): TicketAssignment[] {
  return Array.from({ length: quantity }, (_, i) =>
    i === 0 ? { kind: 'self' as const } : { kind: 'unassigned' as const },
  )
}

export function allAssignmentsReady(assignments: TicketAssignment[], quantity: number): boolean {
  return assignments.slice(0, quantity).every(isAssigned)
}

export function toHolders(assignments: TicketAssignment[]): TicketHolder[] {
  return assignments.filter(isAssigned)
}

export function hasSelfTicket(holders: TicketHolder[]): boolean {
  return holders.some((h) => h.kind === 'self')
}
