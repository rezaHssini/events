import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { EventMediaItem } from '../../data/mockData'

export function EventMediaCarousel({
  items,
  alt = '',
  aspectClassName = 'aspect-[4/5]',
  dotsClassName = 'bottom-24',
  dotsPosition = 'bottom',
  className = '',
  showBackground = true,
  showBottomGradient = false,
}: {
  items: EventMediaItem[]
  alt?: string
  aspectClassName?: string
  dotsClassName?: string
  dotsPosition?: 'bottom' | 'right'
  className?: string
  showBackground?: boolean
  showBottomGradient?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const hasMultiple = items.length > 1
  const activeItem = items[activeIndex]
  const showMuteControl = activeItem?.type === 'video'

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(Math.min(index, items.length - 1))
  }, [items.length])

  const goTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.muted = isMuted
    })
  }, [isMuted])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    videoRefs.current.forEach((video, index) => {
      if (!video) return
      if (index === activeIndex) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    })
  }, [activeIndex, items])

  const isVerticalDots = dotsPosition === 'right'
  const dotsContainerClass = isVerticalDots
    ? `right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1.5 ${dotsClassName}`
    : `left-0 right-0 z-30 flex justify-center gap-1.5 ${dotsClassName}`

  if (items.length === 0) return null

  return (
    <div
      className={`relative w-full overflow-hidden ${showBackground ? 'bg-surface-2' : ''} ${aspectClassName} ${className}`}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex h-full w-full overflow-y-hidden ${
          hasMultiple ? 'snap-x snap-mandatory overflow-x-auto scrollbar-hide' : 'overflow-x-hidden'
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => (
          <div
            key={`${item.type}-${item.src}-${index}`}
            className="relative h-full w-full shrink-0 grow-0 basis-full snap-center snap-always"
          >
            {item.type === 'video' ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el
                }}
                src={item.src}
                poster={item.poster}
                muted={isMuted}
                loop
                playsInline
                autoPlay={index === activeIndex}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <img
                src={item.src}
                alt={alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover object-center"
              />
            )}
          </div>
        ))}
      </div>

      {showBottomGradient && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/40" />
      )}

      {showMuteControl && (
        <button
          type="button"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          aria-pressed={!isMuted}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setIsMuted((muted) => !muted)
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      {hasMultiple && (
        <div className={`pointer-events-none absolute ${dotsContainerClass}`}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                goTo(index)
              }}
              className={`pointer-events-auto rounded-full transition-all ${
                index === activeIndex
                  ? isVerticalDots
                    ? 'h-4 w-1.5 bg-white'
                    : 'h-1.5 w-4 bg-white'
                  : 'h-1.5 w-1.5 bg-white/45'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
