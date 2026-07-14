import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import FeedPage from './pages/FeedPage'
import ExplorerPage from './pages/ExplorerPage'
import MyEventsPage from './pages/MyEventsPage'
import EventDetailPage from './pages/EventDetailPage'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import MemoryPage from './pages/MemoryPage'
import CreatorPage from './pages/CreatorPage'
import MessagesPage from './pages/MessagesPage'
import UserProfilePage, { MyProfilePage } from './pages/UserProfilePage'
import FindPeoplePage from './pages/FindPeoplePage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import SettingsPage from './pages/SettingsPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import NotificationsPage from './pages/NotificationsPage'
import EditProfilePage from './pages/EditProfilePage'
import BecomePlannerPage from './pages/BecomePlannerPage'
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
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/event" element={<EventDetailPage />} />
      </Route>

      {/* Full-screen flows */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/memory" element={<MemoryPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
      <Route path="/become-planner" element={<BecomePlannerPage />} />
      <Route path="/user/:handle" element={<UserProfilePage />} />
      <Route path="/user/:handle/:list" element={<UserProfilePage />} />
      <Route path="/page/:handle" element={<CreatorPage />} />
      <Route path="/find-people" element={<FindPeoplePage />} />

      {/* Planner tools moved to Planner Studio app */}
      <Route path="/planner" element={<Navigate to="/become-planner" replace />} />
      <Route path="/create-event" element={<Navigate to="/become-planner" replace />} />
      <Route path="/club/*" element={<Navigate to="/become-planner" replace />} />
      <Route path="/dashboard" element={<Navigate to="/become-planner" replace />} />
      <Route path="/scanner" element={<Navigate to="/become-planner" replace />} />
      <Route path="/bar" element={<Navigate to="/become-planner" replace />} />

      {/* Legacy redirects */}
      <Route path="/map" element={<Navigate to="/explorer" replace />} />
      <Route path="/wallet" element={<Navigate to="/my-events" replace />} />
      <Route path="/creator" element={<Navigate to="/page/neoncollective" replace />} />
      <Route path="/explore" element={<Navigate to="/explorer" replace />} />
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
