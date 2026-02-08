'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps'
import { MapPin, Clock, Expand, Minimize2, Navigation } from 'lucide-react'

type Location = {
  id: string
  name: string
  lat: number
  lng: number
}

/** Current user position — in real app this would come from JSON (e.g. API or config). */
type UserPosition = { lat: number; lng: number }

// Example: from JSON — replace with your data source (e.g. fetch or props).
const currentUserPosition: UserPosition = {
  lat: 43.6520,
  lng: -79.3750,
}

// Blue circle for "you are here" marker (no browser location prompt).
const USER_MARKER_ICON = {
  url: 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#2563eb" stroke="white" stroke-width="2"/></svg>'
  ),
  scaledSize: { width: 32, height: 32 },
  anchor: { x: 16, y: 16 },
}

// Mock: generate next availability slots (next 7 days, a few times per day)
function getNextAvailability(locationId: string): { date: string; time: string; label: string }[] {
  const slots = [
    { time: '09:00', label: '9:00 AM' },
    { time: '10:30', label: '10:30 AM' },
    { time: '14:00', label: '2:00 PM' },
    { time: '15:30', label: '3:30 PM' },
    { time: '17:00', label: '5:00 PM' },
  ]
  const result: { date: string; time: string; label: string }[] = []
  const today = new Date()
  for (let d = 0; d < 7; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    const dayLabel = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    slots.forEach((s) => {
      result.push({
        date: dateStr,
        time: s.time,
        label: `${dayLabel}, ${s.label}`,
      })
    })
  }
  return result.slice(0, 14) // show first 14 options
}

const locations: Location[] = [
  { id: '1', name: 'Sliding Scale Counseling Center', lat: 43.6532, lng: -79.3832 },
  { id: '2', name: 'Community Mental Health Clinic', lat: 43.6510, lng: -79.3470 },
  { id: '3', name: 'Therapist - Dr. Sarah Johnson', lat: 43.6565, lng: -79.3590 },
]

const defaultCenter = { lat: 43.6532, lng: -79.3832 }
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
const BOOKING_RECEIPT_KEY = 'carerouter_booking_receipt'

/** Pans and zooms the map to a location when focusLocationId is set; then clears focus so the map stays interactive. */
function MapFocusController({
  focusLocationId,
  locationsList,
  onFocused,
}: {
  focusLocationId: string | null
  locationsList: Location[]
  onFocused: () => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!map || !focusLocationId) return
    const loc = locationsList.find((l) => l.id === focusLocationId)
    if (!loc) return
    map.panTo({ lat: loc.lat, lng: loc.lng })
    map.setZoom(15)
    onFocused()
  }, [map, focusLocationId, locationsList, onFocused])
  return null
}

/** Fits map bounds to include user position and all locations when recenterTrigger increments. */
function MapRecenterController({
  userPosition,
  locationsList,
  recenterTrigger,
}: {
  userPosition: UserPosition
  locationsList: Location[]
  recenterTrigger: number
}) {
  const map = useMap()
  useEffect(() => {
    if (!map || recenterTrigger === 0) return
    const bounds = new google.maps.LatLngBounds()
    bounds.extend({ lat: userPosition.lat, lng: userPosition.lng })
    locationsList.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }))
    map.fitBounds(bounds, 48)
  }, [map, userPosition, locationsList, recenterTrigger])
  return null
}

