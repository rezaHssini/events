import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUserSettings } from '../../context/UserSettingsContext'

const PUBLIC_PATHS = ['/auth']

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { prefs } = useUserSettings()
  const location = useLocation()

  if (!isAuthenticated && !PUBLIC_PATHS.includes(location.pathname)) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (isAuthenticated && location.pathname === '/auth') {
    return <Navigate to={prefs.onboardingCompleted ? '/feed' : '/onboarding'} replace />
  }

  if (
    isAuthenticated &&
    !prefs.onboardingCompleted &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />
  }

  if (isAuthenticated && prefs.onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/feed" replace />
  }

  return children
}
