import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { WebPageHeader } from '../components/layout/WebLayout'
import { AppImage } from '../components/ui/AppImage'
import { mainEvent, ticketTypes, type Event } from '../data/mockData'
import { useTickets } from '../context/TicketsContext'
import { useMenuTemplates } from '../context/MenuTemplatesContext'
import { usePaymentMethods } from '../context/PaymentMethodsContext'
import { useToast } from '../context/ToastContext'
import {
  AttendeePicker,
  buildAssignments,
  allAssignmentsReady,
  toHolders,
  hasSelfTicket,
  type TicketAssignment,
} from '../components/checkout/AttendeePicker'
import { GoingPostPrompt } from '../components/checkout/GoingPostPrompt'
import {
  PaymentMethodPicker,
  paymentSelectionLabel,
  type PaymentSelection,
} from '../components/checkout/PaymentMethodPicker'
import {
  CheckoutMenuAddons,
  preorderCartTotal,
  type PreorderCart,
} from '../components/menu/CheckoutMenuAddons'
import { AsyncButton } from '../components/ui/AsyncButton'
import { useAsyncAction } from '../hooks/useAsyncAction'

type CheckoutState = {
  event?: Event
  preorderCart?: PreorderCart
  step?: number
  selected?: string
  quantity?: number
  assignments?: TicketAssignment[]
}

const SERVICE_FEE = 4.5
const STEP_LABELS = ['Tickets', 'People', 'Add-ons', 'Pay'] as const

