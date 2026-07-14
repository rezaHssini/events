import { useRef } from 'react'
import { Camera, ImageIcon, Upload } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { media } from '../../data/media'
import { useToast } from '../../context/ToastContext'

const defaultImageOptions = [
  media.concert,
  media.jazz,
  media.festival,
  media.workshop,
  media.warehouse,
  media.skyline,
  media.memory1,
  media.memory2,
  media.food,
  media.cocktail,
]

export function ImagePickerSheet({
  open,
  onClose,
  title,
  onSelect,
  options: customOptions,
  showPresets = true,
}: {
  open: boolean
  onClose: () => void
  title: string
  onSelect: (src: string) => void
  options?: string[]
  showPresets?: boolean
}) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const options = customOptions ?? defaultImageOptions

  const handleImageFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file')
      return
    }
    const url = URL.createObjectURL(file)
    onSelect(url)
    onClose()
    toast('✓ Image added')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4 text-left">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-left text-sm font-medium"
        >
          <Camera className="h-5 w-5 text-[#0a84ff]" />
          Take photo
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-left text-sm font-medium"
        >
          <ImageIcon className="h-5 w-5 text-[#0a84ff]" />
          Choose from gallery
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-[16px] border border-dashed border-white/20 px-4 py-3.5 text-left text-sm font-medium text-[#0a84ff]"
        >
          <Upload className="h-5 w-5" />
          Upload from phone
        </button>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleImageFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleImageFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        {showPresets && (
          <>
            <p className="ios-caption">Or pick a sample image</p>
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
          </>
        )}
      </div>
    </BottomSheet>
  )
}

export function FilePickerSheet({
  open,
  onClose,
  title,
  onSelect,
  accept = '*/*',
}: {
  open: boolean
  onClose: () => void
  title: string
  onSelect: (file: { url: string; name: string; size: number; mimeType: string }) => void
  accept?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    onSelect({ url, name: file.name, size: file.size, mimeType: file.type || 'application/octet-stream' })
    onClose()
    toast('✓ File attached')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-3 text-left">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-[16px] border border-dashed border-white/20 px-4 py-4 text-sm font-medium text-[#0a84ff]"
        >
          <Upload className="h-5 w-5" />
          Choose file from phone
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <p className="ios-caption text-center">Photos, PDFs, documents, and more</p>
      </div>
    </BottomSheet>
  )
}

export function AttachmentPickerSheet({
  open,
  onClose,
  onPickImage,
  onPickFile,
  onShareEvent,
  showShareEvent = true,
}: {
  open: boolean
  onClose: () => void
  onPickImage: () => void
  onPickFile: () => void
  onShareEvent?: () => void
  showShareEvent?: boolean
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Attach">
      <div className="space-y-2 text-left">
        <button
          type="button"
          onClick={() => {
            onClose()
            onPickImage()
          }}
          className="flex w-full items-center gap-3 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-sm font-medium"
        >
          <Camera className="h-5 w-5 text-[#0a84ff]" />
          Photo or camera
        </button>
        <button
          type="button"
          onClick={() => {
            onClose()
            onPickFile()
          }}
          className="flex w-full items-center gap-3 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-sm font-medium"
        >
          <Upload className="h-5 w-5 text-[#0a84ff]" />
          File
        </button>
        {showShareEvent && onShareEvent && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onShareEvent()
            }}
            className="flex w-full items-center gap-3 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-sm font-medium"
          >
            <span className="text-lg">🎫</span>
            Share an event
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
