import { SpatialPhoto } from '../ui/SpatialPhoto'

type FeedImageProps = {
  src: string
  alt?: string
  aspect?: 'square' | 'video' | 'portrait' | 'wide'
  className?: string
  rounded?: 'none' | 'lg' | 'xl' | '2xl'
  spatial?: boolean
}

export function FeedImage({
  src,
  alt = '',
  aspect = 'portrait',
  className = '',
  rounded = 'none',
  spatial = true,
}: FeedImageProps) {
  if (spatial) {
    return (
      <SpatialPhoto
        src={src}
        alt={alt}
        aspect={aspect}
        className={className}
        rounded={rounded !== 'none'}
        enableTilt
      />
    )
  }

  return (
    <div className={`relative overflow-hidden bg-surface-2 aspect-[4/5] ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

export function AvatarRing({
  src,
  name,
  size = 'md',
  active = false,
  onClick,
}: {
  src: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
  onClick?: () => void
}) {
  const sizes = { sm: 'h-14 w-14', md: 'h-16 w-16', lg: 'h-[72px] w-[72px]' }

  const ring = active
    ? 'bg-gradient-to-br from-[#0A84FF] via-[#5E5CE6] to-[#BF5AF2] p-[2.5px]'
    : 'bg-white/20 p-[2px]'

  const content = (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div className={`relative shrink-0 ${sizes[size]}`}>
        <div className={`absolute inset-0 rounded-full ${ring}`}>
          <div className="h-full w-full rounded-full bg-black p-[2px]">
            <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
          </div>
        </div>
      </div>
      <span className="max-w-[68px] truncate text-[11px] font-medium text-[rgba(235,235,245,0.6)]">
        {name}
      </span>
    </button>
  )

  return content
}
