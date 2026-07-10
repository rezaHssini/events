import { Link } from 'react-router-dom'
import { currentUser } from '../../data/socialData'
import type { Comment, MentionUser } from '../../data/socialData'
import { AuthGateBanner } from '../auth/AuthGateBanner'
import { CommentComposer, CommentThread } from '../CommentMentions'

export function EventCommentsPanel({
  comments,
  isAuthenticated,
  replyTo,
  onSubmit,
  onReply,
  onClearReply,
}: {
  comments: Comment[]
  isAuthenticated: boolean
  replyTo?: MentionUser
  onSubmit: (text: string) => void
  onReply: (user: MentionUser) => void
  onClearReply: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="text-left">
          <h3 className="text-base font-semibold">Discussion</h3>
          <p className="text-xs text-[rgba(235,235,245,0.45)]">
            {comments.length} comment{comments.length === 1 ? '' : 's'}
            {isAuthenticated ? ' · You can reply and mention others' : ' · Sign in to join'}
          </p>
        </div>
        {isAuthenticated ? (
          <span className="rounded-full bg-[#30d158]/15 px-3 py-1 text-xs font-medium text-[#30d158]">
            Signed in
          </span>
        ) : (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-[rgba(235,235,245,0.45)]">
            Guest · read only
          </span>
        )}
      </div>

      {isAuthenticated ? (
        <CommentComposer
          replyTo={replyTo}
          onSubmit={onSubmit}
          userAvatar={currentUser.avatar}
          onCancelReply={replyTo ? onClearReply : undefined}
        />
      ) : (
        <>
          <AuthGateBanner variant="sign-in" />
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
            <p className="text-sm text-[rgba(235,235,245,0.45)]">
              Join the conversation — share questions, tag friends, or ask the organizer.
            </p>
            <Link
              to="/auth"
              className="mt-3 inline-block text-sm font-medium text-[#0a84ff] hover:underline"
            >
              Sign in to comment →
            </Link>
          </div>
        </>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.02] py-10 text-center text-sm text-[rgba(235,235,245,0.45)]">
            No comments yet. {isAuthenticated ? 'Be the first to ask a question!' : 'Sign in to start the thread.'}
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <CommentThread
                comment={c}
                onReply={isAuthenticated ? onReply : () => {}}
                isAuthenticated={isAuthenticated}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
