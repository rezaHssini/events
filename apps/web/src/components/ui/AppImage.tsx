import { useEffect, useState } from 'react'
import { media } from '../../data/media'

const FALLBACK = media.concert

export function AppImage({
  src,
  alt = '',
  className = '',
  fallback = FALLBACK,
}: {
  src?: string | null
  alt?: string
  className?: string
  fallback?: string
}) {
  const [resolved, setResolved] = useState(src || fallback)

  useEffect(() => {
    setResolved(src || fallback)
  }, [src, fallback])

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (resolved !== fallback) setResolved(fallback)
      }}
    />
  )
}
