export type TicketDraft = {
  name: string
  price: string
  quantity: string
  perks: string[]
}

export type TicketTemplate = {
  id: string
  name: string
  savedAt: string
  tickets: TicketDraft[]
  capacity?: string
}

export const DEFAULT_TICKETS: TicketDraft[] = [
  { name: 'General Admission', price: '35', quantity: '200', perks: ['1 welcome drink'] },
  { name: 'VIP', price: '85', quantity: '50', perks: ['3 drink tokens', 'VIP lounge'] },
]

export function ticketsFromTemplate(template: TicketTemplate): TicketDraft[] {
  return template.tickets.map((t) => ({
    ...t,
    perks: [...t.perks],
  }))
}

export function templateFromTickets(
  tickets: TicketDraft[],
  name: string,
  capacity?: string,
): TicketTemplate {
  return {
    id: `ticket-${Date.now()}`,
    name,
    savedAt: new Date().toISOString(),
    tickets: tickets.map((t) => ({ ...t, perks: [...t.perks] })),
    capacity,
  }
}
