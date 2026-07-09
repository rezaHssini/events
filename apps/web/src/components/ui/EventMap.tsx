import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { GeoPoint } from '../../utils/geocode'

type EventMapProps = {
  lat: number
  lng: number
  label?: string
  height?: number
  zoom?: number
  className?: string
}

function bboxFor(lat: number, lng: number, zoom: number) {
  const pad = 0.018 * (16 - Math.min(zoom, 16))
  return {
    west: lng - pad,
    south: lat - pad * 0.72,
    east: lng + pad,
    north: lat + pad * 0.72,
  }
}

export function EventMap({ lat, lng, label, height = 200, zoom = 15, className = '' }: EventMapProps) {
  const src = useMemo(() => {
    const box = bboxFor(lat, lng, zoom)
    const bbox = `${box.west}%2C${box.south}%2C${box.east}%2C${box.north}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
  }, [lat, lng, zoom])

  return (
    <div className={`overflow-hidden rounded-[18px] liquid-glass-subtle ${className}`}>
      <iframe
        title={label ? `Map: ${label}` : 'Event location map'}
        src={src}
        className="w-full border-0"
        style={{ height }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {label && (
        <div className="flex items-center gap-1.5 border-t border-white/10 px-3 py-2 text-left">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0a84ff]" />
          <p className="ios-caption truncate !text-[rgba(235,235,245,0.7)]">{label}</p>
        </div>
      )}
    </div>
  )
}

export function EventMapLink({ point }: { point: GeoPoint; label?: string }) {
  const url = `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-[#0a84ff] hover:underline"
    >
      Open in Maps →
    </a>
  )
}