export default function MapPage() {
  const [mapExpanded, setMapExpanded] = useState(false)
  const [mapFocusLocationId, setMapFocusLocationId] = useState<string | null>(null)
  const [bookingPlaceId, setBookingPlaceId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; label: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [recenterTrigger, setRecenterTrigger] = useState(0)
  const router = useRouter()

  const clearMapFocus = useCallback(() => setMapFocusLocationId(null), [])
  const handleCentralize = useCallback(() => setRecenterTrigger((t) => t + 1), [])

  const availability = bookingPlaceId ? getNextAvailability(bookingPlaceId) : []
  const bookingPlace = locations.find((l) => l.id === bookingPlaceId)

  const handleBookClick = useCallback((placeId: string) => {
    setBookingPlaceId(placeId)
    setSelectedSlot(null)
  }, [])

  const handleFinalize = useCallback(async () => {
    if (!bookingPlace || !selectedSlot) return
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const receipt = {
        placeName: bookingPlace.name,
        slot: selectedSlot.label,
        location: bookingPlace,
      }
      sessionStorage.setItem(BOOKING_RECEIPT_KEY, JSON.stringify(receipt))
      setBookingPlaceId(null)
      setSelectedSlot(null)
      router.push('/map/confirmation')
    } finally {
      setLoading(false)
    }
  }, [bookingPlace, selectedSlot, router])

  const closeBookingPanel = useCallback(() => {
    setBookingPlaceId(null)
    setSelectedSlot(null)
  }, [])


  if (!apiKey) {
    return (
      <>
        <div className="app-background" />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="rounded-2xl bg-white p-8 shadow-md border border-white/80 max-w-md">
            <p className="text-center text-text-primary">
              Add <code className="rounded bg-gray-100 px-1.5 py-0.5 text-queens-navy font-medium">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-queens-navy font-medium">.env.local</code> to show the map.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="app-background" />
      <div className="relative z-10 flex h-screen flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row min-h-0">
        {/* List of therapist places — card panel */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 md:max-w-md overflow-hidden rounded-2xl bg-white p-5 shadow-md border border-white/80">
          <h1 className="shrink-0 font-heading text-2xl font-bold text-queens-navy tracking-tight">
            Therapist locations
          </h1>
          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {locations.map((loc) => (
              <li key={loc.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMapFocusLocationId(loc.id)
                        setMapExpanded(true)
                      }}
                      className="shrink-0 rounded-lg p-1.5 text-queens-navy/70 hover:bg-queens-navy/10 hover:text-queens-navy transition-colors"
                      title="Show on map"
                      aria-label={`Show ${loc.name} on map`}
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                    <span className="font-medium text-text-primary text-base leading-snug">{loc.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookClick(loc.id)}
                    className="shrink-0 rounded-xl bg-queens-navy hover:bg-queens-navy/90 text-white font-medium py-2 px-4 text-sm shadow-sm transition-colors"
                  >
                    Book
                  </button>
                </div>
                {/* Availability panel for this place */}
                {bookingPlaceId === loc.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-queens-navy">Next availability</span>
                      <button
                        type="button"
                        onClick={closeBookingPanel}
                        className="text-sm text-gray-500 hover:text-queens-navy font-medium"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availability.map((slot, i) => (
                        <button
                          key={`${slot.date}-${slot.time}-${i}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                              ? 'border-queens-gold bg-queens-gold/20 text-queens-navy'
                              : 'border-gray-200 bg-white text-text-primary hover:border-queens-gold/50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {slot.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={closeBookingPanel} className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 font-medium text-text-primary hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalize}
                        disabled={!selectedSlot || loading}
                        className="flex-1 rounded-xl bg-queens-navy hover:bg-queens-navy/90 text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                      >
                        {loading ? 'Booking...' : 'Finalize booking'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Map — card panel with distinct background */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden rounded-2xl bg-white p-5 shadow-md border border-white/80">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-queens-navy">Map</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCentralize}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-queens-navy hover:bg-queens-navy/10 hover:border-queens-gold/40 transition-colors"
                title="Center map on your location"
                aria-label="Center map on your location"
              >
                <Navigation className="h-4 w-4" />
                Centralize
              </button>
              <button
                type="button"
                onClick={() => setMapExpanded((e) => !e)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-queens-navy hover:bg-queens-navy/10 hover:border-queens-gold/40 transition-colors"
                aria-label={mapExpanded ? 'Shrink map' : 'Expand map'}
              >
              {mapExpanded ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Shrink
                </>
              ) : (
                <>
                  <Expand className="h-4 w-4" />
                  Expand
                </>
              )}
            </button>
            </div>
          </div>
          {mapExpanded && (
            <div
              className="fixed inset-0 z-30 bg-black/40"
              onClick={() => setMapExpanded(false)}
              aria-hidden
            />
          )}
          <div
            className={`flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-inner transition-all ${
              mapExpanded ? 'fixed inset-4 z-40 md:inset-8 h-[calc(100%-2rem)] md:h-[calc(100%-4rem)]' : 'w-full min-h-[240px]'
            }`}
          >
            <button
              type="button"
              onClick={() => setMapExpanded(false)}
              className={`absolute right-2 top-2 z-10 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-queens-navy hover:bg-gray-50 shadow-sm ${
                mapExpanded ? '' : 'hidden'
              }`}
            >
              Close
            </button>
            <div className="h-full w-full">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={12}
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
              >
                <MapFocusController
                  focusLocationId={mapFocusLocationId}
                  locationsList={locations}
                  onFocused={clearMapFocus}
                />
                <MapRecenterController
                  userPosition={currentUserPosition}
                  locationsList={locations}
                  recenterTrigger={recenterTrigger}
                />
                <Marker
                  position={{ lat: currentUserPosition.lat, lng: currentUserPosition.lng }}
                  title="You are here"
                  icon={USER_MARKER_ICON as google.maps.Icon}
                />
                {locations.map((loc) => (
                  <Marker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    title={loc.name}
                  />
                ))}
              </Map>
            </APIProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
