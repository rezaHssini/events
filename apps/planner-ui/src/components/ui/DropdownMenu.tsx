import { useEffect, useRef, useState, type ReactNode } from 'react'

export function useDropdown() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return {
    containerRef,
    open,
    setOpen,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  }
}

export function DropdownPanel({
  open,
  align = 'end',
  children,
  className = '',
}: {
  open: boolean
  align?: 'start' | 'end'
  children: ReactNode
  className?: string
}) {
  if (!open) return null

  return (
    <div
      role="menu"
      className={`absolute top-full z-[100] mt-1.5 min-w-[220px] overflow-hidden rounded-[14px] border border-white/10 bg-[#1c1c1e]/95 py-1 shadow-xl backdrop-blur-xl ${
        align === 'end' ? 'right-0' : 'left-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function DropdownItem({
  onClick,
  children,
  icon,
  trailing,
}: {
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] transition-colors hover:bg-white/8 active:bg-white/12"
    >
      {icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400">{icon}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {trailing}
    </button>
  )
}
