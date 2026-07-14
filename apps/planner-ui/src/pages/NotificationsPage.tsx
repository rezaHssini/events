import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Settings } from 'lucide-react'
import { MainBackLink } from '../components/layout/MainBackButton'
import { NotificationRowSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'
import { notifications as initialNotifications } from '../data/notificationsData'

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications)
  const { isLoading } = useSimulatedQuery(items, [])
  const unreadCount = items.filter((n) => n.unread).length

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-10">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/95 px-4 pb-3 pt-[max(env(safe-area-inset-top,0px),12px)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <MainBackLink fallback="/feed" />
          <div className="min-w-0 flex-1 text-left">
            <h1 className="ios-headline">Notifications</h1>
            {unreadCount > 0 && (
              <p className="ios-caption">{unreadCount} unread</p>
            )}
          </div>
          <Link
            to="/settings"
            state={{ fromTab: '/feed' }}
            className="flex h-9 w-9 items-center justify-center rounded-full liquid-glass-subtle"
            aria-label="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="px-4 pt-4">
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="mb-4 w-full rounded-[16px] liquid-glass-subtle py-3 text-sm font-semibold text-[#0a84ff]"
          >
            Mark all as read
          </button>
        )}

        {isLoading ? (
          <NotificationRowSkeleton count={6} />
        ) : items.length === 0 ? (
          <div className="rounded-[22px] liquid-glass p-10 text-center">
            <Bell className="mx-auto h-10 w-10 text-white/25" />
            <p className="mt-4 font-semibold">You&apos;re all caught up</p>
            <p className="mt-1 ios-caption">New activity will show up here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={n.to}
                  state={{ fromTab: '/feed' }}
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item)),
                    )
                  }
                  className={`flex items-start gap-3 rounded-[18px] border p-4 text-left transition-colors active:bg-white/5 ${
                    n.unread
                      ? 'border-[#0a84ff]/25 bg-[#0a84ff]/8'
                      : 'border-white/8 liquid-glass-subtle'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
                    {n.icon ?? '🔔'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{n.text}</p>
                    <p className="mt-1.5 ios-caption">{n.time}</p>
                  </div>
                  {n.unread && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0a84ff]" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <Link
          to="/settings"
          state={{ fromTab: '/feed' }}
          className="mt-6 block rounded-[16px] liquid-glass-subtle py-3 text-center text-sm font-medium text-[#0a84ff]"
        >
          Notification settings
        </Link>
      </div>
    </div>
  )
}
