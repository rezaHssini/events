import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUserSettings } from '../../context/UserSettingsContext'

/** Redirects authenticated users away from /auth and completed users away from onboarding */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { prefs } = useUserSettings()
  const location = useLocation()

  if (isAuthenticated && location.pathname === '/auth') {
    return <Navigate to={prefs.onboardingCompleted ? '/feed' : '/onboarding'} replace />
  }

  if (isAuthenticated && prefs.onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/feed" replace />
  }

  return children
}
