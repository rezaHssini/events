import { useMemo } from 'react'
import { MapPin } from 'lucide-react'

export type MapPinItem = {
  id: string
  lat: number
  lng: number
  label?: string
  selected?: boolean
  onSelect?: () => void
}

type InteractiveMapProps = {
  pins: MapPinItem[]
  height?: number
  className?: string
  /** Optional caption below the map */
  caption?: string
}

const LA_BOUNDS = {
  north: 34.14,
  south: 33.98,
  west: -118.42,
  east: -118.2,
}

function pinPosition(lat: number, lng: number) {
  const x = ((lng - LA_BOUNDS.west) / (LA_BOUNDS.east - LA_BOUNDS.west)) * 100
  const y = ((LA_BOUNDS.north - lat) / (LA_BOUNDS.north - LA_BOUNDS.south)) * 100
  return {
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(94, Math.max(6, y))}%`,
  }
}

export function InteractiveMap({ pins, height = 280, className = '', caption }: InteractiveMapProps) {
  const positioned = useMemo(
    () =>
      pins.map((pin) => ({
        ...pin,
        pos: pinPosition(pin.lat, pin.lng),
      })),
    [pins],
  )

  return (
    <div className={`overflow-hidden rounded-[18px] liquid-glass-subtle ${className}`}>
      <div
        className="relative w-full overflow-hidden bg-[#0d1117]"
        style={{ height }}
        role="img"
        aria-label="Event map"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(10,132,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(10,132,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/60 via-[#0d1520]/40 to-[#0a0a0f]/80" />
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur">
          Los Angeles
        </div>
        {positioned.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={pin.onSelect}
            className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-transform ${
              pin.onSelect ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            style={pin.pos}
            aria-label={pin.label ?? 'Event location'}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg ${
                pin.selected
                  ? 'border-white bg-[#0a84ff] text-white'
                  : 'border-[#0a84ff] bg-[#0a0a0f]/90 text-[#0a84ff]'
              }`}
            >
              <MapPin className="h-4 w-4" />
            </span>
          </button>
        ))}
        {pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-400">
            No events on the map for these filters
          </div>
        )}
      </div>
      {caption && (
        <div className="flex items-center gap-1.5 border-t border-white/10 px-3 py-2 text-left">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0a84ff]" />
          <p className="ios-caption truncate !text-[rgba(235,235,245,0.7)]">{caption}</p>
        </div>
      )}
    </div>
  )
}
