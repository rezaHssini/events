import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Shield, ChefHat, BarChart3, UtensilsCrossed, Users } from 'lucide-react'
import { ClubBackHeader } from '../../components/club/ClubBackHeader'
import { Badge } from '../../components/UI'
import { usePlanner } from '../../context/PlannerContext'
import { clubTeamMembers, eventMenuPreview } from '../../data/plannerData'

const manageTabs = ['Overview', 'Menu', 'Team', 'Stats'] as const

export default function ClubEventManagePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { managedEvents, toggleEventStaff } = usePlanner()
  const [tab, setTab] = useState<(typeof manageTabs)[number]>('Overview')

  const event = managedEvents.find((e) => e.id === eventId)
  if (!event) return <Navigate to="/club/events" replace />

  const menuItems = eventMenuPreview[event.id] ?? []
  const sellPct = event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0

  return (
    <div className="min-h-screen pb-8">
      <ClubBackHeader title={event.title} subtitle={`${event.category} · ${event.city}`} backTo="/club/events" />

      <div className="relative h-36">
        <img src={event.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-left">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={event.status === 'live' ? 'success' : 'primary'}>{event.status}</Badge>
            <Badge variant="default">{event.category}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
            <MapPin className="h-3 w-3" />
            {event.location} · {event.address}
          </p>
        </div>
      </div>

      <div className="flex border-b border-white/10 px-4">
        {manageTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium ${
              tab === t ? 'border-b-2 border-primary text-primary-light' : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 text-left">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Tickets sold" value={`${event.sold}/${event.capacity}`} />
              <StatCard label="Revenue" value={`$${event.revenue.toLocaleString()}`} />
              <StatCard label="Menu type" value={event.menuType} />
              <StatCard label="Menu items" value={String(event.menuItemCount)} />
            </div>
            <div className="rounded-2xl glass p-4">
              <p className="text-sm font-medium">Sales progress</p>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sellPct}%` }}
                  className="h-full rounded-full gradient-hero"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">{sellPct}% capacity</p>
            </div>
            <div className="flex gap-2">
              <Link to="/create-event" state={{ editEventId: event.id, title: event.title }} className="flex-1 rounded-xl glass py-3 text-center text-sm font-medium">
                Edit event
              </Link>
              <Link to="/event" className="flex-1 rounded-xl bg-primary/20 py-3 text-center text-sm font-medium text-primary-light">
                View public page
              </Link>
            </div>
            {event.status === 'live' && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/club/scanner"
                  className="flex flex-col items-center gap-1 rounded-xl border border-secondary/30 bg-secondary/10 p-4"
                >
                  <Shield className="h-6 w-6 text-secondary" />
                  <span className="text-xs font-medium">Door scanner</span>
                </Link>
                <Link
                  to="/club/bar"
                  className="flex flex-col items-center gap-1 rounded-xl border border-warning/30 bg-warning/10 p-4"
                >
                  <ChefHat className="h-6 w-6 text-warning" />
                  <span className="text-xs font-medium">Bar display</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === 'Menu' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{event.menuType} menu</p>
                <p className="text-xs text-slate-400">Menu is defined per event</p>
              </div>
              <Link to="/create-event" state={{ editEventId: event.id }} className="text-xs text-primary-light">
                Edit menu →
              </Link>
            </div>
            {menuItems.length > 0 ? (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl glass p-3">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                    <p className="font-semibold text-primary-light">${item.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl glass p-6 text-center">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-2 text-sm text-slate-400">No menu items yet</p>
                <Link to="/create-event" state={{ editEventId: event.id }} className="mt-3 inline-block text-sm text-primary-light">
                  Set up menu for this event →
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === 'Team' && (
          <div>
            <p className="mb-4 text-xs text-slate-400">
              Assign security & bar staff per event — they only see tools for events they&apos;re on
            </p>

            <StaffSection
              title="Security"
              icon={Shield}
              color="text-secondary"
              assigned={event.staff.security}
              candidates={clubTeamMembers.filter((m) => m.role === 'security' || m.role === 'co-organizer')}
              onToggle={(member) =>
                toggleEventStaff(event.id, 'security', member.id, member.name, member.avatar)
              }
              isAssigned={(id) => event.staff.security.some((m) => m.id === id)}
            />

            <StaffSection
              title="Bar / Kitchen"
              icon={ChefHat}
              color="text-warning"
              assigned={event.staff.bar}
              candidates={clubTeamMembers.filter((m) => m.role === 'bar' || m.role === 'co-organizer')}
              onToggle={(member) =>
                toggleEventStaff(event.id, 'bar', member.id, member.name, member.avatar)
              }
              isAssigned={(id) => event.staff.bar.some((m) => m.id === id)}
            />

            <Link
              to="/club/team"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl glass py-3 text-sm text-slate-300"
            >
              <Users className="h-4 w-4" />
              Manage club-wide team
            </Link>
          </div>
        )}

        {tab === 'Stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Check-ins" value={String(Math.round(event.sold * 0.92))} icon={BarChart3} />
              <StatCard label="Pre-orders" value="47" icon={UtensilsCrossed} />
              <StatCard label="Perks redeemed" value="128" />
              <StatCard label="Avg rating" value="4.7★" />
            </div>
            <div className="rounded-2xl glass p-4">
              <p className="text-sm font-medium">Revenue breakdown</p>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Ticket sales" value={`$${(event.revenue * 0.82).toFixed(0)}`} />
                <Row label="Menu pre-orders" value={`$${(event.revenue * 0.15).toFixed(0)}`} />
                <Row label="Add-ons" value={`$${(event.revenue * 0.03).toFixed(0)}`} />
              </div>
            </div>
            <Link to="/club/analytics" className="block text-center text-sm text-primary-light">
              View club-wide analytics →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: typeof BarChart3
}) {
  return (
    <div className="rounded-xl glass p-3">
      {Icon && <Icon className="mb-1 h-4 w-4 text-primary-light" />}
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-300">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StaffSection({
  title,
  icon: Icon,
  color,
  assigned,
  candidates,
  onToggle,
  isAssigned,
}: {
  title: string
  icon: typeof Shield
  color: string
  assigned: { id: string; name: string; avatar: string }[]
  candidates: { id: string; name: string; avatar: string; role: string }[]
  onToggle: (member: { id: string; name: string; avatar: string }) => void
  isAssigned: (id: string) => boolean
}) {
  return (
    <div className="mb-5 rounded-2xl glass p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <p className="font-semibold">{title}</p>
        <span className="ml-auto text-xs text-slate-400">{assigned.length} assigned</span>
      </div>
      {assigned.length > 0 && (
        <div className="mb-3 flex -space-x-2">
          {assigned.map((m) => (
            <img key={m.id} src={m.avatar} alt="" className="h-8 w-8 rounded-full border-2 border-[#14141f]" title={m.name} />
          ))}
        </div>
      )}
      <div className="space-y-2">
        {candidates.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <img src={member.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-[10px] capitalize text-slate-400">{member.role.replace('-', ' ')}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggle(member)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isAssigned(member.id) ? 'bg-success/20 text-success' : 'bg-primary text-white'
              }`}
            >
              {isAssigned(member.id) ? 'Assigned' : 'Assign'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
