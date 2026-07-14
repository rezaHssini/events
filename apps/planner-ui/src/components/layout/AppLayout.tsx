import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'

const TAB_ROUTES = ['/', '/club/events', '/create-event', '/club/scanner', '/club/analytics']

export function AppLayout() {
  const location = useLocation()
  const showTabBar = TAB_ROUTES.includes(location.pathname)

  return (
    <>
      <main className={`min-h-screen ${showTabBar ? 'pb-[84px]' : ''}`}>
        <Outlet />
      </main>
      {showTabBar && <BottomTabBar />}
    </>
  )
}
