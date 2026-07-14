import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  MoreHorizontal,
  Paperclip,
  Pin,
  PinOff,
  Trash2,
  Bell,
  BellOff,
  FileText,
} from 'lucide-react'
import { MainBackButton, mainTabLinkState } from '../components/layout/MainBackButton'
import { MentionText } from '../components/CommentMentions'
import { EventShareCard } from '../components/EventShareCard'
import {
  conversations,
  mentionableUsers,
  userProfiles,
  type Conversation,
  type ChatMessage,
  type SharedEventPayload,
} from '../data/socialData'
import { mainEvent } from '../data/mockData'
import {
  AttachmentPickerSheet,
  FilePickerSheet,
  ImagePickerSheet,
} from '../components/ui/MediaPickerSheet'
import { DropdownItem, DropdownPanel, useDropdown } from '../components/ui/DropdownMenu'

const ME_ID = 'me'

function profilePath(participant: Conversation['participant']) {
  return participant.isCreator ? `/page/${participant.handle}` : `/user/${participant.handle}`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sortConversations(list: Conversation[]) {
  return [...list].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })
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
  const [showAttachPicker, setShowAttachPicker] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)

  const sortedChats = useMemo(() => sortConversations(chats), [chats])

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
  }, [initialChat, chats])

  const activeChat = chats.find((c) => c.id === activeId)

  const updateChat = (chatId: string, updater: (chat: Conversation) => Conversation) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)))
  }

  const appendMessage = (chatId: string, message: ChatMessage, lastMessage: string) => {
    updateChat(chatId, (c) => ({
      ...c,
      messages: [...c.messages, message],
      lastMessage,
      lastTime: 'Just now',
    }))
  }

  const appendEventShare = (chatId: string, eventShare: SharedEventPayload) => {
    appendMessage(
      chatId,
      {
        id: `m-share-${Date.now()}`,
        senderId: ME_ID,
        type: 'event_share',
        eventShare,
        time: 'Just now',
        read: true,
      },
      `Shared: ${eventShare.title}`,
    )
  }

  useEffect(() => {
    const pending = (location.state as { pendingShare?: SharedEventPayload })?.pendingShare
    if (pending && activeId && !sharedRef.current) {
      sharedRef.current = true
      appendEventShare(activeId, pending)
      navigate(`/messages?chat=${activeId}`, { replace: true, state: {} })
    }
  }, [activeId, location.state, navigate])

  const sendMessage = (message: Omit<ChatMessage, 'id' | 'senderId' | 'time' | 'read'> & { id?: string }) => {
    if (!activeChat || !activeId) return

    const newMsg: ChatMessage = {
      id: message.id ?? `m-${Date.now()}`,
      senderId: ME_ID,
      time: 'Just now',
      read: true,
      ...message,
    }

    let lastMsg = 'New message'
    if (message.type === 'text' && message.text) lastMsg = message.text
    if (message.type === 'event_share' && message.eventShare) lastMsg = `Shared: ${message.eventShare.title}`
    if (message.type === 'image') lastMsg = '📷 Photo'
    if (message.type === 'file' && message.fileName) lastMsg = `📎 ${message.fileName}`

    appendMessage(activeId, newMsg, lastMsg)
    setDraft('')

    if (activeChat.participant.isCreator && message.type === 'text') {
      setTimeout(() => {
        appendMessage(
          activeId,
          {
            id: `m-reply-${Date.now()}`,
            senderId: activeChat.participant.id,
            type: 'text',
            text: "Thanks for reaching out! We'll get back to you shortly 🙌",
            time: 'Just now',
            read: false,
          },
          "Thanks for reaching out! We'll get back to you shortly 🙌",
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

  const togglePin = (chatId: string) => {
    updateChat(chatId, (c) => ({ ...c, pinned: !c.pinned }))
  }

  const toggleMute = (chatId: string) => {
    updateChat(chatId, (c) => ({ ...c, muted: !c.muted }))
  }

  const removeChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeId === chatId) {
      setActiveId(null)
      navigate('/messages')
    }
  }

  const markUnread = (chatId: string) => {
    updateChat(chatId, (c) => ({ ...c, unread: Math.max(1, c.unread) }))
  }

  const filteredMentions = mentionableUsers.filter((u) => u.handle.includes(mentionQuery))

  if (activeChat) {
    return (
      <>
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
          onSend={() => {
            if (!draft.trim()) return
            sendMessage({ type: 'text', text: draft.trim() })
          }}
          onAttach={() => setShowAttachPicker(true)}
          onPin={() => togglePin(activeChat.id)}
          onMute={() => toggleMute(activeChat.id)}
          onRemove={() => removeChat(activeChat.id)}
          onMarkUnread={() => markUnread(activeChat.id)}
        />

        <AttachmentPickerSheet
          open={showAttachPicker}
          onClose={() => setShowAttachPicker(false)}
          onPickImage={() => setShowImagePicker(true)}
          onPickFile={() => setShowFilePicker(true)}
          onShareEvent={() => sendMessage({ type: 'event_share', eventShare: defaultShareEvent })}
        />
        <ImagePickerSheet
          open={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          title="Send photo"
          onSelect={(url) => sendMessage({ type: 'image', imageUrl: url })}
          showPresets={false}
        />
        <FilePickerSheet
          open={showFilePicker}
          onClose={() => setShowFilePicker(false)}
          title="Send file"
          onSelect={(file) =>
            sendMessage({
              type: 'file',
              fileUrl: file.url,
              fileName: file.name,
              fileSize: file.size,
            })
          }
        />
      </>
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
        {sortedChats.map((chat) => (
          <ConversationRow
            key={chat.id}
            chat={chat}
            onOpen={() => {
              setActiveId(chat.id)
              navigate(`/messages?chat=${chat.id}`)
              updateChat(chat.id, (c) => ({ ...c, unread: 0 }))
            }}
            onPin={() => togglePin(chat.id)}
            onMute={() => toggleMute(chat.id)}
            onRemove={() => removeChat(chat.id)}
            onMarkUnread={() => markUnread(chat.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ConversationMenu({
  chat,
  onPin,
  onMute,
  onRemove,
  onMarkUnread,
  align = 'end',
}: {
  chat: Conversation
  onPin: () => void
  onMute: () => void
  onRemove: () => void
  onMarkUnread: () => void
  align?: 'start' | 'end'
}) {
  const { containerRef, open, toggle, close } = useDropdown()

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        aria-label="Conversation options"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <DropdownPanel open={open} align={align}>
        <DropdownItem
          icon={chat.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          onClick={() => {
            onPin()
            close()
          }}
        >
          {chat.pinned ? 'Unpin' : 'Pin'}
        </DropdownItem>
        <DropdownItem
          icon={chat.muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          onClick={() => {
            onMute()
            close()
          }}
        >
          {chat.muted ? 'Unmute' : 'Mute'}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            onMarkUnread()
            close()
          }}
        >
          Mark as unread
        </DropdownItem>
        <DropdownItem
          icon={<Trash2 className="h-4 w-4 text-red-400" />}
          onClick={() => {
            onRemove()
            close()
          }}
        >
          <span className="text-red-400">Delete conversation</span>
        </DropdownItem>
      </DropdownPanel>
    </div>
  )
}

function ConversationRow({
  chat,
  onOpen,
  onPin,
  onMute,
  onRemove,
  onMarkUnread,
}: {
  chat: Conversation
  onOpen: () => void
  onPin: () => void
  onMute: () => void
  onRemove: () => void
  onMarkUnread: () => void
}) {
  return (
    <div
      className={`flex w-full items-center gap-2 border-b border-white/5 p-4 hover:bg-white/5 transition-colors ${
        chat.pinned ? 'bg-white/[0.03]' : ''
      }`}
    >
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 gap-3 text-left">
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
          <div className="flex items-center gap-1.5">
            {chat.pinned && <Pin className="h-3 w-3 shrink-0 text-[#0a84ff]" />}
            {chat.muted && <BellOff className="h-3 w-3 shrink-0 text-slate-500" />}
            <p className={`truncate font-semibold ${chat.unread ? 'text-white' : ''}`}>
              {chat.participant.name}
            </p>
            <span className="ml-auto shrink-0 text-xs text-slate-500">{chat.lastTime}</span>
          </div>
          {chat.eventContext && (
            <p className="mt-0.5 truncate text-[10px] text-primary-light">
              Re: {chat.eventContext}
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
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold">
            {chat.unread}
          </span>
        )}
      </button>
      <ConversationMenu
        chat={chat}
        onPin={onPin}
        onMute={onMute}
        onRemove={onRemove}
        onMarkUnread={onMarkUnread}
      />
    </div>
  )
}

function ChatMessageBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  if (msg.type === 'event_share' && msg.eventShare) {
    return (
      <div className={isMe ? 'text-right' : 'text-left'}>
        <EventShareCard event={msg.eventShare} compact />
        <p className="mt-1 text-[10px] text-slate-500">{msg.time}</p>
      </div>
    )
  }

  if (msg.type === 'image' && msg.imageUrl) {
    return (
      <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'}`}>
        <img
          src={msg.imageUrl}
          alt=""
          className="max-h-56 rounded-2xl object-cover ring-1 ring-white/10"
        />
        <p className="mt-1 text-[10px] text-slate-500">{msg.time}</p>
      </div>
    )
  }

  if (msg.type === 'file' && msg.fileName) {
    return (
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isMe ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md glass'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isMe ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium">{msg.fileName}</p>
            {msg.fileSize != null && (
              <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                {formatFileSize(msg.fileSize)}
              </p>
            )}
          </div>
        </div>
        <p className={`mt-2 text-[10px] ${isMe ? 'text-white/60' : 'text-slate-500'}`}>
          {msg.time}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isMe ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md glass'
      }`}
    >
      <p className="text-sm">
        {msg.text && (isMe ? msg.text : <MentionText text={msg.text} />)}
      </p>
      <p className={`mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-slate-500'}`}>
        {msg.time}
      </p>
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
  onAttach,
  onPin,
  onMute,
  onRemove,
  onMarkUnread,
}: {
  chat: Conversation
  draft: string
  showMentions: boolean
  filteredMentions: typeof mentionableUsers
  onBack: () => void
  onDraftChange: (v: string) => void
  onInsertMention: (handle: string) => void
  onSend: () => void
  onAttach: () => void
  onPin: () => void
  onMute: () => void
  onRemove: () => void
  onMarkUnread: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <Link to={profilePath(chat.participant)} className="shrink-0">
          <img src={chat.participant.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        </Link>
        <Link to={profilePath(chat.participant)} className="min-w-0 flex-1 text-left">
          <p className="flex items-center gap-1 truncate font-semibold">
            {chat.pinned && <Pin className="h-3 w-3 text-[#0a84ff]" />}
            {chat.participant.name}
            {chat.participant.isCreator && (
              <span className="text-xs text-secondary">Creator ✓</span>
            )}
          </p>
          {chat.eventContext && (
            <p className="truncate text-xs text-slate-400">Re: {chat.eventContext}</p>
          )}
        </Link>
        <ConversationMenu
          chat={chat}
          onPin={onPin}
          onMute={onMute}
          onRemove={onRemove}
          onMarkUnread={onMarkUnread}
        />
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
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
                <ChatMessageBubble msg={msg} isMe={isMe} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="relative border-t border-white/10 bg-surface p-4 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
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
            onClick={onAttach}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl glass"
            title="Attach file or photo"
            aria-label="Attach"
          >
            <Paperclip className="h-5 w-5 text-[#0a84ff]" />
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
