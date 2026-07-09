import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Settings } from 'lucide-react'
import { WebPageHeader } from '../components/layout/WebLayout'
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
    <div className="pb-10">
      <WebPageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        actions={
          <Link
            to="/settings"
            state={{ fromTab: '/feed' }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
            aria-label="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        }
      />

      <div className="web-container mx-auto max-w-2xl">
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
