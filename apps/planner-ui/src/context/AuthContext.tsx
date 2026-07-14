import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AuthUser {
  email?: string
  phone?: string
  identifier: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (identifier: string, method: 'email' | 'phone') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_KEY = 'planner-demo-auth'

function readStoredAuth(): { isAuthenticated: boolean; user: AuthUser | null } {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY)
    if (!raw) return { isAuthenticated: false, user: null }
    const parsed = JSON.parse(raw) as { user: AuthUser }
    return { isAuthenticated: true, user: parsed.user }
  } catch {
    return { isAuthenticated: false, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(stored.isAuthenticated)
  const [user, setUser] = useState<AuthUser | null>(stored.user)

  const login = useCallback((identifier: string, method: 'email' | 'phone') => {
    const authUser: AuthUser = {
      identifier,
      ...(method === 'email' ? { email: identifier } : { phone: identifier }),
    }
    setUser(authUser)
    setIsAuthenticated(true)
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: authUser }))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
