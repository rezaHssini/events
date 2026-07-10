import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { MainBackButton, mainTabLinkState } from '../components/layout/MainBackButton'
import { MentionText } from '../components/CommentMentions'
import { EventShareCard } from '../components/EventShareCard'
import {
  conversations,
  mentionableUsers,
  userProfiles,
  type Conversation,
  type SharedEventPayload,
} from '../data/socialData'
import { mainEvent } from '../data/mockData'
import { ConversationRowSkeleton } from '../components/ui/Skeleton'
import { useSimulatedQuery } from '../hooks/useSimulatedQuery'

const ME_ID = 'me'

function profilePath(participant: Conversation['participant']) {
  return participant.isCreator ? `/page/${participant.handle}` : `/user/${participant.handle}`
}

const defaultShareEvent: SharedEventPayload = {
  eventId: mainEvent.id,
  title: mainEvent.title,
  cover: mainEvent.cover,
  date: `${mainEvent.date} · ${mainEvent.time}`,
  location: mainEvent.location,
  price: mainEvent.price,
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const sharedRef = useRef(false)
  const initialChat = searchParams.get('chat')
  const [activeId, setActiveId] = useState<string | null>(initialChat || null)
  const [chats, setChats] = useState(conversations)
  const [draft, setDraft] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const { isLoading: chatsLoading } = useSimulatedQuery(chats, [])

  useEffect(() => {
    if (initialChat?.startsWith('user-')) {
      const userId = initialChat.replace('user-', '')
      const exists = chats.some((c) => c.id === initialChat)
      if (!exists) {
        const user = userProfiles.find((u) => u.id === userId)
        if (user) {
          setChats((prev) => [
            ...prev,
            {
              id: initialChat,
              participant: user,
              lastMessage: 'Start a conversation',
              lastTime: 'Now',
              unread: 0,
              messages: [],
            },
          ])
        }
      }
      setActiveId(initialChat)
    }
  }, [initialChat])

  const activeChat = chats.find((c) => c.id === activeId)

  const appendEventShare = (chatId: string, eventShare: SharedEventPayload) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m-share-${Date.now()}`,
                  senderId: ME_ID,
                  type: 'event_share' as const,
                  eventShare,
                  time: 'Just now',
                  read: true,
                },
              ],
              lastMessage: `Shared: ${eventShare.title}`,
              lastTime: 'Just now',
            }
          : c,
      ),
    )
  }

  useEffect(() => {
    const pending = (location.state as { pendingShare?: SharedEventPayload })?.pendingShare
    if (pending && activeId && !sharedRef.current) {
      sharedRef.current = true
      appendEventShare(activeId, pending)
      navigate(`/messages?chat=${activeId}`, { replace: true, state: {} })
    }
  }, [activeId, location.state])

  const sendMessage = (type: 'text' | 'event_share' = 'text', eventShare?: SharedEventPayload) => {
    if (!activeChat) return
    if (type === 'text' && !draft.trim()) return

    const newMsg =
      type === 'event_share' && eventShare
        ? {
            id: `m-${Date.now()}`,
            senderId: ME_ID,
            type: 'event_share' as const,
            eventShare,
            time: 'Just now',
            read: true,
          }
        : {
            id: `m-${Date.now()}`,
            senderId: ME_ID,
            type: 'text' as const,
            text: draft.trim(),
            time: 'Just now',
            read: true,
          }

    const lastMsg =
      type === 'event_share' ? `Shared: ${eventShare!.title}` : draft.trim()

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: lastMsg,
              lastTime: 'Just now',
            }
          : c,
      ),
    )
    setDraft('')

    if (activeChat.participant.isCreator && type === 'text') {
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: `m-reply-${Date.now()}`,
                      senderId: activeChat.participant.id,
                      type: 'text' as const,
                      text: "Thanks for reaching out! We'll get back to you shortly 🙌",
                      time: 'Just now',
                      read: false,
                    },
                  ],
                  lastMessage: "Thanks for reaching out! We'll get back to you shortly 🙌",
                  lastTime: 'Just now',
                }
              : c,
          ),
        )
      }, 1500)
    }
  }

  const handleDraftChange = (value: string) => {
    setDraft(value)
    const match = value.match(/@(\w*)$/)
    setShowMentions(!!match)
    setMentionQuery(match ? match[1].toLowerCase() : '')
  }

  const insertMention = (handle: string) => {
    setDraft((d) => d.replace(/@\w*$/, `@${handle} `))
    setShowMentions(false)
  }

  const filteredMentions = mentionableUsers.filter((u) => u.handle.includes(mentionQuery))

  if (activeChat) {
    return (
      <ChatThread
        chat={activeChat}
        draft={draft}
        showMentions={showMentions}
        filteredMentions={filteredMentions}
        onBack={() => {
          setActiveId(null)
          navigate('/messages')
        }}
        onDraftChange={handleDraftChange}
        onInsertMention={insertMention}
        onSend={() => sendMessage('text')}
        onShareEvent={() => sendMessage('event_share', defaultShareEvent)}
      />
    )
  }

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <MainBackButton fallback="/feed" />
          <div className="flex-1">
            <h1 className="text-xl font-bold gradient-text">Messages</h1>
            <p className="text-xs text-slate-400">Chat with friends & creators</p>
          </div>
          {totalUnread > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold">
              {totalUnread} new
            </span>
          )}
        </div>
        <Link
          to="/find-people"
          state={mainTabLinkState('/feed')}
          className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-slate-300"
        >
          ✏️ New message
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto">
        {chatsLoading ? (
          <div className="px-4 pt-2">
            <ConversationRowSkeleton count={6} />
          </div>
        ) : (
          chats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => {
              setActiveId(chat.id)
              navigate(`/messages?chat=${chat.id}`)
              setChats((prev) =>
                prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c)),
              )
            }}
            className="flex w-full gap-3 border-b border-white/5 p-4 text-left hover:bg-white/5 transition-colors"
          >
            <Link
              to={profilePath(chat.participant)}
              onClick={(e) => e.stopPropagation()}
              className="relative shrink-0"
            >
              <img
                src={chat.participant.avatar}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
              {chat.participant.isCreator && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px]">
                  ✓
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold truncate ${chat.unread ? 'text-white' : ''}`}>
                  {chat.participant.name}
                </p>
                <span className="shrink-0 text-xs text-slate-500">{chat.lastTime}</span>
              </div>
              {chat.eventContext && (
                <p className="mt-0.5 truncate text-[10px] text-primary-light">
                  🎫 {chat.eventContext}
                </p>
              )}
              <p
                className={`mt-1 truncate text-sm ${
                  chat.unread ? 'font-medium text-slate-200' : 'text-slate-400'
                }`}
              >
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold">
                {chat.unread}
              </span>
            )}
          </button>
        )))}
      </div>
    </div>
  )
}

