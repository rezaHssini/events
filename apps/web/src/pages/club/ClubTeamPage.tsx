import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ChefHat, Crown, UserPlus } from 'lucide-react'
import { WebClubHeader } from '../../components/club/WebClubHeader'
import { Badge } from '../../components/UI'
import { ResponsiveDialog } from '../../components/ui/ResponsiveDialog'
import { useToast } from '../../context/ToastContext'
import { clubTeamMembers } from '../../data/plannerData'

const roleMeta = {
  'co-organizer': { label: 'Co-organizer', icon: Crown, color: 'text-warning' },
  security: { label: 'Security', icon: Shield, color: 'text-secondary' },
  bar: { label: 'Bar / Kitchen', icon: ChefHat, color: 'text-pink-400' },
  volunteer: { label: 'Volunteer', icon: UserPlus, color: 'text-slate-400' },
}

export default function ClubTeamPage() {
  const { toast } = useToast()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<keyof typeof roleMeta>('volunteer')

  const sendInvite = () => {
    if (!email.trim()) return
    toast(`✓ Invite sent to ${email}`)
    setEmail('')
    setInviteOpen(false)
  }

  return (
    <div className="pb-10">
      <WebClubHeader title="Team" subtitle="Club-wide roster — assign per event in event settings" />

      <div className="web-container max-w-3xl">
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-semibold text-primary-light"
        >
          <UserPlus className="h-4 w-4" />
          Invite team member
        </button>

        <div className="space-y-3">
          {clubTeamMembers.map((member) => {
            const meta = roleMeta[member.role]
            const Icon = meta.icon
            return (
              <div key={member.id} className="flex items-center gap-3 rounded-2xl glass p-4">
                <img src={member.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1 text-left">
                  <p className="font-semibold">{member.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                    <span className="text-xs text-slate-400">{meta.label}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Assigned to {member.eventsAssigned} event{member.eventsAssigned !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant={member.role === 'co-organizer' ? 'primary' : 'default'}>
                  {meta.label}
                </Badge>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm">
          <p className="font-medium">How roles work</p>
          <ul className="mt-2 space-y-2 text-xs text-slate-400">
            <li>• <strong className="text-slate-300">Security</strong> — scans tickets at the door for assigned events</li>
            <li>• <strong className="text-slate-300">Bar / Kitchen</strong> — fulfills pre-orders & scans perk QR codes</li>
            <li>• Assign staff per event in <Link to="/club/events" className="text-primary-light">My events → event → Team</Link></li>
          </ul>
        </div>
      </div>

      <ResponsiveDialog open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite team member" maxWidthClass="max-w-md">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="mb-3 w-full rounded-[16px] bg-white/10 px-4 py-3.5"
        />
        <p className="mb-2 ios-caption text-left">Role</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(roleMeta) as Array<keyof typeof roleMeta>).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full px-3 py-1.5 text-xs ${role === r ? 'bg-[#0a84ff]' : 'bg-white/10'}`}
            >
              {roleMeta[r].label}
            </button>
          ))}
        </div>
        <button type="button" onClick={sendInvite} className="w-full rounded-xl bg-primary py-3 font-semibold">Send invite</button>
      </ResponsiveDialog>
    </div>
  )
}
