import { useRef, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { media } from '../../data/media'
import { useStories } from '../../context/StoriesContext'
import { useToast } from '../../context/ToastContext'
import { Upload, Film } from 'lucide-react'

const galleryOptions = [
  { label: 'Concert', src: media.concert },
  { label: 'Festival', src: media.festival },
  { label: 'Jazz night', src: media.jazz },
  { label: 'Warehouse', src: media.warehouse },
]

export function StoryComposer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addStory } = useStories()
  const { toast } = useToast()
  const [caption, setCaption] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>(media.concert)

  const handlePost = () => {
    if (!caption.trim()) return
    addStory(caption.trim(), selectedImage)
    toast('✓ Story posted')
    setCaption('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add to your story">
      <div className="space-y-4 text-left">
        <div className="overflow-hidden rounded-[18px]">
          <img src={selectedImage} alt="" className="h-48 w-full object-cover" />
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's happening?"
          rows={3}
          className="w-full resize-none rounded-[16px] bg-white/10 px-4 py-3 text-[15px] outline-none"
        />
        <p className="ios-caption">Choose a background</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {galleryOptions.map((opt) => (
            <button
              key={opt.src}
              type="button"
              onClick={() => setSelectedImage(opt.src)}
              className={`shrink-0 overflow-hidden rounded-xl ring-2 ${
                selectedImage === opt.src ? 'ring-[#0a84ff]' : 'ring-transparent'
              }`}
            >
              <img src={opt.src} alt={opt.label} className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!caption.trim()}
          onClick={handlePost}
          className="ios-button w-full py-3.5 disabled:opacity-40"
        >
          Share to story
        </button>
      </div>
    </BottomSheet>
  )
}

export function ImagePickerSheet({
  open,
  onClose,
  title,
  onSelect,
  options: customOptions,
}: {
  open: boolean
  onClose: () => void
  title: string
  onSelect: (src: string) => void
  options?: string[]
}) {
  const options = customOptions ?? [
    media.concert,
    media.jazz,
    media.festival,
    media.workshop,
    media.warehouse,
    media.skyline,
    media.memory1,
    media.memory2,
  ]

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="grid grid-cols-2 gap-3">
        {options.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              onSelect(src)
              onClose()
            }}
            className="overflow-hidden rounded-[16px] ring-1 ring-white/10"
          >
            <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

export const DEMO_VIDEOS = [
  { src: media.eventVideoConcert, poster: media.crowd, label: 'Concert recap' },
  { src: media.eventVideoDj, poster: media.warehouse, label: 'DJ highlight' },
  { src: media.eventVideoFestival, poster: media.festival, label: 'Festival vibes' },
  { src: media.eventVideoJazz, poster: media.jazz, label: 'Jazz night' },
] as const

export function VideoPickerSheet({
  open,
  onClose,
  title,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  title: string
  onSelect: (src: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast('Please choose a video file')
      return
    }
    const url = URL.createObjectURL(file)
    onSelect(url)
    onClose()
    toast('✓ Video added')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4 text-left">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-white/20 py-4 text-sm font-semibold text-[#0a84ff]"
        >
          <Upload className="h-4 w-4" />
          Upload from device
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <p className="ios-caption">Or choose a sample clip</p>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_VIDEOS.map((video) => (
            <button
              key={video.src}
              type="button"
              onClick={() => {
                onSelect(video.src)
                onClose()
              }}
              className="overflow-hidden rounded-[16px] text-left ring-1 ring-white/10"
            >
              <div className="relative aspect-video bg-black">
                <img src={video.poster} alt="" className="h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Film className="h-8 w-8 text-white/90" />
                </div>
              </div>
              <p className="px-2 py-2 text-xs font-medium text-white/70">{video.label}</p>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
