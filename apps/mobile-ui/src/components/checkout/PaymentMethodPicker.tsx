import { useNavigate } from 'react-router-dom'
import { ChevronRight, CreditCard, Plus, ShieldCheck } from 'lucide-react'
import { usePaymentMethods, APPLE_PAY_METHOD_ID } from '../../context/PaymentMethodsContext'

export type PaymentSelection =
  | { type: 'apple_pay' }
  | { type: 'card'; id: string }

export function PaymentMethodPicker({
  selected,
  onSelect,
  checkoutReturnState,
}: {
  selected: PaymentSelection
  onSelect: (selection: PaymentSelection) => void
  checkoutReturnState?: unknown
}) {
  const navigate = useNavigate()
  const { methods } = usePaymentMethods()

  const isSelected = (sel: PaymentSelection) => {
    if (sel.type === 'apple_pay' && selected.type === 'apple_pay') return true
    if (sel.type === 'card' && selected.type === 'card' && sel.id === selected.id) return true
    return false
  }

  const goAddPayment = () => {
    navigate('/payment-methods', {
      state: {
        returnTo: '/checkout',
        returnState: checkoutReturnState,
      },
    })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="ios-headline">Payment method</h3>
        <div className="flex items-center gap-1 text-[10px] text-white/35">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#12121c]/60">
        {methods.map((method, i) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect({ type: 'card', id: method.id })}
            className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors ${
              i < methods.length ? 'border-b border-white/[0.06]' : ''
            } ${isSelected({ type: 'card', id: method.id }) ? 'bg-[#0a84ff]/10' : 'hover:bg-white/[0.03]'}`}
          >
            <CardBrandIcon brand={method.brand} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{method.label}</p>
              {method.expiry && (
                <p className="text-xs text-white/40">Expires {method.expiry}</p>
              )}
            </div>
            {method.isDefault && (
              <span className="mr-1 rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/45">
                Default
              </span>
            )}
            <SelectionMark active={isSelected({ type: 'card', id: method.id })} />
          </button>
        ))}

        <button
          type="button"
          onClick={() => onSelect({ type: 'apple_pay' })}
          className={`flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-4 text-left transition-colors ${
            isSelected({ type: 'apple_pay' }) ? 'bg-[#0a84ff]/10' : 'hover:bg-white/[0.03]'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black ring-1 ring-white/15">
            <span className="text-xl font-medium text-white"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Apple Pay</p>
            <p className="text-xs text-white/40">Fast checkout with Face ID</p>
          </div>
          <SelectionMark active={isSelected({ type: 'apple_pay' })} />
        </button>

        <button
          type="button"
          onClick={goAddPayment}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.04]">
            <Plus className="h-5 w-5 text-[#0a84ff]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[#64b5ff]">Add payment method</p>
            <p className="text-xs text-white/40">Debit or credit card</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/25" />
        </button>
      </div>

      {methods.length === 0 && (
        <p className="px-1 text-xs text-white/40">
          No saved cards yet. Use Apple Pay or add a card to continue.
        </p>
      )}
    </section>
  )
}

function SelectionMark({ active }: { active: boolean }) {
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        active ? 'border-[#0a84ff] bg-[#0a84ff]' : 'border-white/25'
      }`}
    >
      {active && <div className="h-2 w-2 rounded-full bg-white" />}
    </div>
  )
}

function CardBrandIcon({ brand }: { brand?: string }) {
  const label = brand ?? 'Card'
  const bg =
    label === 'Visa'
      ? 'bg-[#1a1f71]'
      : label === 'Mastercard'
        ? 'bg-gradient-to-br from-[#eb001b] to-[#f79e1b]'
        : 'bg-white/12'
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white ${bg}`}
    >
      {label === 'Visa' ? (
        'VISA'
      ) : label === 'Mastercard' ? (
        'MC'
      ) : (
        <CreditCard className="h-5 w-5 text-white/70" />
      )}
    </div>
  )
}

export function paymentSelectionLabel(
  selection: PaymentSelection,
  methods: { id: string; label: string }[],
): string {
  if (selection.type === 'apple_pay') return 'Apple Pay'
  return methods.find((m) => m.id === selection.id)?.label ?? 'Card'
}

export { APPLE_PAY_METHOD_ID }
