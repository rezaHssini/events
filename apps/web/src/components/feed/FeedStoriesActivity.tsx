import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function FeedActivityCard({
  activity,
}: {
  activity: {
    id: string
    type: string
    user: { name: string; handle: string; avatar: string }
    event?: { title: string; cover: string; date: string; price: number | 'free' }
    time: string
    text?: string
  }
}) {
  const actionText: Record<string, string> = {
    going: 'is going to',
    memory: 'posted a memory from',
    shared_event: 'shared',
    liked_event: 'liked',
    follow: 'started following someone',
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="mb-4 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5"
    >
      <Link to={`/user/${activity.user.handle}`} className="shrink-0">
        <img
          src={activity.user.avatar}
          alt=""
          className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
        />
      </Link>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm leading-snug">
          <Link
            to={`/user/${activity.user.handle}`}
            className="font-semibold text-primary-light hover:underline"
          >
            {activity.user.name}
          </Link>{' '}
          <span className="text-slate-400">{actionText[activity.type] || 'updated'}</span>
        </p>
        {activity.event && (
          <Link to="/event" className="mt-2.5 flex gap-3 overflow-hidden rounded-xl bg-white/5 p-2.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              <img src={activity.event.cover} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{activity.event.title}</p>
              <p className="text-[11px] text-slate-400">{activity.event.date}</p>
              {activity.event.price !== 'free' && (
                <p className="text-[11px] font-medium text-primary-light">${activity.event.price}</p>
              )}
            </div>
          </Link>
        )}
        {activity.text && (
          <p className="mt-1.5 text-sm italic text-slate-400">&ldquo;{activity.text}&rdquo;</p>
        )}
        <p className="mt-1.5 text-[10px] text-slate-600">{activity.time}</p>
      </div>
    </motion.article>
  )
}
