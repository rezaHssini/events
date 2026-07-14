export type GeoPoint = { lat: number; lng: number }

const LA_CENTER: GeoPoint = { lat: 34.0522, lng: -118.2437 }

const VENUE_COORDS: Record<string, GeoPoint> = {
  warehouse: { lat: 34.0407, lng: -118.2322 },
  skyline: { lat: 34.09, lng: -118.38 },
  jazz: { lat: 34.098, lng: -118.325 },
  downtown: { lat: 34.0489, lng: -118.2518 },
  hollywood: { lat: 34.0928, lng: -118.3287 },
}

function hashOffset(text: string): GeoPoint {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0
  const lat = LA_CENTER.lat + ((hash % 1000) / 1000 - 0.5) * 0.08
  const lng = LA_CENTER.lng + (((hash >> 8) % 1000) / 1000 - 0.5) * 0.1
  return { lat, lng }
}

/** Demo geocoder — maps known LA venues or derives stable coords from address text */
export function geocodeAddress(address: string, venue?: string): GeoPoint {
  const haystack = `${venue ?? ''} ${address}`.toLowerCase()
  for (const [key, point] of Object.entries(VENUE_COORDS)) {
    if (haystack.includes(key)) return point
  }
  if (haystack.includes('industrial')) return VENUE_COORDS.warehouse
  if (haystack.includes('sunset')) return VENUE_COORDS.skyline
  if (haystack.includes('arts district')) return VENUE_COORDS.downtown
  return hashOffset(haystack.trim() || 'los angeles')
}
