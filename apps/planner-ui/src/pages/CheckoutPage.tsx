import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { MobileHeader } from '../components/UI'
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
  }, [methods])

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
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
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
        <p className="mt-2 ios-caption">
          {purchasedCount} ticket{purchasedCount > 1 ? 's' : ''} confirmed for {event.title}
          {!includesSelf && ' — sent to your guests'}
        </p>

        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 w-full max-w-sm rounded-[24px] liquid-glass p-5"
        >
          <p className="text-left text-sm text-[rgba(235,235,245,0.55)]">{event.title}</p>
          <p className="text-left text-xl font-bold">{ticket.name}</p>
          <div className="mt-4 flex h-24 items-center justify-center rounded-[18px] bg-white/10">
            <div className="h-16 w-16 rounded-lg bg-white" />
          </div>
          <div className="mt-4 space-y-2 text-left">
            {purchasedHolders.map((holder, i) => (
              <p key={i} className="ios-caption">
                Ticket {i + 1}: <span className="font-semibold text-white">{getHolderLabel(holder)}</span>
              </p>
            ))}
          </div>
        </motion.div>

        {showGoingPrompt && includesSelf ? (
          <GoingPostPrompt
            event={event}
            ticketCount={purchasedCount}
            onSkip={() => setShowGoingPrompt(false)}
          />
        ) : (
          <Link to="/my-events" className="ios-button mt-8 w-full max-w-sm py-3.5 text-[17px]">
            View my tickets
          </Link>
        )}
      </div>
    )
  }

  const stepLabels = ['Tickets', 'People', 'Add-ons', 'Pay']

  return (
    <div className="min-h-screen pb-28">
      <MobileHeader title="Checkout" back="/event" />

      <div className="px-4 py-3">
        <div className="flex gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full ${step > i ? 'bg-[#0a84ff]' : 'bg-white/10'}`} />
              <p className={`mt-1 text-center text-[10px] ${step === i + 1 ? 'text-white' : 'text-[rgba(235,235,245,0.35)]'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 text-left">
        <div className="liquid-glass-subtle rounded-[18px] p-4">
          <p className="font-semibold">{event.title}</p>
          <p className="ios-caption">{event.date} · {event.location}</p>
        </div>

        {step === 1 && (
          <>
            <h3 className="ios-headline">Select tickets</h3>
            {ticketTypes.map((tt) => (
              <button
                key={tt.id}
                type="button"
                disabled={tt.available === 0}
                onClick={() => setSelected(tt.id)}
                className={`flex w-full items-center justify-between rounded-[18px] p-4 text-left transition-all ${
                  selected === tt.id ? 'bg-[#0a84ff]/20 ring-2 ring-[#0a84ff]' : 'liquid-glass-subtle'
                } ${tt.available === 0 ? 'opacity-40' : ''}`}
              >
                <div>
                  <p className="font-medium">{tt.name}</p>
                  <p className="ios-caption">{tt.perks.join(' · ')}</p>
                </div>
                <p className="font-bold">${tt.price}</p>
              </button>
            ))}

            <div className="liquid-glass-subtle flex items-center justify-between rounded-[18px] p-4">
              <div>
                <p className="font-semibold">How many tickets?</p>
                <p className="ios-caption">For yourself or others — assign on the next step</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-lg font-bold">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= Math.min(6, ticket.available)}
                  onClick={() => setQuantity((q) => Math.min(6, ticket.available, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
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
            <h3 className="ios-headline">Add-ons & menu</h3>
            <CheckoutMenuAddons
              menu={menu}
              eventId={event.id}
              ticketPerks={ticket.perks}
              cart={preorderCart}
              onCartChange={setPreorderCart}
            />
            <input
              placeholder="Promo code"
              className="w-full rounded-[16px] bg-white/10 px-4 py-3.5 text-[17px] outline-none placeholder:text-white/35"
            />
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="ios-headline">Order summary</h3>
            <div className="space-y-2 rounded-[18px] liquid-glass-subtle p-4">
              <div className="flex justify-between text-sm">
                <span>{ticket.name} × {quantity}</span>
                <span>${subtotal}</span>
              </div>
              {preorderSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Menu pre-order</span>
                  <span>${preorderSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[rgba(235,235,245,0.45)]">
                <span>Service fee</span>
                <span>${SERVICE_FEE}</span>
              </div>
              <div className="ios-separator !mx-0" />
              <div className="flex justify-between text-[17px] font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <PaymentMethodPicker
              selected={paymentSelection}
              onSelect={setPaymentSelection}
              checkoutReturnState={checkoutReturnState}
            />
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl">
        {step < 4 ? (
          <AsyncButton
            disabled={!canContinue}
            loading={stepping}
            loadingLabel="Continuing…"
            onClick={handleContinue}
            className="w-full py-3.5 text-[17px] disabled:opacity-40"
          >
            Continue
          </AsyncButton>
        ) : paymentSelection.type === 'apple_pay' ? (
          <AsyncButton
            variant="apple"
            loading={paying}
            loadingLabel={`Processing · $${total.toFixed(2)}`}
            onClick={handlePay}
            className="w-full py-3.5 text-[17px]"
          >
            Pay with Apple Pay · ${total.toFixed(2)}
          </AsyncButton>
        ) : (
          <AsyncButton
            loading={paying}
            loadingLabel={`Processing · $${total.toFixed(2)}`}
            disabled={
              paymentSelection.type === 'card' &&
              !methods.some((m) => m.id === paymentSelection.id)
            }
            onClick={handlePay}
            className="w-full py-3.5 text-[17px] disabled:opacity-40"
          >
            Pay ${total.toFixed(2)}
          </AsyncButton>
        )}
      </div>
    </div>
  )
}
