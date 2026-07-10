import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type PaymentMethod = {
  id: string
  type: 'card' | 'apple_pay'
  label: string
  brand?: string
  last4?: string
  expiry?: string
  isDefault: boolean
}

type PaymentMethodsContextValue = {
  methods: PaymentMethod[]
  selectedId: string | null
  selectMethod: (id: string) => void
  addCard: (card: { number: string; expiry: string; name: string }) => PaymentMethod
  removeMethod: (id: string) => void
  hasMethods: boolean
}

const STORAGE_KEY = 'event-payment-methods'

export const APPLE_PAY_METHOD_ID = 'apple_pay'

function loadMethods(): PaymentMethod[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null)

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(loadMethods)
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const loaded = loadMethods()
    return loaded.find((m) => m.isDefault)?.id ?? loaded[0]?.id ?? null
  })

  const persist = useCallback((next: PaymentMethod[]) => {
    setMethods(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const selectMethod = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const addCard = useCallback(
    (card: { number: string; expiry: string; name: string }) => {
      const digits = card.number.replace(/\D/g, '')
      const last4 = digits.slice(-4)
      const brand = digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : 'Card'
      const method: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'card',
        label: `${brand} •••• ${last4}`,
        brand,
        last4,
        expiry: card.expiry,
        isDefault: methods.length === 0,
      }
      const next = [...methods.map((m) => ({ ...m, isDefault: false })), { ...method, isDefault: true }]
      persist(next)
      setSelectedId(method.id)
      return method
    },
    [methods, persist],
  )

  const removeMethod = useCallback(
    (id: string) => {
      const next = methods.filter((m) => m.id !== id)
      if (next.length > 0 && !next.some((m) => m.isDefault)) next[0].isDefault = true
      persist(next)
      if (selectedId === id) setSelectedId(next[0]?.id ?? null)
    },
    [methods, persist, selectedId],
  )

  return (
    <PaymentMethodsContext.Provider
      value={{
        methods,
        selectedId,
        selectMethod,
        addCard,
        removeMethod,
        hasMethods: methods.length > 0,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  )
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext)
  if (!ctx) throw new Error('usePaymentMethods must be used within PaymentMethodsProvider')
  return ctx
}
