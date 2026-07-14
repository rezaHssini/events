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
  Users,
  UserPlus,
  Info,
  LogOut,
} from 'lucide-react'
import { MainBackButton, mainTabLinkState } from '../components/layout/MainBackButton'
import { MentionText } from '../components/CommentMentions'
import { EventShareCard } from '../components/EventShareCard'
import { CreateGroupSheet } from '../components/messages/CreateGroupSheet'
import { BottomSheet } from '../components/ui/BottomSheet'
import {
  conversations,
  groupConversations,
  mentionableUsers,
  userProfiles,
  type Conversation,
  type GroupConversation,
  type ChatMessage,
  type SharedEventPayload,
  type MentionUser,
} from '../data/socialData'
import { mainEvent } from '../data/mockData'
import { media } from '../data/media'
import {
  AttachmentPickerSheet,
  FilePickerSheet,
  ImagePickerSheet,
} from '../components/ui/MediaPickerSheet'
import { DropdownItem, DropdownPanel, useDropdown } from '../components/ui/DropdownMenu'

const ME_ID = 'me'
type InboxTab = 'chats' | 'groups'

function profilePath(participant: MentionUser) {
  return participant.isCreator ? `/page/${participant.handle}` : `/user/${participant.handle}`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sortByPinned<T extends { pinned?: boolean }>(list: T[]) {
  return [...list].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })
}

