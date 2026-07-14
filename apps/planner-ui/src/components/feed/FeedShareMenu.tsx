import { useState } from 'react'
import { Link2, Users } from 'lucide-react'
import { DropdownItem, DropdownPanel } from '../ui/DropdownMenu'
import { useToast } from '../../context/ToastContext'
import { copyToClipboard, eventShareUrl } from '../../utils/clipboard'
import { ShareWithFriendsDialog } from './ShareWithFriendsDialog'

export function FeedShareMenu({
  eventId,
  eventTitle,
  eventCover,
  open,
  onToggle,
  onClose,
  trigger,
  align = 'start',
}: {
  eventId: string
  eventTitle: string
  eventCover: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  trigger: React.ReactNode
  align?: 'start' | 'end'
}) {
  const { toast } = useToast()
  const [friendsOpen, setFriendsOpen] = useState(false)

  const copyLink = async () => {
    const ok = await copyToClipboard(eventShareUrl(eventId))
    toast(ok ? '↗ Link copied to clipboard' : 'Could not copy link')
    onClose()
  }

  const openFriendsDialog = () => {
    onClose()
    setFriendsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className="text-[rgba(235,235,245,0.5)] active:text-white"
      >
        {trigger}
      </button>
      <DropdownPanel open={open} align={align} className="w-[220px]">
        <DropdownItem icon={<Link2 className="h-4 w-4" />} onClick={copyLink}>
          Copy link
        </DropdownItem>
        <DropdownItem icon={<Users className="h-4 w-4" />} onClick={openFriendsDialog}>
          Share with friends
        </DropdownItem>
      </DropdownPanel>

      <ShareWithFriendsDialog
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        eventCover={eventCover}
      />
    </>
  )
}
