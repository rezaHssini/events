import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User, CreditCard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { currentUser } from '../../data/socialData'

export function WebUserMenu() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const items = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/payment-methods', label: 'Payment methods', icon: CreditCard },
  ] as const

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-white/8"
      >
        <img
          src={currentUser.avatar}
          alt=""
          className="h-8 w-8 rounded-full object-cover ring-2 ring-white/15"
        />
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1e] py-1 shadow-2xl">
          <div className="border-b border-white/8 px-3 py-2.5">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-slate-400">@{currentUser.handle}</p>
          </div>
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[rgba(235,235,245,0.85)] hover:bg-white/6"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              logout()
              setOpen(false)
              navigate('/feed')
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#ff453a] hover:bg-white/6"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
