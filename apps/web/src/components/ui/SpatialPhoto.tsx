import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { media } from '../../data/media'

const FALLBACK = media.concert

type Aspect = 'square' | 'video' | 'portrait' | 'wide'

const aspectMap: Record<Aspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[16/9]',
}

type SpatialPhotoProps = {
  src: string
  alt?: string
  aspect?: Aspect
  className?: string
  rounded?: boolean
  enableTilt?: boolean
}

export function SpatialPhoto({
  src,
  alt = '',
  aspect = 'portrait',
  className = '',
  rounded = true,
  enableTilt = true,
}: SpatialPhotoProps) {
  const [loaded, setLoaded] = useState(false)
  const [resolvedSrc, setResolvedSrc] = useState(src)

  useEffect(() => {
    setResolvedSrc(src)
    setLoaded(false)
  }, [src])
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 22 })
  const sy = useSpring(my, { stiffness: 180, damping: 22 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5])
  const imgX = useTransform(sx, [-0.5, 0.5], [8, -8])
  const imgY = useTransform(sy, [-0.5, 0.5], [8, -8])
  const scale = useTransform(sx, [-0.5, 0.5], [1.04, 1.04])

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div
      className={`spatial-photo-wrap ${aspectMap[aspect]} ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div
        className={`spatial-photo relative h-full w-full ${rounded ? 'rounded-[var(--radius-ios-lg)]' : 'rounded-none shadow-none'}`}
        style={enableTilt ? { rotateX, rotateY, scale } : undefined}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        )}
        <motion.img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (resolvedSrc !== FALLBACK) {
              setResolvedSrc(FALLBACK)
              setLoaded(false)
            }
          }}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={enableTilt ? { x: imgX, y: imgY, scale: 1.08 } : { scale: 1 }}
        />
        <div className="spatial-photo-shine" />
        <div className="spatial-photo-edge" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </motion.div>
    </div>
  )
}
