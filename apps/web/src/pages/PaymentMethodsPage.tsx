import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Trash2 } from 'lucide-react'
import { usePaymentMethods } from '../context/PaymentMethodsContext'
import { useToast } from '../context/ToastContext'
import { FormField, FormInput } from '../components/ui/FormPrimitives'
import { WebPageHeader } from '../components/layout/WebLayout'

type PaymentMethodsPageState = {
  returnTo?: string
  returnState?: unknown
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { returnTo, returnState } = (location.state as PaymentMethodsPageState | null) ?? {}
  const { methods, addCard, removeMethod } = usePaymentMethods()
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
    addCard({ number: cardNumber, expiry, name })
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
    <div className="pb-10">
      <WebPageHeader
        title="Payment methods"
        subtitle="Cards saved to your account for faster checkout"
        actions={
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← {returnTo ? 'Back to checkout' : 'Back to settings'}
          </button>
        }
      />

      <div className="web-container max-w-4xl">
        <p className="mb-6 text-sm text-slate-400">
          Apple Pay is available at checkout on supported devices. Your payment information is
          encrypted — we never store your full card number or CVC.
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Saved cards
            </h2>
            {methods.length > 0 ? (
              <div className="space-y-2">
                {methods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <CardBrandBadge brand={method.brand} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{method.label}</p>
                      {method.expiry && (
                        <p className="text-xs text-slate-400">Expires {method.expiry}</p>
                      )}
                    </div>
                    {method.isDefault && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary-light">
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        removeMethod(method.id)
                        toast('Payment method removed')
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-danger"
                      aria-label="Remove card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 text-sm text-slate-400">No saved cards yet</p>
              </div>
            )}

            {!showForm && methods.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm font-semibold text-primary-light hover:bg-white/5"
              >
                <CreditCard className="h-4 w-4" />
                Add another card
              </button>
            )}
          </section>

          <section>
            {showForm ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
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
                    className="w-full rounded-xl bg-primary py-3 font-semibold disabled:opacity-40"
                  >
                    Save card
                  </button>
                  {methods.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-full py-2 text-sm text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : methods.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-sm text-slate-400">Add a card to use at checkout</p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold"
                >
                  <CreditCard className="h-4 w-4" />
                  Add card
                </button>
              </div>
            ) : null}
          </section>
        </div>

        {!returnTo && (
          <Link to="/settings" className="mt-8 inline-block text-sm text-primary-light hover:underline">
            ← Back to settings
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
