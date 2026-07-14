import { useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { ImagePickerSheet } from './MediaPickerSheet'
import { media } from '../../data/media'
import { useStories } from '../../context/StoriesContext'
import { useToast } from '../../context/ToastContext'

export { ImagePickerSheet, FilePickerSheet, AttachmentPickerSheet } from './MediaPickerSheet'
export { VideoPickerSheet, DEMO_VIDEOS } from './VideoPickerSheet'

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
  const [showImagePicker, setShowImagePicker] = useState(false)

  const handlePost = () => {
    if (!caption.trim()) return
    addStory(caption.trim(), selectedImage)
    toast('✓ Story posted')
    setCaption('')
    onClose()
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Add to your story">
        <div className="space-y-4 text-left">
          <button
            type="button"
            onClick={() => setShowImagePicker(true)}
            className="relative block w-full overflow-hidden rounded-[18px]"
          >
            <img src={selectedImage} alt="" className="h-48 w-full object-cover" />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <Camera className="h-3.5 w-3.5" />
              Change photo
            </span>
          </button>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className="w-full resize-none rounded-[16px] bg-white/10 px-4 py-3 text-[15px] outline-none"
          />
          <p className="ios-caption">Quick backgrounds</p>
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
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl liquid-glass-subtle text-[10px] text-[#0a84ff]"
            >
              <ImageIcon className="h-5 w-5" />
              Camera
            </button>
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

      <ImagePickerSheet
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        title="Story photo"
        onSelect={setSelectedImage}
      />
    </>
  )
}
