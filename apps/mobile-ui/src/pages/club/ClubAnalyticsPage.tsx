import { motion } from 'framer-motion'
import { TrendingUp, Ticket, Users, MapPin, Tag } from 'lucide-react'
import { ClubBackHeader } from '../../components/club/ClubBackHeader'
import { clubAnalytics } from '../../data/plannerData'
import { usePlanner } from '../../context/PlannerContext'

export default function ClubAnalyticsPage() {
  const { managedEvents } = usePlanner()
  const liveEvents = managedEvents.filter((e) => e.status === 'live' || e.status === 'upcoming')
  const maxMonthly = Math.max(...clubAnalytics.monthlyRevenue.map((m) => m.value))

  return (
    <div className="min-h-screen pb-8">
      <ClubBackHeader title="Analytics" subtitle="Performance across all your events" />

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            icon={TrendingUp}
            label="Total revenue"
            value={`$${clubAnalytics.totalRevenue.toLocaleString()}`}
            delta={`+${clubAnalytics.followerGrowth}%`}
          />
          <MetricCard icon={Ticket} label="Tickets sold" value={String(clubAnalytics.ticketsSold)} />
          <MetricCard icon={Users} label="Avg attendance" value={String(clubAnalytics.avgAttendance)} />
          <MetricCard icon={Tag} label="Top category" value={clubAnalytics.topCategory} />
        </div>

        <div className="mt-5 rounded-2xl glass p-4 text-left">
          <p className="text-sm font-semibold">Monthly revenue</p>
          <div className="mt-4 flex items-end justify-between gap-2 h-28">
            {clubAnalytics.monthlyRevenue.map((m, i) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.value / maxMonthly) * 100}%` }}
                  transition={{ delay: i * 0.08 }}
                  className="w-full min-h-[4px] rounded-t-lg gradient-hero"
                />
                <span className="text-[10px] text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl glass p-4 text-left">
          <p className="text-sm font-semibold">Events by category</p>
          <div className="mt-3 space-y-2">
            {clubAnalytics.eventsByCategory.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between text-xs">
                  <span>{item.category}</span>
                  <span className="text-slate-400">{item.count} events</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-secondary/80"
                    style={{ width: `${(item.count / 18) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl glass p-4 text-left">
          <p className="mb-3 text-sm font-semibold flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary-light" />
            Active events performance
          </p>
          {liveEvents.map((event) => (
            <div key={event.id} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm">
                <span className="font-medium line-clamp-1">{event.title}</span>
                <span className="shrink-0 text-primary-light">${event.revenue.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {event.category} · {event.city} · {event.sold}/{event.capacity} sold
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  delta?: string
}) {
  return (
    <div className="rounded-2xl glass p-4 text-left">
      <Icon className="h-4 w-4 text-primary-light" />
      <p className="mt-2 text-xl font-bold">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
      {delta && <p className="mt-1 text-[10px] text-success">{delta} vs last month</p>}
    </div>
  )
}
