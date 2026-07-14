import { useToast } from '../context/ToastContext'
import { copyToClipboard } from '../utils/clipboard'

export function useActionFeedback() {
  const { toast } = useToast()

  const shareLink = async (url?: string) => {
    const link = url ?? (typeof window !== 'undefined' ? window.location.href : '')
    const ok = await copyToClipboard(link)
    toast(ok ? '↗ Link copied to clipboard' : 'Could not copy link')
  }

  return {
    toast,
    liked: () => toast('❤️ Liked'),
    unliked: () => toast('Removed like'),
    saved: () => toast('🔖 Saved to your list'),
    unsaved: () => toast('Removed from saved'),
    shared: () => shareLink(),
    shareLink,
    commented: () => toast('💬 Comment posted'),
    notified: () => toast('🔔 Notifications marked as read'),
    sent: () => toast('✓ Sent'),
    updated: (what: string) => toast(`✓ ${what} updated`),
    opened: (what: string) => toast(`${what} — demo preview`),
    comingSoon: (what: string) => toast(`${what} saved for later`),
    deleted: () => toast('Removed'),
    copied: () => toast('Copied to clipboard'),
  }
}
