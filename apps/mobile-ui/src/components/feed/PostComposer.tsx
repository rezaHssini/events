import { useEffect, useState } from 'react'
import { CalendarDays, Image as ImageIcon, Star, X } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { ImagePickerSheet } from '../ui/StoryComposer'
import { usePosts } from '../../context/PostsContext'
import { usePlanner } from '../../context/PlannerContext'
import { useToast } from '../../context/ToastContext'
import { events } from '../../data/mockData'
import { currentUser } from '../../data/socialData'

export function PostComposer({
  open,
  onClose,
  defaultEventId,
  defaultEventTitle,
  defaultMemory = false,
}: {
  open: boolean
  onClose: () => void
  defaultEventId?: string
  defaultEventTitle?: string
  defaultMemory?: boolean
}) {
  const { addPost } = usePosts()
  const { isPlanner } = usePlanner()
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [isMemory, setIsMemory] = useState(defaultMemory)
  const [showEventPicker, setShowEventPicker] = useState(defaultMemory || Boolean(defaultEventId))
  const [linkedEventId, setLinkedEventId] = useState<string | null>(defaultEventId ?? null)
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [postAsPlanner, setPostAsPlanner] = useState(isPlanner)

  const eventOptions = isPlanner
    ? events.slice(0, 5)
    : events.filter((e) => e.status !== 'past').slice(0, 5)

  const linkedEvent = linkedEventId ? events.find((e) => e.id === linkedEventId) : undefined

  useEffect(() => {
    if (!open) return
    setIsMemory(defaultMemory)
    setShowEventPicker(defaultMemory || Boolean(defaultEventId))
    setLinkedEventId(defaultEventId ?? null)
    setPostAsPlanner(isPlanner)
    if (defaultMemory && defaultEventTitle) {
      // event title comes from linked event at post time
    }
  }, [open, defaultMemory, defaultEventId, defaultEventTitle, isPlanner])

  const reset = () => {
    setText('')
    setRating(0)
    setIsMemory(defaultMemory)
    setShowEventPicker(defaultMemory || Boolean(defaultEventId))
    setLinkedEventId(defaultEventId ?? null)
    setSelectedMedia([])
    setPostAsPlanner(isPlanner)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const toggleMemory = () => {
    setIsMemory((on) => {
      const next = !on
      if (next) setShowEventPicker(true)
      return next
    })
  }

  const selectEvent = (eventId: string) => {
    setLinkedEventId(eventId)
    setShowEventPicker(false)
  }

  const handlePost = () => {
    if (!text.trim() && selectedMedia.length === 0 && !linkedEventId) return

    if (isMemory) {
      if (!linkedEventId) {
        toast('Choose the event this memory is for')
        setShowEventPicker(true)
        return
      }
      if (rating === 0) {
        toast('Add a star rating for your memory')
        return
      }
    }

    addPost({
      text: text.trim(),
      media: selectedMedia,
      linkedEventId: linkedEventId ?? undefined,
      isMemory,
      rating: isMemory ? rating : undefined,
      eventTitle: linkedEvent?.title ?? defaultEventTitle,
      asPlannerPage: isPlanner && postAsPlanner && !isMemory,
    })

    toast('✓ Posted to feed')
    handleClose()
  }

  const canSubmit =
    text.trim().length > 0 ||
    selectedMedia.length > 0 ||
    linkedEventId != null ||
    (isMemory && rating > 0)

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} title="Create post">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-slate-400">
                {isMemory ? 'Sharing a verified memory' : 'Share with followers'}
              </p>
            </div>
          </div>

          {isPlanner && (
            <div className="flex gap-2 rounded-[14px] liquid-glass-subtle p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPostAsPlanner(false)}
                className={`flex-1 rounded-[10px] py-2 ${!postAsPlanner ? 'bg-white/15 text-white' : 'text-slate-400'}`}
              >
                As @reza
              </button>
              <button
                type="button"
                onClick={() => setPostAsPlanner(true)}
                className={`flex-1 rounded-[10px] py-2 ${postAsPlanner ? 'bg-white/15 text-white' : 'text-slate-400'}`}
              >
                As planner page
              </button>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isMemory ? 'How was the night?' : "What's on your mind?"}
            rows={4}
            className="w-full resize-none rounded-[16px] bg-white/10 px-4 py-3 text-[15px] outline-none"
          />

          {linkedEvent && !showEventPicker && (
            <div className="flex items-center gap-3 rounded-[14px] liquid-glass-subtle p-2">
              <img src={linkedEvent.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold line-clamp-1">{linkedEvent.title}</p>
                <p className="text-xs text-slate-400">{linkedEvent.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setLinkedEventId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-400"
                aria-label="Remove event"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {isMemory && (
            <div className="rounded-[14px] liquid-glass-subtle p-3">
              <p className="mb-2 text-sm font-medium">Your rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-warning' : 'text-slate-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          {showEventPicker && (
            <div className="space-y-2 rounded-[14px] liquid-glass-subtle p-3">
              <p className="text-sm font-medium">
                {isMemory ? 'Which event was this?' : 'Attach an event'}
              </p>
              {eventOptions.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  className={`flex w-full items-center gap-3 rounded-[12px] p-2 text-left ${
                    linkedEventId === event.id ? 'bg-[#0a84ff]/20 ring-1 ring-[#0a84ff]' : 'bg-white/5'
                  }`}
                >
                  <img src={event.cover} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.date}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedMedia.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {selectedMedia.map((src) => (
                <img key={src} src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full liquid-glass-subtle text-[#0a84ff]"
              aria-label="Add photo"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowEventPicker((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                linkedEventId || showEventPicker
                  ? 'bg-[#0a84ff]/20 text-[#0a84ff]'
                  : 'liquid-glass-subtle text-slate-300'
              }`}
              aria-label="Attach event"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleMemory}
              className={`flex h-10 items-center gap-1.5 rounded-full px-3 ${
                isMemory ? 'bg-warning/20 text-warning' : 'liquid-glass-subtle text-slate-300'
              }`}
              aria-label="Post as memory"
            >
              <Star className={`h-5 w-5 ${isMemory ? 'fill-current' : ''}`} />
              <span className="text-xs font-semibold">Memory</span>
            </button>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handlePost}
            className="ios-button w-full py-3.5 disabled:opacity-40"
          >
            Post
          </button>
        </div>
      </BottomSheet>

      <ImagePickerSheet
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        title="Add photo"
        onSelect={(src) => setSelectedMedia((prev) => [...prev, src].slice(0, 4))}
      />
    </>
  )
}
