import { InteractiveMap } from './InteractiveMap'

type EventMapProps = {
  lat: number
  lng: number
  label?: string
  height?: number
  zoom?: number
  className?: string
}

export function EventMap({ lat, lng, label, height = 200, className = '' }: EventMapProps) {
  return (
    <InteractiveMap
      height={height}
      className={className}
      caption={label}
      pins={[{ id: 'pin', lat, lng, label, selected: true }]}
    />
  )
}

export function EventMapLink({ point, label }: { point: { lat: number; lng: number }; label?: string }) {
  const url = `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-[#0a84ff] hover:underline"
    >
      {label ?? 'Open in Maps →'}
    </a>
  )
}
