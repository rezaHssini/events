import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoginPromptSheet } from '../components/auth/LoginPromptSheet'

type LoginGateContextValue = {
  requireLogin: (action?: () => void) => boolean
  openLoginPrompt: () => void
}

const LoginGateContext = createContext<LoginGateContextValue | null>(null)

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      const action = pendingAction
      setPendingAction(null)
      setOpen(false)
      action()
    }
  }, [isAuthenticated, pendingAction])

  const openLoginPrompt = useCallback(() => {
    setOpen(true)
  }, [])

  const requireLogin = useCallback(
    (action?: () => void) => {
      if (isAuthenticated) {
        action?.()
        return true
      }
      setPendingAction(() => action ?? null)
      setOpen(true)
      return false
    },
    [isAuthenticated],
  )

  const goToAuth = () => {
    setOpen(false)
    navigate('/auth')
  }

  return (
    <LoginGateContext.Provider value={{ requireLogin, openLoginPrompt }}>
      {children}
      <LoginPromptSheet
        open={open}
        onClose={() => {
          setOpen(false)
          setPendingAction(null)
        }}
        onSignIn={goToAuth}
      />
    </LoginGateContext.Provider>
  )
}

export function useLoginGate() {
  const ctx = useContext(LoginGateContext)
  if (!ctx) throw new Error('useLoginGate must be used within LoginGateProvider')
  return ctx
}
