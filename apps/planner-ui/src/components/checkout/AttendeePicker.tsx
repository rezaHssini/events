import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

      {assignments.slice(0, quantity).map((assignment, index) => (
        <div key={index} className="liquid-glass-subtle rounded-[18px] p-4">
          <p className="mb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[rgba(235,235,245,0.45)]">
            Ticket {index + 1}
          </p>
          {renderHolder(assignment, index)}
        </div>
      ))}

      <AnimatePresence>
        {activeSlot !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end bg-black/60 backdrop-blur-sm"
            onClick={closeSheet}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] liquid-glass-prominent p-5 pb-[max(env(safe-area-inset-bottom,0px),24px)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
              <h3 className="ios-headline text-center">Ticket {activeSlot + 1}</h3>
              <p className="mt-1 text-center ios-caption">Choose who this ticket is for</p>

              {!mode && (
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => assignHolder(activeSlot, { kind: 'self' })}
                    className="flex w-full items-center gap-3 rounded-[18px] liquid-glass-subtle p-4 text-left"
                  >
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">This ticket is for me</p>
                      <p className="ios-caption">@{currentUser.handle}</p>
                    </div>
                    <User className="h-4 w-4 text-[#30d158]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('search')}
                    className="flex w-full items-center gap-3 rounded-[18px] liquid-glass-subtle p-4 text-left"
                  >
                    <Search className="h-5 w-5 text-[#0a84ff]" />
                    <div>
                      <p className="font-semibold">Someone on Event</p>
                      <p className="ios-caption">Search friends and send to their account</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className="flex w-full items-center gap-3 rounded-[18px] liquid-glass-subtle p-4 text-left"
                  >
                    <UserPlus className="h-5 w-5 text-[#bf5af2]" />
                    <div>
                      <p className="font-semibold">Someone not on the app</p>
                      <p className="ios-caption">Enter their name and contact details</p>
                    </div>
                  </button>
                </div>
              )}

              {mode === 'search' && (
                <div className="mt-5">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or @handle"
                    className="w-full rounded-[16px] border-0 bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
                    autoFocus
                  />
                  <div className="mt-3 space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() =>
                          assignHolder(activeSlot, {
                            kind: 'user',
                            userId: user.id,
                            name: user.name,
                            handle: user.handle,
                            avatar: user.avatar,
                          })
                        }
                        className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left hover:bg-white/8"
                      >
                        <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{user.name}</p>
                          <p className="ios-caption">@{user.handle}</p>
                        </div>
                        <Check className="h-4 w-4 text-[#0a84ff]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'manual' && (
                <div className="mt-5 space-y-3">
                  <p className="ios-caption">
                    We&apos;ll email or text them their ticket after you complete checkout.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="First name"
                      className="rounded-[16px] bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
                    />
                    <input
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm((f) => ({ ...f, lastName: e.target.value }))}
                      placeholder="Last name"
                      className="rounded-[16px] bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
                    />
                  </div>
                  <input
                    value={guestForm.email}
                    onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-[16px] bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
                  />
                  <input
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone (optional)"
                    className="w-full rounded-[16px] bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
                  />
                  <button
                    type="button"
                    disabled={
                      !guestForm.firstName.trim() ||
                      !guestForm.lastName.trim() ||
                      !guestForm.email.trim()
                    }
                    onClick={() =>
                      assignHolder(activeSlot, {
                        kind: 'guest',
                        id: `guest-${Date.now()}`,
                        firstName: guestForm.firstName.trim(),
                        lastName: guestForm.lastName.trim(),
                        email: guestForm.email.trim() || undefined,
                        phone: guestForm.phone.trim() || undefined,
                      })
                    }
                    className="ios-button w-full py-3.5 disabled:opacity-40"
                  >
                    Add guest
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
