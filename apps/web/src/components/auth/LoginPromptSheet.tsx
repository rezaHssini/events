import { LogIn } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'

export function LoginPromptSheet({
  open,
  onClose,
  onSignIn,
}: {
  open: boolean
  onClose: () => void
  onSignIn: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sign in to continue">
      <div className="space-y-4 text-left">
        <p className="ios-caption">
          Browse events, people, and comments for free. Sign in to like, follow, comment, buy
          tickets, and more.
        </p>
        <button
          type="button"
          onClick={onSignIn}
          className="ios-button flex w-full items-center justify-center gap-2 py-4 text-[17px]"
        >
          <LogIn className="h-5 w-5" />
          Sign in
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-[15px] font-medium text-[#0a84ff]"
        >
          Keep browsing
        </button>
      </div>
    </BottomSheet>
  )
}
