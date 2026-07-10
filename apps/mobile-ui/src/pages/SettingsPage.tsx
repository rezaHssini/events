import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  CreditCard,
  Globe,
  Moon,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  Eye,
  MessageSquare,
  Ticket,
  MapPin,
  Mail,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserSettings } from '../context/UserSettingsContext'
import { usePaymentMethods } from '../context/PaymentMethodsContext'
import { useToast } from '../context/ToastContext'
import { BottomSheet } from '../components/ui/BottomSheet'

type SheetType =
  | 'email'
  | 'phone'
  | 'password'
  | 'blocked'
  | '2fa'
  | 'language'
  | 'location'
  | 'appearance'
  | 'help'
  | 'report'
  | 'terms'
  | 'privacy'
  | 'delete'
  | null

function SettingToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-slate-500">{desc}</p>}
      </div>
      <div className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-white/15'}`}>
        <motion.div layout className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${checked ? 'left-6' : 'left-1'}`} />
      </div>
    </button>
  )
}

function SettingLink({
  icon: Icon,
  label,
  desc,
  to,
  danger,
  onAction,
}: {
  icon: typeof User
  label: string
  desc?: string
  to?: string
  danger?: boolean
  onAction?: () => void
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-danger/15 text-danger' : 'bg-white/5 text-slate-300'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? 'text-danger' : ''}`}>{label}</p>
        {desc && <p className="text-xs text-slate-500">{desc}</p>}
      </div>
      {!danger && <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />}
    </div>
  )
  if (to) return <Link to={to}>{inner}</Link>
  return (
    <button type="button" className="w-full" onClick={onAction}>
      {inner}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="mb-1 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      <div className="divide-y divide-white/5 rounded-2xl border border-white/[0.08] bg-[#12121c]/80 px-4">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { prefs, updatePref } = useUserSettings()
  const { methods } = usePaymentMethods()
  const { toast } = useToast()
  const [sheet, setSheet] = useState<SheetType>(null)
  const [draft, setDraft] = useState('')

  const openSheet = (type: SheetType, initial = '') => {
    setDraft(initial)
    setSheet(type)
  }

  const saveDraft = (message: string) => {
    toast(`✓ ${message}`)
    setSheet(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-10">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <Link to="/profile" className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="flex-1 text-sm font-bold">Settings</h1>
      </header>

      <div className="p-4">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#12121c]/80 p-4">
          <img src={prefs.name ? '/images/avatar-reza.jpg' : '/images/avatar-reza.jpg'} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30" />
          <div className="text-left">
            <p className="font-bold">{prefs.name}</p>
            <p className="text-sm text-slate-400">@reza</p>
            <p className="text-xs text-slate-500">{user?.email ?? prefs.email}</p>
          </div>
        </div>

        <Section title="Account">
          <SettingLink icon={User} label="Edit profile" desc="Name, bio, avatar" to="/profile/edit" />
          <SettingLink icon={Mail} label="Email" desc={prefs.email} onAction={() => openSheet('email', prefs.email)} />
          <SettingLink icon={Smartphone} label="Mobile number" desc={prefs.phone || 'Not set'} onAction={() => openSheet('phone', prefs.phone)} />
          <SettingLink icon={Lock} label="Change password" desc="Update security" onAction={() => openSheet('password')} />
        </Section>

        <Section title="Privacy">
          <SettingToggle label="Private account" desc="Only followers see your content" checked={prefs.privateAccount} onChange={(v) => updatePref('privateAccount', v)} />
          <SettingToggle label="Show activity status" desc="Let friends see when you're online" checked={prefs.showActivity} onChange={(v) => updatePref('showActivity', v)} />
          <SettingToggle label="Show events on profile" desc="Display upcoming events" checked={prefs.showEventsOnProfile} onChange={(v) => updatePref('showEventsOnProfile', v)} />
          <SettingLink icon={Eye} label="Blocked accounts" desc="Manage blocked users" onAction={() => openSheet('blocked')} />
          <SettingLink icon={Shield} label="Two-factor authentication" desc="Extra security layer" onAction={() => openSheet('2fa')} />
        </Section>

        <Section title="Notifications">
          <SettingToggle label="Push notifications" checked={prefs.pushNotifications} onChange={(v) => updatePref('pushNotifications', v)} />
          <SettingToggle label="Email digests" desc="Weekly event roundup" checked={prefs.emailDigests} onChange={(v) => updatePref('emailDigests', v)} />
          <SettingToggle label="Event reminders" desc="Before tickets you bought" checked={prefs.eventReminders} onChange={(v) => updatePref('eventReminders', v)} />
          <SettingToggle label="Messages" checked={prefs.messageNotifications} onChange={(v) => updatePref('messageNotifications', v)} />
          <SettingToggle label="Planner updates" desc="From clubs you follow" checked={prefs.plannerUpdates} onChange={(v) => updatePref('plannerUpdates', v)} />
          <SettingToggle label="Friend activity" desc="When friends go to events" checked={prefs.friendActivity} onChange={(v) => updatePref('friendActivity', v)} />
        </Section>

        <Section title="Preferences">
          <SettingLink icon={Globe} label="Language" desc={prefs.language} onAction={() => openSheet('language', prefs.language)} />
          <SettingLink icon={MapPin} label="Default location" desc={prefs.location} onAction={() => openSheet('location', prefs.location)} />
          <SettingLink icon={Moon} label="Appearance" desc={prefs.appearance} onAction={() => openSheet('appearance')} />
          <SettingToggle label="Reduce motion" desc="Fewer animations" checked={prefs.reduceMotion} onChange={(v) => updatePref('reduceMotion', v)} />
        </Section>

        <Section title="Tickets & payments">
          <SettingLink
            icon={CreditCard}
            label="Payment methods"
            desc={methods.length === 0 ? 'Cards & Apple Pay' : `${methods.length} saved`}
            to="/payment-methods"
          />
          <SettingLink icon={Ticket} label="Purchase history" desc="Past ticket orders" to="/my-events" />
          <SettingToggle label="Receipt emails" desc="Send to primary email" checked={prefs.receiptEmails} onChange={(v) => updatePref('receiptEmails', v)} />
        </Section>

        <Section title="Support">
          <SettingLink icon={HelpCircle} label="Help center" onAction={() => openSheet('help')} />
          <SettingLink icon={MessageSquare} label="Report a problem" onAction={() => openSheet('report')} />
          <SettingLink icon={FileText} label="Terms of service" onAction={() => openSheet('terms')} />
          <SettingLink icon={FileText} label="Privacy policy" onAction={() => openSheet('privacy')} />
        </Section>

        <Section title="Danger zone">
          <SettingLink icon={Trash2} label="Delete account" desc="Permanent — cannot be undone" danger onAction={() => openSheet('delete')} />
        </Section>

        <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={handleLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 py-4 font-semibold text-danger">
          <LogOut className="h-5 w-5" />
          Log out
        </motion.button>
      </div>

      <BottomSheet open={sheet === 'email'} onClose={() => setSheet(null)} title="Email">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        <button type="button" onClick={() => { updatePref('email', draft); saveDraft('Email updated') }} className="ios-button mt-4 w-full py-3">Save</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'phone'} onClose={() => setSheet(null)} title="Mobile number">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="+1 555 000 0000" className="w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        <button type="button" onClick={() => { updatePref('phone', draft); saveDraft('Phone updated') }} className="ios-button mt-4 w-full py-3">Save</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'password'} onClose={() => setSheet(null)} title="Change password">
        <input type="password" placeholder="Current password" className="mb-3 w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        <input type="password" placeholder="New password" className="mb-3 w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        <button type="button" onClick={() => saveDraft('Password updated')} className="ios-button w-full py-3">Update password</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'blocked'} onClose={() => setSheet(null)} title="Blocked accounts">
        <p className="ios-caption">No blocked accounts. People you block won&apos;t be able to find your profile or message you.</p>
      </BottomSheet>

      <BottomSheet open={sheet === '2fa'} onClose={() => setSheet(null)} title="Two-factor authentication">
        <p className="mb-4 ios-caption">Add an extra layer of security with SMS or authenticator app.</p>
        <button type="button" onClick={() => saveDraft('2FA enabled')} className="ios-button w-full py-3">Enable 2FA</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'language'} onClose={() => setSheet(null)} title="Language">
        {['English', 'Spanish', 'French', 'Persian'].map((lang) => (
          <button key={lang} type="button" onClick={() => { updatePref('language', lang); saveDraft(`Language set to ${lang}`) }} className="mb-2 w-full rounded-[14px] bg-white/8 py-3 text-left px-4">{lang}</button>
        ))}
      </BottomSheet>

      <BottomSheet open={sheet === 'location'} onClose={() => setSheet(null)} title="Default location">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        <button type="button" onClick={() => { updatePref('location', draft); saveDraft('Location updated') }} className="ios-button mt-4 w-full py-3">Save</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'appearance'} onClose={() => setSheet(null)} title="Appearance">
        {(['dark', 'light', 'system'] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => { updatePref('appearance', mode); saveDraft(`Appearance: ${mode}`) }} className="mb-2 w-full rounded-[14px] bg-white/8 py-3 text-left px-4 capitalize">{mode}</button>
        ))}
      </BottomSheet>

      <BottomSheet open={sheet === 'help'} onClose={() => setSheet(null)} title="Help center">
        <p className="ios-caption mb-3">Common topics: tickets, refunds, account, events.</p>
        {['How do tickets work?', 'Refund policy', 'Contact support'].map((q) => (
          <button key={q} type="button" onClick={() => toast(q)} className="mb-2 w-full rounded-[14px] bg-white/8 py-3 text-left px-4 text-sm">{q}</button>
        ))}
      </BottomSheet>

      <BottomSheet open={sheet === 'report'} onClose={() => setSheet(null)} title="Report a problem">
        <textarea rows={4} placeholder="Describe the issue..." className="w-full rounded-[16px] bg-white/10 px-4 py-3" />
        <button type="button" onClick={() => saveDraft('Report submitted')} className="ios-button mt-4 w-full py-3">Submit report</button>
      </BottomSheet>

      <BottomSheet open={sheet === 'terms' || sheet === 'privacy'} onClose={() => setSheet(null)} title={sheet === 'terms' ? 'Terms of service' : 'Privacy policy'}>
        <p className="ios-caption text-left leading-relaxed">
          Demo legal text. By using Event you agree to our community guidelines, ticket terms, and data handling practices for this prototype app.
        </p>
      </BottomSheet>

      <BottomSheet open={sheet === 'delete'} onClose={() => setSheet(null)} title="Delete account">
        <p className="ios-caption mb-4">This permanently deletes your profile, tickets, and messages. This cannot be undone.</p>
        <button type="button" onClick={() => { handleLogout(); toast('Account scheduled for deletion') }} className="w-full rounded-[16px] bg-danger/20 py-3 font-semibold text-danger">Delete my account</button>
      </BottomSheet>
    </div>
  )
}