function resolveMember(members: MentionUser[], senderId: string): MentionUser | undefined {
  if (senderId === 'system') return undefined
  return members.find((m) => m.id === senderId) ?? mentionableUsers.find((m) => m.id === senderId)
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
  const initialTab = (searchParams.get('tab') as InboxTab) || 'chats'

  const [tab, setTab] = useState<InboxTab>(
    initialChat?.startsWith('group-') ? 'groups' : initialTab === 'groups' ? 'groups' : 'chats',
  )
  const [activeId, setActiveId] = useState<string | null>(initialChat || null)
  const [chats, setChats] = useState(conversations)
  const [groups, setGroups] = useState(groupConversations)
  const [draft, setDraft] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showAttachPicker, setShowAttachPicker] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)

  const sortedChats = useMemo(() => sortByPinned(chats), [chats])
  const sortedGroups = useMemo(() => sortByPinned(groups), [groups])

  const activeChat = chats.find((c) => c.id === activeId)
  const activeGroup = groups.find((g) => g.id === activeId)

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
      setTab('chats')
      setActiveId(initialChat)
    } else if (initialChat?.startsWith('group-')) {
      setTab('groups')
      setActiveId(initialChat)
    }
  }, [initialChat, chats])

  const updateChat = (chatId: string, updater: (chat: Conversation) => Conversation) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)))
  }

  const updateGroup = (groupId: string, updater: (g: GroupConversation) => GroupConversation) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? updater(g) : g)))
  }

  const appendToActive = (message: ChatMessage, lastMessage: string) => {
    if (!activeId) return
    if (activeGroup) {
      updateGroup(activeId, (g) => ({
        ...g,
        messages: [...g.messages, message],
        lastMessage,
        lastTime: 'Just now',
      }))
    } else {
      updateChat(activeId, (c) => ({
        ...c,
        messages: [...c.messages, message],
        lastMessage,
        lastTime: 'Just now',
      }))
    }
  }

  useEffect(() => {
    const pending = (location.state as { pendingShare?: SharedEventPayload })?.pendingShare
    if (pending && activeId && !sharedRef.current) {
      sharedRef.current = true
      appendToActive(
        {
          id: `m-share-${Date.now()}`,
          senderId: ME_ID,
          type: 'event_share',
          eventShare: pending,
          time: 'Just now',
          read: true,
        },
        `Shared: ${pending.title}`,
      )
      navigate(`/messages?chat=${activeId}${activeGroup ? '&tab=groups' : ''}`, {
        replace: true,
        state: {},
      })
    }
  }, [activeId, location.state, navigate])

  const sendMessage = (
    message: Omit<ChatMessage, 'id' | 'senderId' | 'time' | 'read'> & { id?: string },
  ) => {
    if (!activeId || (!activeChat && !activeGroup)) return

    const mentions =
      message.type === 'text' && message.text
        ? [...message.text.matchAll(/@(\w+)/g)].map((m) => m[1])
        : undefined

    const newMsg: ChatMessage = {
      id: message.id ?? `m-${Date.now()}`,
      senderId: ME_ID,
      time: 'Just now',
      read: true,
      mentions,
      ...message,
    }

    let lastMsg = 'New message'
    if (message.type === 'text' && message.text) lastMsg = message.text
    if (message.type === 'event_share' && message.eventShare) lastMsg = `Shared: ${message.eventShare.title}`
    if (message.type === 'image') lastMsg = '📷 Photo'
    if (message.type === 'file' && message.fileName) lastMsg = `📎 ${message.fileName}`

    appendToActive(newMsg, lastMsg)
    setDraft('')

    if (activeChat?.participant.isCreator && message.type === 'text') {
      setTimeout(() => {
        appendToActive(
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

  const mentionPool: MentionUser[] = activeGroup
    ? [
        { id: 'everyone', name: 'Everyone', handle: 'everyone', avatar: media.crowd },
        ...activeGroup.members.filter((m) => m.id !== ME_ID),
      ]
    : mentionableUsers

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

  const filteredMentions = mentionPool.filter(
    (u) => u.handle.includes(mentionQuery) || u.name.toLowerCase().includes(mentionQuery),
  )

  const removeChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeId === chatId) {
      setActiveId(null)
      navigate('/messages')
    }
  }

  const leaveGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    setShowGroupInfo(false)
    if (activeId === groupId) {
      setActiveId(null)
      navigate('/messages?tab=groups')
    }
  }

  const addMembersToGroup = (memberIds: string[]) => {
    if (!activeGroup) return
    const pool = userProfiles.filter((u) => memberIds.includes(u.id))
    updateGroup(activeGroup.id, (g) => {
      const existing = new Set(g.members.map((m) => m.id))
      const added = pool.filter((u) => !existing.has(u.id))
      if (added.length === 0) return g
      return {
        ...g,
        members: [...g.members, ...added],
        messages: [
          ...g.messages,
          {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            type: 'text' as const,
            text: `You added ${added.map((a) => a.name).join(', ')}`,
            time: 'Just now',
            read: true,
          },
        ],
        lastMessage: `You added ${added.map((a) => a.name).join(', ')}`,
        lastTime: 'Just now',
      }
    })
    setShowAddMembers(false)
  }

  if (activeChat || activeGroup) {
    const isGroup = !!activeGroup
    return (
      <>
        {isGroup && activeGroup ? (
          <GroupThread
            group={activeGroup}
            draft={draft}
            showMentions={showMentions}
            filteredMentions={filteredMentions}
            onBack={() => {
              setActiveId(null)
              navigate('/messages?tab=groups')
            }}
            onDraftChange={handleDraftChange}
            onInsertMention={insertMention}
            onSend={() => {
              if (!draft.trim()) return
              sendMessage({ type: 'text', text: draft.trim() })
            }}
            onAttach={() => setShowAttachPicker(true)}
            onOpenInfo={() => setShowGroupInfo(true)}
            onPin={() => updateGroup(activeGroup.id, (g) => ({ ...g, pinned: !g.pinned }))}
            onMute={() => updateGroup(activeGroup.id, (g) => ({ ...g, muted: !g.muted }))}
            onLeave={() => leaveGroup(activeGroup.id)}
          />
        ) : (
          activeChat && (
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
              onPin={() => updateChat(activeChat.id, (c) => ({ ...c, pinned: !c.pinned }))}
              onMute={() => updateChat(activeChat.id, (c) => ({ ...c, muted: !c.muted }))}
              onRemove={() => removeChat(activeChat.id)}
              onMarkUnread={() =>
                updateChat(activeChat.id, (c) => ({ ...c, unread: Math.max(1, c.unread) }))
              }
            />
          )
        )}

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

        {activeGroup && (
          <>
            <GroupInfoSheet
              open={showGroupInfo}
              group={activeGroup}
              onClose={() => setShowGroupInfo(false)}
              onAddMembers={() => {
                setShowGroupInfo(false)
                setShowAddMembers(true)
              }}
              onLeave={() => leaveGroup(activeGroup.id)}
            />
            <AddMembersSheet
              open={showAddMembers}
              group={activeGroup}
              onClose={() => setShowAddMembers(false)}
              onAdd={addMembersToGroup}
            />
          </>
        )}
      </>
    )
  }

  const chatUnread = chats.reduce((s, c) => s + c.unread, 0)
  const groupUnread = groups.reduce((s, g) => s + g.unread, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <MainBackButton fallback="/feed" />
          <div className="flex-1">
            <h1 className="text-xl font-bold gradient-text">Messages</h1>
            <p className="text-xs text-slate-400">Direct chats & group plans</p>
          </div>
        </div>

        <div className="mt-3 flex gap-1 rounded-[14px] liquid-glass-subtle p-1">
          {(
            [
              { id: 'chats' as const, label: 'Chats', count: chatUnread },
              { id: 'groups' as const, label: 'Groups', count: groupUnread },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                navigate(t.id === 'groups' ? '/messages?tab=groups' : '/messages')
              }}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium ${
                tab === t.id ? 'text-white' : 'text-slate-500'
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="msg-tab"
                  className="absolute inset-0 rounded-xl bg-white/14"
                />
              )}
              <span className="relative">{t.label}</span>
              {t.count > 0 && (
                <span className="relative rounded-full bg-primary px-1.5 text-[10px] font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'chats' ? (
          <Link
            to="/find-people"
            state={mainTabLinkState('/feed')}
            className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-slate-300"
          >
            ✏️ New message
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateGroup(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a84ff] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Users className="h-4 w-4" />
            Create group
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chats'
          ? sortedChats.map((chat) => (
              <ConversationRow
                key={chat.id}
                chat={chat}
                onOpen={() => {
                  setActiveId(chat.id)
                  navigate(`/messages?chat=${chat.id}`)
                  updateChat(chat.id, (c) => ({ ...c, unread: 0 }))
                }}
                onPin={() => updateChat(chat.id, (c) => ({ ...c, pinned: !c.pinned }))}
                onMute={() => updateChat(chat.id, (c) => ({ ...c, muted: !c.muted }))}
                onRemove={() => removeChat(chat.id)}
                onMarkUnread={() =>
                  updateChat(chat.id, (c) => ({ ...c, unread: Math.max(1, c.unread) }))
                }
              />
            ))
          : sortedGroups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                onOpen={() => {
                  setActiveId(group.id)
                  navigate(`/messages?chat=${group.id}&tab=groups`)
                  updateGroup(group.id, (g) => ({ ...g, unread: 0 }))
                }}
                onPin={() => updateGroup(group.id, (g) => ({ ...g, pinned: !g.pinned }))}
                onMute={() => updateGroup(group.id, (g) => ({ ...g, muted: !g.muted }))}
                onLeave={() => leaveGroup(group.id)}
              />
            ))}

        {tab === 'groups' && groups.length === 0 && (
          <div className="p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 font-semibold">No groups yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Plan nights with friends — invite, share events, @mention each other.
            </p>
          </div>
        )}
      </div>

      <CreateGroupSheet
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={(group) => {
          setGroups((prev) => [group, ...prev])
          setActiveId(group.id)
          setTab('groups')
          navigate(`/messages?chat=${group.id}&tab=groups`)
        }}
      />
    </div>
  )
}