function ChatThread({
  chat,
  draft,
  showMentions,
  filteredMentions,
  onBack,
  onDraftChange,
  onInsertMention,
  onSend,
  onShareEvent,
}: {
  chat: Conversation
  draft: string
  showMentions: boolean
  filteredMentions: typeof mentionableUsers
  onBack: () => void
  onDraftChange: (v: string) => void
  onInsertMention: (handle: string) => void
  onSend: () => void
  onShareEvent: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <Link to={profilePath(chat.participant)}>
          <img src={chat.participant.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        </Link>
        <Link to={profilePath(chat.participant)} className="flex-1 min-w-0 text-left">
          <p className="font-semibold truncate flex items-center gap-1">
            {chat.participant.name}
            {chat.participant.isCreator && (
              <span className="text-xs text-secondary">Creator ✓</span>
            )}
          </p>
          {chat.eventContext && (
            <p className="truncate text-xs text-slate-400">Re: {chat.eventContext}</p>
          )}
        </Link>
        <button type="button" onClick={onShareEvent} className="text-lg" title="Share event">
          🎫
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {chat.messages.map((msg) => {
            const isMe = msg.senderId === ME_ID
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'event_share' && msg.eventShare ? (
                  <div className={isMe ? 'text-right' : 'text-left'}>
                    <EventShareCard event={msg.eventShare} compact />
                    <p className="mt-1 text-[10px] text-slate-500">{msg.time}</p>
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isMe ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md glass'
                    }`}
                  >
                    <p className="text-sm">
                      {msg.text && (isMe ? msg.text : <MentionText text={msg.text} />)}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isMe ? 'text-white/60' : 'text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="relative border-t border-white/10 bg-surface p-4">
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-1 max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-surface shadow-xl">
            {filteredMentions.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onInsertMention(u.handle)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
              >
                <img src={u.avatar} alt="" className="h-6 w-6 rounded-full" />
                @{u.handle}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onShareEvent}
            className="rounded-xl glass px-3 py-3 text-lg"
            title="Share an event"
          >
            🎫
          </button>
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Message... @ to mention"
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!draft.trim()}
            className="rounded-xl bg-primary px-5 py-3 font-medium disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
