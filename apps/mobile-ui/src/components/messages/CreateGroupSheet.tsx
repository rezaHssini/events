import { useState } from 'react'
import { Users, Camera } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { ImagePickerSheet } from '../ui/MediaPickerSheet'
import { FormField, FormInput, FormTextarea } from '../ui/FormPrimitives'
import { media } from '../../data/media'
import {
  groupInviteFriends,
  type GroupConversation,
  type MentionUser,
} from '../../data/socialData'

const ME: MentionUser = {
  id: 'me',
  name: 'You',
  handle: 'you',
  avatar: media.avatarReza,
}

export function CreateGroupSheet({
  open,
  onClose,
  onCreate,
  friends = groupInviteFriends,
}: {
  open: boolean
  onClose: () => void
  onCreate: (group: GroupConversation) => void
  friends?: MentionUser[]
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState<string>(media.crowd)
  const [selected, setSelected] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [step, setStep] = useState<'details' | 'members'>('details')

  const reset = () => {
    setName('')
    setDescription('')
    setAvatar(media.crowd)
    setSelected([])
    setStep('details')
  }

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const create = () => {
    if (!name.trim() || selected.length === 0) return
    const members = [
      ME,
      ...friends.filter((f) => selected.includes(f.id)),
    ]
    const group: GroupConversation = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Group chat',
      avatar,
      members,
      createdBy: 'me',
      admins: ['me'],
      lastMessage: 'You created this group',
      lastTime: 'Just now',
      unread: 0,
      messages: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          type: 'text',
          text: `You created ${name.trim()}`,
          time: 'Just now',
          read: true,
        },
      ],
    }
    onCreate(group)
    reset()
    onClose()
  }

  return (
    <>
      <BottomSheet
        open={open}
        onClose={() => {
          reset()
          onClose()
        }}
        title={step === 'details' ? 'New group' : 'Invite friends'}
      >
        <div className="space-y-4 text-left">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="relative mx-auto block overflow-hidden rounded-2xl ring-1 ring-white/10"
              >
                <img src={avatar} alt="" className="h-28 w-full object-cover sm:h-32" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium">
                  <Camera className="mr-2 h-4 w-4" />
                  Set group photo
                </span>
              </button>
              <FormField label="Group name *">
                <FormInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Neon Night Crew"
                  autoFocus
                />
              </FormField>
              <FormField label="Description" hint="What this group is for">
                <FormTextarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Carpool, fits, and meet-up plans…"
                />
              </FormField>
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep('members')}
                className="ios-button w-full py-3.5 disabled:opacity-40"
              >
                Next — invite friends
              </button>
            </>
          ) : (
            <>
              <p className="ios-caption">
                Select at least one friend. You can add more later from group info.
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {friends.map((f) => {
                  const on = selected.includes(f.id)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggle(f.id)}
                      className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left ${
                        on ? 'bg-[#0a84ff]/20 ring-1 ring-[#0a84ff]/40' : 'hover:bg-white/5'
                      }`}
                    >
                      <img src={f.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-slate-500">@{f.handle}</p>
                      </div>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          on ? 'border-[#0a84ff] bg-[#0a84ff]' : 'border-white/30'
                        }`}
                      >
                        {on && <span className="text-[10px] text-white">✓</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={selected.length === 0}
                  onClick={create}
                  className="ios-button flex flex-1 items-center justify-center gap-2 py-3.5 disabled:opacity-40"
                >
                  <Users className="h-4 w-4" />
                  Create group ({selected.length + 1})
                </button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>

      <ImagePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Group photo"
        onSelect={setAvatar}
      />
    </>
  )
}
