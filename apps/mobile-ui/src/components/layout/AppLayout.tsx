import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'

const TAB_ROUTES = ['/feed', '/explorer', '/my-events', '/profile']

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
