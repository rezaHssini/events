import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export function ResponsiveDialog({
  open,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-2xl',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidthClass?: string
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    if (!open || !isDesktop) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, isDesktop])

  useEffect(() => {
    if (!open || !isDesktop) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, isDesktop])

  if (!open) return null

  if (isDesktop) {
    return createPortal(
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      >
        <div
          className={`max-h-[90vh] w-full ${maxWidthClass} overflow-y-auto rounded-2xl border border-white/10 bg-[#14141f] shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#14141f]/95 px-6 py-4 backdrop-blur">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {children}
    </BottomSheet>
  )
}
