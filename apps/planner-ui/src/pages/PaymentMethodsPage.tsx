import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, CreditCard, Trash2 } from 'lucide-react'
import { usePaymentMethods } from '../context/PaymentMethodsContext'
import { useToast } from '../context/ToastContext'
import { FormField, FormInput } from '../components/ui/FormPrimitives'

type PaymentMethodsPageState = {
  returnTo?: string
  returnState?: unknown
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { returnTo, returnState } = (location.state as PaymentMethodsPageState | null) ?? {}
  const { methods, addCard, removeMethod, selectMethod } = usePaymentMethods()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [showForm, setShowForm] = useState(methods.length === 0)

  const canAdd =
    cardNumber.replace(/\D/g, '').length >= 15 && expiry.length >= 4 && name.trim().length > 0

  const goBack = () => {
    if (returnTo) navigate(returnTo, { state: returnState })
    else navigate('/settings')
  }

  const handleAdd = () => {
    if (!canAdd) return
    const method = addCard({ number: cardNumber, expiry, name })
    selectMethod(method.id)
    setName('')
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setShowForm(false)
    toast('✓ Payment method added')
    if (returnTo) {
      setTimeout(() => navigate(returnTo, { state: returnState }), 400)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-10">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 rounded-full liquid-glass-subtle px-3 py-1.5 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {returnTo ? 'Back to checkout' : 'Settings'}
        </button>
        <h1 className="flex-1 text-sm font-bold">Payment methods</h1>
      </header>

      <div className="space-y-6 p-4 text-left">
        <p className="ios-caption">
          Manage cards saved to your account. Apple Pay is available at checkout on supported devices.
        </p>

        {methods.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-white/35">
              Saved cards
            </h2>
            <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#12121c]/80">
              {methods.map((method, i) => (
                <div
                  key={method.id}
                  className={`flex items-center gap-3 px-4 py-4 ${
                    i < methods.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <CardBrandBadge brand={method.brand} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{method.label}</p>
                    {method.expiry && (
                      <p className="text-xs text-white/40">Expires {method.expiry}</p>
                    )}
                  </div>
                  {method.isDefault && (
                    <span className="rounded-full bg-[#0a84ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#64b5ff]">
                      Default
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      removeMethod(method.id)
                      toast('Payment method removed')
                    }}
                    className="rounded-full p-2 text-white/35 hover:text-[#ff453a]"
                    aria-label="Remove card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/20 py-4 text-sm font-semibold text-[#0a84ff]"
          >
            <CreditCard className="h-4 w-4" />
            Add new card
          </button>
        ) : (
          <section className="rounded-[20px] liquid-glass p-4">
            <h2 className="mb-4 font-semibold">Add card</h2>
            <div className="space-y-3">
              <FormField label="Name on card">
                <FormInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="cc-name"
                />
              </FormField>
              <FormField label="Card number">
                <FormInput
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Expiry">
                  <FormInput
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                  />
                </FormField>
                <FormField label="CVC">
                  <FormInput
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </FormField>
              </div>
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAdd}
                className="ios-button w-full py-3.5 disabled:opacity-40"
              >
                Save card
              </button>
              {methods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full py-2 text-sm text-white/45"
                >
                  Cancel
                </button>
              )}
            </div>
          </section>
        )}

        <p className="text-center text-[11px] leading-relaxed text-white/30">
          Your payment information is encrypted. We never store your full card number or CVC.
        </p>

        {!returnTo && (
          <Link to="/settings" className="block text-center text-sm text-[#0a84ff]">
            Back to settings
          </Link>
        )}
      </div>
    </div>
  )
}

function CardBrandBadge({ brand }: { brand?: string }) {
  const label = brand ?? 'Card'
  const color =
    label === 'Visa'
      ? 'bg-[#1a1f71]'
      : label === 'Mastercard'
        ? 'bg-[#eb001b]'
        : 'bg-white/15'
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white ${color}`}
    >
      {label === 'Visa' ? 'VISA' : label === 'Mastercard' ? 'MC' : '💳'}
    </div>
  )
}