function ConversationMenu({
  pinned,
  muted,
  onPin,
  onMute,
  onRemove,
  onMarkUnread,
  leaveLabel,
}: {
  pinned?: boolean
  muted?: boolean
  onPin: () => void
  onMute: () => void
  onRemove: () => void
  onMarkUnread?: () => void
  leaveLabel?: string
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
      <DropdownPanel open={open} align="end">
        <DropdownItem
          icon={pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          onClick={() => {
            onPin()
            close()
          }}
        >
          {pinned ? 'Unpin' : 'Pin'}
        </DropdownItem>
        <DropdownItem
          icon={muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          onClick={() => {
            onMute()
            close()
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </DropdownItem>
        {onMarkUnread && (
          <DropdownItem
            onClick={() => {
              onMarkUnread()
              close()
            }}
          >
            Mark as unread
          </DropdownItem>
        )}
        <DropdownItem
          icon={<Trash2 className="h-4 w-4 text-red-400" />}
          onClick={() => {
            onRemove()
            close()
          }}
        >
          <span className="text-red-400">{leaveLabel ?? 'Delete conversation'}</span>
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
      className={`flex w-full items-center gap-2 border-b border-white/5 p-4 hover:bg-white/5 ${
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
            <p className="mt-0.5 truncate text-[10px] text-primary-light">Re: {chat.eventContext}</p>
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
        pinned={chat.pinned}
        muted={chat.muted}
        onPin={onPin}
        onMute={onMute}
        onRemove={onRemove}
        onMarkUnread={onMarkUnread}
      />
    </div>
  )
}

function GroupRow({
  group,
  onOpen,
  onPin,
  onMute,
  onLeave,
}: {
  group: GroupConversation
  onOpen: () => void
  onPin: () => void
  onMute: () => void
  onLeave: () => void
}) {
  return (
    <div
      className={`flex w-full items-center gap-2 border-b border-white/5 p-4 hover:bg-white/5 ${
        group.pinned ? 'bg-white/[0.03]' : ''
      }`}
    >
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 gap-3 text-left">
        <div className="relative shrink-0">
          <img src={group.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a84ff] text-[10px]">
            <Users className="h-3 w-3 text-white" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {group.pinned && <Pin className="h-3 w-3 shrink-0 text-[#0a84ff]" />}
            {group.muted && <BellOff className="h-3 w-3 shrink-0 text-slate-500" />}
            <p className={`truncate font-semibold ${group.unread ? 'text-white' : ''}`}>
              {group.name}
            </p>
            <span className="ml-auto shrink-0 text-xs text-slate-500">{group.lastTime}</span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-slate-500">
            {group.members.length} members
            {group.eventContext ? ` · ${group.eventContext}` : ''}
          </p>
          <p
            className={`mt-1 truncate text-sm ${
              group.unread ? 'font-medium text-slate-200' : 'text-slate-400'
            }`}
          >
            {group.lastMessage}
          </p>
        </div>
        {group.unread > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold">
            {group.unread}
          </span>
        )}
      </button>
      <ConversationMenu
        pinned={group.pinned}
        muted={group.muted}
        onPin={onPin}
        onMute={onMute}
        onRemove={onLeave}
        leaveLabel="Leave group"
      />
    </div>
  )
}

function ChatMessageBubble({
  msg,
  isMe,
  sender,
  showSender,
}: {
  msg: ChatMessage
  isMe: boolean
  sender?: MentionUser
  showSender?: boolean
}) {
  if (msg.senderId === 'system') {
    return (
      <p className="mx-auto max-w-[90%] rounded-full bg-white/5 px-3 py-1 text-center text-[11px] text-slate-400">
        {msg.text}
      </p>
    )
  }

  if (msg.type === 'event_share' && msg.eventShare) {
    return (
      <div className={isMe ? 'text-right' : 'text-left'}>
        {showSender && sender && !isMe && (
          <p className="mb-1 text-[10px] font-medium text-slate-400">{sender.name}</p>
        )}
        <EventShareCard event={msg.eventShare} compact />
        <p className="mt-1 text-[10px] text-slate-500">{msg.time}</p>
      </div>
    )
  }

  if (msg.type === 'image' && msg.imageUrl) {
    return (
      <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'}`}>
        {showSender && sender && !isMe && (
          <p className="mb-1 text-[10px] font-medium text-slate-400">{sender.name}</p>
        )}
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
        {showSender && sender && !isMe && (
          <p className="mb-1 text-[10px] font-medium text-slate-300">{sender.name}</p>
        )}
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
        <p className={`mt-2 text-[10px] ${isMe ? 'text-white/60' : 'text-slate-500'}`}>{msg.time}</p>
      </div>
    )
  }

  return (
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isMe ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md glass'
      }`}
    >
      {showSender && sender && !isMe && (
        <p className="mb-0.5 text-[10px] font-semibold text-[#64b5ff]">{sender.name}</p>
      )}
      <p className="text-sm">
        {msg.text && (isMe ? msg.text : <MentionText text={msg.text} />)}
      </p>
      <p className={`mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-slate-500'}`}>{msg.time}</p>
    </div>
  )
}

function Composer({
  draft,
  showMentions,
  filteredMentions,
  onDraftChange,
  onInsertMention,
  onSend,
  onAttach,
  placeholder,
}: {
  draft: string
  showMentions: boolean
  filteredMentions: MentionUser[]
  onDraftChange: (v: string) => void
  onInsertMention: (handle: string) => void
  onSend: () => void
  onAttach: () => void
  placeholder: string
}) {
  return (
    <div className="relative border-t border-white/10 bg-surface p-4 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
      {showMentions && filteredMentions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1 max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-surface shadow-xl">
          {filteredMentions.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onInsertMention(u.handle)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
            >
              <img src={u.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span>
                @{u.handle}
                {u.id === 'everyone' && (
                  <span className="ml-1 text-xs text-slate-500">Notify all</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAttach}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl glass"
          aria-label="Attach"
        >
          <Paperclip className="h-5 w-5 text-[#0a84ff]" />
        </button>
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder={placeholder}
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
  filteredMentions: MentionUser[]
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
          </p>
          {chat.eventContext && (
            <p className="truncate text-xs text-slate-400">Re: {chat.eventContext}</p>
          )}
        </Link>
        <ConversationMenu
          pinned={chat.pinned}
          muted={chat.muted}
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

      <Composer
        draft={draft}
        showMentions={showMentions}
        filteredMentions={filteredMentions}
        onDraftChange={onDraftChange}
        onInsertMention={onInsertMention}
        onSend={onSend}
        onAttach={onAttach}
        placeholder="Message… @ to mention"
      />
    </div>
  )
}

function GroupThread({
  group,
  draft,
  showMentions,
  filteredMentions,
  onBack,
  onDraftChange,
  onInsertMention,
  onSend,
  onAttach,
  onOpenInfo,
  onPin,
  onMute,
  onLeave,
}: {
  group: GroupConversation
  draft: string
  showMentions: boolean
  filteredMentions: MentionUser[]
  onBack: () => void
  onDraftChange: (v: string) => void
  onInsertMention: (handle: string) => void
  onSend: () => void
  onAttach: () => void
  onOpenInfo: () => void
  onPin: () => void
  onMute: () => void
  onLeave: () => void
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
        <button type="button" onClick={onOpenInfo} className="shrink-0">
          <img src={group.avatar} alt="" className="h-10 w-10 rounded-2xl object-cover" />
        </button>
        <button type="button" onClick={onOpenInfo} className="min-w-0 flex-1 text-left">
          <p className="flex items-center gap-1 truncate font-semibold">
            {group.pinned && <Pin className="h-3 w-3 text-[#0a84ff]" />}
            {group.name}
          </p>
          <p className="truncate text-xs text-slate-400">
            {group.members.length} members
            {group.eventContext ? ` · ${group.eventContext}` : ''}
          </p>
        </button>
        <button
          type="button"
          onClick={onOpenInfo}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-white/10"
          aria-label="Group info"
        >
          <Info className="h-5 w-5" />
        </button>
        <ConversationMenu
          pinned={group.pinned}
          muted={group.muted}
          onPin={onPin}
          onMute={onMute}
          onRemove={onLeave}
          leaveLabel="Leave group"
        />
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {group.description && (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs text-slate-400">
            {group.description}
          </p>
        )}
        <AnimatePresence initial={false}>
          {group.messages.map((msg) => {
            const isMe = msg.senderId === ME_ID
            const sender = resolveMember(group.members, msg.senderId)
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && msg.senderId !== 'system' && sender && (
                  <img src={sender.avatar} alt="" className="mb-1 h-7 w-7 rounded-full object-cover" />
                )}
                <ChatMessageBubble msg={msg} isMe={isMe} sender={sender} showSender />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Composer
        draft={draft}
        showMentions={showMentions}
        filteredMentions={filteredMentions}
        onDraftChange={onDraftChange}
        onInsertMention={onInsertMention}
        onSend={onSend}
        onAttach={onAttach}
        placeholder="Message group… @member or @everyone"
      />
    </div>
  )
}

function GroupInfoSheet({
  open,
  group,
  onClose,
  onAddMembers,
  onLeave,
}: {
  open: boolean
  group: GroupConversation
  onClose: () => void
  onAddMembers: () => void
  onLeave: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Group info">
      <div className="space-y-4 text-left">
        <div className="flex items-center gap-3">
          <img src={group.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <div className="min-w-0">
            <p className="font-semibold">{group.name}</p>
            <p className="text-sm text-slate-400">{group.members.length} members</p>
          </div>
        </div>
        {group.description && <p className="text-sm text-slate-300">{group.description}</p>}
        {group.eventContext && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary-light">
            Linked event: {group.eventContext}
          </p>
        )}
        <button
          type="button"
          onClick={onAddMembers}
          className="flex w-full items-center gap-2 rounded-[14px] liquid-glass-subtle px-4 py-3 text-sm font-medium"
        >
          <UserPlus className="h-4 w-4 text-[#0a84ff]" />
          Add members
        </button>
        <div className="divide-y divide-white/5 rounded-[16px] border border-white/10">
          {group.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
              <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {m.name}
                  {group.admins.includes(m.id) && (
                    <span className="ml-1 text-[10px] text-warning">Admin</span>
                  )}
                </p>
                <p className="text-xs text-slate-500">@{m.handle}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-danger/30 bg-danger/10 py-3 text-sm font-semibold text-danger"
        >
          <LogOut className="h-4 w-4" />
          Leave group
        </button>
      </div>
    </BottomSheet>
  )
}

function AddMembersSheet({
  open,
  group,
  onClose,
  onAdd,
}: {
  open: boolean
  group: GroupConversation
  onClose: () => void
  onAdd: (ids: string[]) => void
}) {
  const existing = new Set(group.members.map((m) => m.id))
  const candidates = userProfiles.filter((u) => !u.isCreator && u.id !== 'me' && !existing.has(u.id))
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) setSelected([])
  }, [open])

  return (
    <BottomSheet open={open} onClose={onClose} title="Add members">
      <div className="max-h-72 space-y-1 overflow-y-auto text-left">
        {candidates.length === 0 ? (
          <p className="ios-caption py-4 text-center">Everyone you follow is already here</p>
        ) : (
          candidates.map((f) => {
            const on = selected.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setSelected((prev) =>
                    on ? prev.filter((id) => id !== f.id) : [...prev, f.id],
                  )
                }
                className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 ${
                  on ? 'bg-[#0a84ff]/20' : 'hover:bg-white/5'
                }`}
              >
                <img src={f.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-slate-500">@{f.handle}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onAdd(selected)}
        className="ios-button mt-4 w-full py-3.5 disabled:opacity-40"
      >
        Add {selected.length || ''} to group
      </button>
    </BottomSheet>
  )
}
