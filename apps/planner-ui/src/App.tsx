import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import PlannerHomePage from './pages/PlannerPage'
import CreateEventPage from './pages/CreateEventPage'
import CreatorPage from './pages/CreatorPage'
import ScannerPage from './pages/ScannerPage'
import BarDisplayPage from './pages/BarDisplayPage'
import ClubPageEditor from './pages/club/ClubPageEditor'
import ClubEventsPage from './pages/club/ClubEventsPage'
import ClubEventManagePage from './pages/club/ClubEventManagePage'
import ClubTeamPage from './pages/club/ClubTeamPage'
import ClubAnalyticsPage from './pages/club/ClubAnalyticsPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import EventDetailPage from './pages/EventDetailPage'
import { RequireAuth } from './components/layout/RequireAuth'
import { SocialProvider } from './context/SocialContext'
import { PostsProvider } from './context/PostsContext'

function AppRoutes() {
  return (
    <div className="relative mx-auto min-h-screen max-w-md ios-mesh-bg">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<PlannerHomePage />} />
          <Route path="/club/events" element={<ClubEventsPage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/club/scanner" element={<ScannerPage />} />
          <Route path="/club/analytics" element={<ClubAnalyticsPage />} />
        </Route>

        <Route path="/club/page" element={<ClubPageEditor />} />
        <Route path="/club/events/:eventId" element={<ClubEventManagePage />} />
        <Route path="/club/team" element={<ClubTeamPage />} />
        <Route path="/club/bar" element={<BarDisplayPage />} />
        <Route path="/page/:handle" element={<CreatorPage />} />
        <Route path="/event" element={<EventDetailPage />} />

        <Route path="/planner" element={<Navigate to="/" replace />} />
        <Route path="/feed" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/scanner" element={<Navigate to="/club/scanner" replace />} />
        <Route path="/bar" element={<Navigate to="/club/bar" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <SocialProvider>
      <PostsProvider>
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
      </PostsProvider>
    </SocialProvider>
  )
}