function OrderSummary({
  event,
  ticket,
  quantity,
  preorderSubtotal,
  subtotal,
  total,
  className = '',
}: {
  event: Event
  ticket: (typeof ticketTypes)[0]
  quantity: number
  preorderSubtotal: number
  subtotal: number
  total: number
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      <AppImage src={event.cover} alt="" className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />
      <p className="font-semibold">{event.title}</p>
      <p className="text-sm text-slate-400">{event.date} · {event.location}</p>
      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span>{ticket.name} × {quantity}</span>
          <span>${subtotal}</span>
        </div>
        {preorderSubtotal > 0 && (
          <div className="flex justify-between">
            <span>Menu pre-order</span>
            <span>${preorderSubtotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>Service fee</span>
          <span>${SERVICE_FEE}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

function CheckoutActions({
  step,
  canContinue,
  stepping,
  paying,
  paymentSelection,
  methods,
  total,
  onContinue,
  onPay,
}: {
  step: number
  canContinue: boolean
  stepping: boolean
  paying: boolean
  paymentSelection: PaymentSelection
  methods: { id: string }[]
  total: number
  onContinue: () => void
  onPay: () => void
}) {
  if (step < 4) {
    return (
      <AsyncButton
        disabled={!canContinue}
        loading={stepping}
        loadingLabel="Continuing…"
        onClick={onContinue}
        className="w-full rounded-xl bg-primary py-3 font-semibold disabled:opacity-40"
      >
        Continue
      </AsyncButton>
    )
  }

  if (paymentSelection.type === 'apple_pay') {
    return (
      <AsyncButton
        variant="apple"
        loading={paying}
        loadingLabel={`Processing · $${total.toFixed(2)}`}
        onClick={onPay}
        className="w-full rounded-xl py-3 font-semibold"
      >
        Pay with Apple Pay · ${total.toFixed(2)}
      </AsyncButton>
    )
  }

  return (
    <AsyncButton
      loading={paying}
      loadingLabel={`Processing · $${total.toFixed(2)}`}
      disabled={
        paymentSelection.type === 'card' &&
        !methods.some((m) => m.id === paymentSelection.id)
      }
      onClick={onPay}
      className="w-full rounded-xl bg-primary py-3 font-semibold disabled:opacity-40"
    >
      Pay ${total.toFixed(2)}
    </AsyncButton>
  )
}

export default function CheckoutPage() {
  const location = useLocation()
  const { purchaseTickets, getHolderLabel } = useTickets()
  const { getCheckoutMenu } = useMenuTemplates()
  const { methods } = usePaymentMethods()
  const { toast } = useToast()
  const routeState = (location.state as CheckoutState | null) ?? {}
  const event = routeState.event ?? mainEvent
  const menu = getCheckoutMenu()
  const initialCart = routeState.preorderCart

  const [step, setStep] = useState(routeState.step ?? 1)
  const [selected, setSelected] = useState(routeState.selected ?? 'ga')
  const [quantity, setQuantity] = useState(routeState.quantity ?? 1)
  const [assignments, setAssignments] = useState<TicketAssignment[]>(
    () => routeState.assignments ?? buildAssignments(routeState.quantity ?? 1),
  )
  const [preorderCart, setPreorderCart] = useState<PreorderCart>(initialCart ?? {})
  const [paymentSelection, setPaymentSelection] = useState<PaymentSelection>(() =>
    methods.length > 0 ? { type: 'card', id: methods.find((m) => m.isDefault)?.id ?? methods[0].id } : { type: 'apple_pay' },
  )
  const [done, setDone] = useState(false)
  const [showGoingPrompt, setShowGoingPrompt] = useState(true)
  const [purchasedCount, setPurchasedCount] = useState(0)
  const { loading: paying, run: runPay } = useAsyncAction()
  const { loading: stepping, run: runStep } = useAsyncAction()

  const checkoutReturnState: CheckoutState = {
    event,
    preorderCart,
    step: 4,
    selected,
    quantity,
    assignments,
  }

  const ticket = ticketTypes.find((t) => t.id === selected)!

  useEffect(() => {
    setAssignments((prev) => {
      const next = buildAssignments(quantity)
      for (let i = 0; i < Math.min(prev.length, quantity); i += 1) {
        if (prev[i].kind !== 'unassigned') next[i] = prev[i]
      }
      return next
    })
  }, [quantity])

  const preorderSubtotal = menu.preorderEnabled ? preorderCartTotal(menu, preorderCart) : 0
  const subtotal = ticket.price * quantity
  const total = subtotal + preorderSubtotal + SERVICE_FEE

  useEffect(() => {
    if (methods.length === 0) return
    if (paymentSelection.type === 'card' && methods.some((m) => m.id === paymentSelection.id)) return
    const defaultCard = methods.find((m) => m.isDefault) ?? methods[0]
    setPaymentSelection({ type: 'card', id: defaultCard.id })
  }, [methods, paymentSelection])

  const canContinue = useMemo(() => {
    if (step === 1) return ticket.available > 0
    if (step === 2) return allAssignmentsReady(assignments, quantity)
    return true
  }, [step, ticket.available, assignments, quantity])

  const completePurchase = () => {
    const holders = toHolders(assignments.slice(0, quantity))
    purchaseTickets({
      event,
      ticketTypeId: ticket.id,
      ticketTypeName: ticket.name,
      holders,
    })
    setPurchasedCount(quantity)
    setDone(true)
    setShowGoingPrompt(true)
  }

  const handlePay = () => {
    void runPay(async () => {
      const via = paymentSelectionLabel(paymentSelection, methods)
      toast(`✓ Paid via ${via}`)
      completePurchase()
    }, 900)
  }

  const handleContinue = () => {
    void runStep(async () => {
      setStep(step + 1)
    }, 300)
  }

  if (done) {
    const purchasedHolders = toHolders(assignments.slice(0, purchasedCount))
    const includesSelf = hasSelfTicket(purchasedHolders)

    return (
      <div className="pb-10">
        <WebPageHeader title="Order confirmed" subtitle={event.title} />
        <div className="web-container flex max-w-lg flex-col items-center py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
          <h2 className="mt-4 text-2xl font-bold">
            {includesSelf ? "You're in!" : 'Tickets confirmed!'}
          </h2>
          <p className="mt-2 text-slate-400">
            {purchasedCount} ticket{purchasedCount > 1 ? 's' : ''} confirmed
            {!includesSelf && ' — sent to your guests'}
          </p>

          <div className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <p className="text-sm text-slate-400">{event.title}</p>
            <p className="text-xl font-bold">{ticket.name}</p>
            <div className="mt-4 flex h-24 items-center justify-center rounded-lg bg-white/10">
              <div className="h-16 w-16 rounded-lg bg-white" />
            </div>
            <div className="mt-4 space-y-2">
              {purchasedHolders.map((holder, i) => (
                <p key={i} className="text-sm text-slate-400">
                  Ticket {i + 1}: <span className="font-semibold text-white">{getHolderLabel(holder)}</span>
                </p>
              ))}
            </div>
          </div>

          {showGoingPrompt && includesSelf ? (
            <div className="mt-6 w-full">
              <GoingPostPrompt
                event={event}
                ticketCount={purchasedCount}
                onSkip={() => setShowGoingPrompt(false)}
              />
            </div>
          ) : (
            <Link to="/my-events" className="mt-8 w-full rounded-xl bg-primary py-3.5 text-center font-semibold">
              View my tickets
            </Link>
          )}
        </div>
      </div>
    )
  }

  const summaryProps = {
    event,
    ticket,
    quantity,
    preorderSubtotal,
    subtotal,
    total,
  }

  const actionProps = {
    step,
    canContinue,
    stepping,
    paying,
    paymentSelection,
    methods,
    total,
    onContinue: handleContinue,
    onPay: handlePay,
  }

  return (
    <div className="pb-10 lg:pb-10">
      <WebPageHeader
        title="Get tickets"
        subtitle={`Step ${step} of 4 · ${STEP_LABELS[step - 1]}`}
        actions={
          <Link
            to="/event"
            state={{ eventId: event.id }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← Back to event
          </Link>
        }
      />

      <div className="web-container">
        <div className="mb-6 flex gap-2 lg:max-w-2xl">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-white/10'}`} />
              <p className={`mt-1 text-center text-xs ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-5 text-left">
            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold">Select tickets</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ticketTypes.map((tt) => (
                    <button
                      key={tt.id}
                      type="button"
                      disabled={tt.available === 0}
                      onClick={() => setSelected(tt.id)}
                      className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                        selected === tt.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      } ${tt.available === 0 ? 'opacity-40' : ''}`}
                    >
                      <p className="font-medium">{tt.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{tt.perks.join(' · ')}</p>
                      <p className="mt-3 text-xl font-bold">${tt.price}</p>
                      {tt.available === 0 && (
                        <p className="mt-1 text-xs text-danger">Sold out</p>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="font-semibold">How many tickets?</p>
                    <p className="text-sm text-slate-400">Assign attendees on the next step</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-lg font-bold">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= Math.min(6, ticket.available)}
                      onClick={() => setQuantity((q) => Math.min(6, ticket.available, q + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <AttendeePicker
                quantity={quantity}
                assignments={assignments}
                onChange={setAssignments}
              />
            )}

            {step === 3 && (
              <>
                <h3 className="text-lg font-semibold">Add-ons & menu</h3>
                <CheckoutMenuAddons
                  menu={menu}
                  eventId={event.id}
                  ticketPerks={ticket.perks}
                  cart={preorderCart}
                  onCartChange={setPreorderCart}
                />
                <input
                  placeholder="Promo code"
                  className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/40"
                />
              </>
            )}

            {step === 4 && (
              <>
                <h3 className="text-lg font-semibold lg:hidden">Order summary</h3>
                <div className="space-y-4 lg:hidden">
                  <OrderSummary {...summaryProps} />
                </div>
                <PaymentMethodPicker
                  selected={paymentSelection}
                  onSelect={setPaymentSelection}
                  checkoutReturnState={checkoutReturnState}
                />
              </>
            )}

            <div className="hidden lg:block">
              <CheckoutActions {...actionProps} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <OrderSummary {...summaryProps} />
              <CheckoutActions {...actionProps} />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl lg:hidden">
        <div className="web-container py-4">
          <CheckoutActions {...actionProps} />
        </div>
      </div>
    </div>
  )
}
