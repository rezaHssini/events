import { useRef } from 'react'
import { BottomSheet } from './BottomSheet'
import { media } from '../../data/media'
import { useToast } from '../../context/ToastContext'
import { Upload, Film } from 'lucide-react'

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
