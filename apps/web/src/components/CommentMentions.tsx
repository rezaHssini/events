import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mentionableUsers, type MentionUser } from '../data/socialData'
import { useToast } from '../context/ToastContext'

/** Render comment/chat text with highlighted @mentions */
export function MentionText({ text }: { text: string }) {
  const parts = text.split(/(@\w+)/g)

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const handle = part.slice(1)
          const user = mentionableUsers.find((u) => u.handle === handle)
          return (
            <Link
              key={i}
              to={user?.isCreator ? `/page/${handle}` : `/user/${handle}`}
              className={`font-medium hover:underline ${
                user?.isCreator ? 'text-secondary' : 'text-primary-light'
              }`}
            >
              {part}
              {user?.isCreator && (
                <span className="ml-0.5 text-[10px] text-secondary">✓</span>
              )}
            </Link>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

interface CommentComposerProps {
  placeholder?: string
  onSubmit: (text: string) => void
  replyTo?: MentionUser
  userAvatar?: string
  onCancelReply?: () => void
}

export function CommentComposer({
  placeholder = 'Add a comment... type @ to mention',
  onSubmit,
  replyTo,
  userAvatar,
  onCancelReply,
}: CommentComposerProps) {
  const [text, setText] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')

  const handleChange = (value: string) => {
    setText(value)
    const match = value.match(/@(\w*)$/)
    if (match) {
      setShowMentions(true)
      setMentionQuery(match[1].toLowerCase())
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  const insertMention = (user: MentionUser) => {
    const newText = text.replace(/@\w*$/, `@${user.handle} `)
    setText(newText)
    setShowMentions(false)
  }

  const filtered = mentionableUsers.filter(
    (u) =>
      u.handle.includes(mentionQuery) ||
      u.name.toLowerCase().includes(mentionQuery),
  )

  const submit = () => {
    if (!text.trim()) return
    onSubmit(text.trim())
    setText('')
    setShowMentions(false)
  }

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] p-4">
      {replyTo && (
        <div className="mb-3 flex items-center justify-between text-xs">
          <p className="text-slate-400">
            Replying to <span className="text-primary-light">@{replyTo.handle}</span>
          </p>
          {onCancelReply && (
            <button type="button" onClick={onCancelReply} className="text-[#0a84ff] hover:underline">
              Cancel
            </button>
          )}
        </div>
      )}
      <div className="flex gap-3">
        <img
          src={userAvatar ?? 'https://via.placeholder.com/40'}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="relative min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#0a84ff]/40 focus:ring-1 focus:ring-[#0a84ff]/30"
          />
          {showMentions && filtered.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-surface shadow-xl">
              <p className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
                Mention someone
              </p>
              {filtered.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMention(user)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10"
                >
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium">
                      {user.name}
                      {user.isCreator && (
                        <span className="ml-1 text-xs text-secondary">Creator</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">@{user.handle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-500">Type @ to mention · Enter to post</p>
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          className="rounded-lg bg-[#0a84ff] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Post comment
        </button>
      </div>
    </div>
  )
}

export function CommentThread({
  comment,
  onReply,
  depth = 0,
  isAuthenticated = true,
}: {
  comment: import('../data/socialData').Comment
  onReply: (user: MentionUser) => void
  depth?: number
  isAuthenticated?: boolean
}) {
  const [liked, setLiked] = useState(false)
  const { toast } = useToast()
  const [showReplies, setShowReplies] = useState(depth === 0)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={depth > 0 ? 'ml-6 mt-3 border-l-2 border-white/10 pl-4' : ''}>
      <div className="flex gap-3">
        <img src={comment.user.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">{comment.user.name}</p>
            {comment.user.isCreator && (
              <span className="rounded-full bg-secondary/20 px-1.5 py-0.5 text-[10px] text-secondary">
                Creator
              </span>
            )}
            <span className="text-xs text-slate-500">{comment.time}</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            <MentionText text={comment.body} />
          </p>
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return
                setLiked(!liked)
                toast(liked ? 'Removed like' : '❤️ Liked')
              }}
              disabled={!isAuthenticated}
              className={`hover:text-pink-400 disabled:cursor-default disabled:opacity-40 ${liked ? 'text-pink-400' : ''}`}
            >
              ♥ {comment.likes + (liked ? 1 : 0)}
            </button>
            <button
              type="button"
              onClick={() => isAuthenticated && onReply(comment.user)}
              disabled={!isAuthenticated}
              className="hover:text-primary-light disabled:cursor-default disabled:opacity-40"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <>
          {depth === 0 && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              className="ml-11 mt-2 text-xs text-primary-light"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies!.length} replies
            </button>
          )}
          {showReplies &&
            comment.replies!.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                onReply={onReply}
                depth={depth + 1}
                isAuthenticated={isAuthenticated}
              />
            ))}
        </>
      )}
    </div>
  )
}
