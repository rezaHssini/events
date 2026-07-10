import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import FeedPage from './pages/FeedPage'
import ExplorerPage from './pages/ExplorerPage'
import MyEventsPage from './pages/MyEventsPage'
import PlannerPage from './pages/PlannerPage'
import EventDetailPage from './pages/EventDetailPage'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import MemoryPage from './pages/MemoryPage'
import CreatorPage from './pages/CreatorPage'
import CreateEventPage from './pages/CreateEventPage'
import MessagesPage from './pages/MessagesPage'
import UserProfilePage, { MyProfilePage } from './pages/UserProfilePage'
import ScannerPage from './pages/ScannerPage'
import BarDisplayPage from './pages/BarDisplayPage'
import ClubPageEditor from './pages/club/ClubPageEditor'
import ClubEventsPage from './pages/club/ClubEventsPage'
import ClubEventManagePage from './pages/club/ClubEventManagePage'
import ClubTeamPage from './pages/club/ClubTeamPage'
import ClubAnalyticsPage from './pages/club/ClubAnalyticsPage'
import FindPeoplePage from './pages/FindPeoplePage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import SettingsPage from './pages/SettingsPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import NotificationsPage from './pages/NotificationsPage'
import EditProfilePage from './pages/EditProfilePage'
import { RequireAuth } from './components/layout/RequireAuth'
import { SocialProvider } from './context/SocialContext'
import { PostsProvider } from './context/PostsContext'

function AppRoutes() {
  return (
    <div className="relative mx-auto min-h-screen max-w-md ios-mesh-bg">
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Main tabs with bottom nav */}
      <Route element={<AppLayout />}>
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/event" element={<EventDetailPage />} />
      </Route>

      {/* Full-screen flows */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/memory" element={<MemoryPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<MyProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
      <Route path="/user/:handle" element={<UserProfilePage />} />
      <Route path="/user/:handle/:list" element={<UserProfilePage />} />
      <Route path="/page/:handle" element={<CreatorPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/club/page" element={<ClubPageEditor />} />
      <Route path="/club/events" element={<ClubEventsPage />} />
      <Route path="/club/events/:eventId" element={<ClubEventManagePage />} />
      <Route path="/club/team" element={<ClubTeamPage />} />
      <Route path="/club/analytics" element={<ClubAnalyticsPage />} />
      <Route path="/club/scanner" element={<ScannerPage />} />
      <Route path="/club/bar" element={<BarDisplayPage />} />
      <Route path="/find-people" element={<FindPeoplePage />} />
      {/* Legacy redirects */}
      <Route path="/map" element={<Navigate to="/explorer" replace />} />
      <Route path="/wallet" element={<Navigate to="/my-events" replace />} />
      <Route path="/dashboard" element={<Navigate to="/planner" replace />} />
      <Route path="/creator" element={<Navigate to="/page/neoncollective" replace />} />
      <Route path="/explore" element={<Navigate to="/explorer" replace />} />
      <Route path="/scanner" element={<Navigate to="/club/scanner" replace />} />
      <Route path="/bar" element={<Navigate to="/club/bar" replace />} />
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
