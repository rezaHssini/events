import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { events, type Event } from '../data/mockData'
import { currentUser } from '../data/socialData'

export type TicketHolder =
  | { kind: 'self' }
  | { kind: 'user'; userId: string; name: string; handle: string; avatar: string }
  | { kind: 'guest'; id: string; firstName: string; lastName: string; email?: string; phone?: string }

export type PurchasedTicket = {
  id: string
  eventId: string
  event: Event
  ticketTypeId: string
  ticketTypeName: string
  holder: TicketHolder
  status: 'upcoming' | 'past'
  purchasedAt: string
}

export type GoingActivity = {
  id: string
  event: Event
  caption?: string
  postedAt: string
}

type PurchaseInput = {
  event: Event
  ticketTypeId: string
  ticketTypeName: string
  holders: TicketHolder[]
}

interface TicketsContextValue {
  tickets: PurchasedTicket[]
  goingActivities: GoingActivity[]
  purchaseTickets: (input: PurchaseInput) => PurchasedTicket[]
  postGoing: (event: Event, caption?: string) => void
  getHolderLabel: (holder: TicketHolder) => string
}

const TicketsContext = createContext<TicketsContextValue | null>(null)

const INITIAL_TICKETS: PurchasedTicket[] = [
  {
    id: 'ticket-1',
    eventId: events[0].id,
    event: events[0],
    ticketTypeId: 'ga',
    ticketTypeName: 'General Admission',
    holder: { kind: 'self' },
    status: 'upcoming',
    purchasedAt: '2026-07-01',
  },
  {
    id: 'ticket-2',
    eventId: events[1].id,
    event: events[1],
    ticketTypeId: 'vip',
    ticketTypeName: 'VIP',
    holder: { kind: 'self' },
    status: 'upcoming',
    purchasedAt: '2026-07-02',
  },
  {
    id: 'ticket-3',
    eventId: events[2].id,
    event: events[2],
    ticketTypeId: 'ga',
    ticketTypeName: 'General Admission',
    holder: { kind: 'self' },
    status: 'past',
    purchasedAt: '2026-06-20',
  },
]

function holderLabel(holder: TicketHolder): string {
  if (holder.kind === 'self') return 'You'
  if (holder.kind === 'user') return holder.name
  return `${holder.firstName} ${holder.lastName}`
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<PurchasedTicket[]>(INITIAL_TICKETS)
  const [goingActivities, setGoingActivities] = useState<GoingActivity[]>([])

  const purchaseTickets = useCallback((input: PurchaseInput) => {
    const purchasedAt = new Date().toISOString().slice(0, 10)
    const issued = input.holders.map((holder, index) => ({
      id: `ticket-${Date.now()}-${index}`,
      eventId: input.event.id,
      event: input.event,
      ticketTypeId: input.ticketTypeId,
      ticketTypeName: input.ticketTypeName,
      holder,
      status: 'upcoming' as const,
      purchasedAt,
    }))

    setTickets((prev) => [...issued, ...prev])
    return issued
  }, [])

  const postGoing = useCallback((event: Event, caption?: string) => {
    const activity: GoingActivity = {
      id: `going-${Date.now()}`,
      event,
      caption,
      postedAt: 'Just now',
    }
    setGoingActivities((prev) => [activity, ...prev])
  }, [])

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        goingActivities,
        purchaseTickets,
        postGoing,
        getHolderLabel: holderLabel,
      }}
    >
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error('useTickets must be used within TicketsProvider')
  return ctx
}

export function useMyGoingActivity(eventId: string) {
  const { goingActivities } = useTickets()
  return goingActivities.find((a) => a.event.id === eventId)
}

export { currentUser }
