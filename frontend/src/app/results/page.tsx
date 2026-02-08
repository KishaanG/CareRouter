'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps'
import { AlertCircle, Clock, Phone, MapPin, CheckCircle, Navigation, List } from 'lucide-react'
import { StoredPathway } from '@/types'

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

const USER_MARKER_ICON = {
  url: 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#2563eb" stroke="white" stroke-width="2"/></svg>'
  ),
  scaledSize: { width: 32, height: 32 },
  anchor: { x: 16, y: 16 },
}

// Red pin for the selected/focused location (like the image)
const SELECTED_MARKER_ICON = {
  url: 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 10a6 6 0 110 12 6 6 0 010-12z" fill="#dc2626" stroke="white" stroke-width="2"/></svg>'
  ),
  scaledSize: { width: 40, height: 40 },
  anchor: { x: 20, y: 40 },
}

const FOCUS_ZOOM = 15

/** Pans and zooms map to position when set, then clears so map stays interactive. */
function MapFocusToPosition({
  position,
  onFocused,
}: {
  position: { lat: number; lng: number } | null
  onFocused: () => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!map || !position) return
    map.moveCamera({ center: position, zoom: FOCUS_ZOOM })
    const id = setTimeout(() => onFocused(), 150)
    return () => clearTimeout(id)
  }, [map, position, onFocused])
  return null
}

/** Fits bounds to include user and all resource markers when trigger increments. */
function MapRecenterController({
  userLocation,
  resources,
  trigger,
}: {
  userLocation: { lat: number; lng: number } | null
  resources: Array<{ latitude: number; longitude: number }>
  trigger: number
}) {
  const map = useMap()
  useEffect(() => {
    if (!map || trigger === 0) return
    const bounds = new google.maps.LatLngBounds()
    if (userLocation) bounds.extend(userLocation)
    resources.forEach((r) => bounds.extend({ lat: r.latitude, lng: r.longitude }))
    if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat() || bounds.getNorthEast().lng() !== bounds.getSouthWest().lng()) {
      map.fitBounds(bounds, 48)
    } else if (userLocation) {
      map.panTo(userLocation)
      map.setZoom(13)
    }
  }, [map, userLocation, resources, trigger])
  return null
}

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 }
const BOOKING_RECEIPT_KEY = 'carerouter_booking_receipt'

function getNextAvailability(): { date: string; time: string; label: string }[] {
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
      result.push({ date: dateStr, time: s.time, label: `${dayLabel}, ${s.label}` })
    })
  }
  return result.slice(0, 14)
}

export default function ResultsPage() {
  const router = useRouter()
  const [pathwayData, setPathwayData] = useState<StoredPathway | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedResourceIndex, setSelectedResourceIndex] = useState<number | null>(null)
  const [focusPosition, setFocusPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [recenterTrigger, setRecenterTrigger] = useState(0)
  const [listPanelOpen, setListPanelOpen] = useState(true)
  const [bookingResourceIndex, setBookingResourceIndex] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; label: string } | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [hoveredQuickContact, setHoveredQuickContact] = useState<number | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const savedPathway = localStorage.getItem('pathway')
    if (savedPathway) {
      try {
        const data = JSON.parse(savedPathway) as StoredPathway
        setPathwayData(data)
      } catch {
        router.push('/assessment')
      }
    } else {
      router.push('/assessment')
    }
    setLoading(false)
  }, [router])

  const clearFocus = useCallback(() => setFocusPosition(null), [])

  const resourcesWithCoords = useMemo(() => {
    if (!pathwayData?.recommended_pathway) return []
    return pathwayData.recommended_pathway.filter(
      (r) => r.latitude != null && r.longitude != null
    ) as Array<{ name: string; type: string; description: string; latitude: number; longitude: number; [key: string]: unknown }>
  }, [pathwayData?.recommended_pathway])

  // Separate quick contacts (phone/website that are NOT facilities) from rest
  const quickContacts = useMemo(() => {
    if (!pathwayData?.recommended_pathway) return []
    return pathwayData.recommended_pathway
      .map((r, idx) => {
        const contactInfo = r.data || r.contact
        const isPhone = contactInfo && /^[\d\-\(\)\s]+$/.test(String(contactInfo))
        const isWebsite = contactInfo && (String(contactInfo).startsWith('http') || String(contactInfo).includes('.ca') || String(contactInfo).includes('.com'))
        const isFacility = r.type === 'Facility'
        return { resource: r, index: idx, isPhone, isWebsite, isContact: (isPhone || isWebsite) && !isFacility }
      })
      .filter((item) => item.isContact)
  }, [pathwayData?.recommended_pathway])

  const facilityResources = useMemo(() => {
    if (!pathwayData?.recommended_pathway) return []
    return pathwayData.recommended_pathway.map((r, idx) => {
      const contactInfo = r.data || r.contact
      const isPhone = contactInfo && /^[\d\-\(\)\s]+$/.test(String(contactInfo))
      const isWebsite = contactInfo && (String(contactInfo).startsWith('http') || String(contactInfo).includes('.ca') || String(contactInfo).includes('.com'))
      const isFacility = r.type === 'Facility'
      // Only skip if it's a phone/website AND NOT a facility
      const shouldSkip = (isPhone || isWebsite) && !isFacility
      return { resource: r, index: idx, shouldSkip }
    })
  }, [pathwayData?.recommended_pathway])

  if (loading) {
    return (
      <>
        <div className="app-background" />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-queens-navy border-t-transparent mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your support pathway...</p>
          </div>
        </div>
      </>
    )
  }

  if (!pathwayData) {
    return null
  }

  const { scores, recommended_pathway, userLocation } = pathwayData

  const mapCenter =
    userLocation && userLocation.lat && userLocation.lng
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : resourcesWithCoords.length > 0
        ? { lat: resourcesWithCoords[0].latitude, lng: resourcesWithCoords[0].longitude }
        : DEFAULT_CENTER

  const getSeverityColor = (score: number) => {
    if (score === 1) return 'bg-green-100 text-green-800'
    if (score === 2) return 'bg-yellow-100 text-yellow-800'
    if (score === 3) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'routine') return 'bg-blue-100 text-blue-800'
    if (urgency === 'soon') return 'bg-yellow-100 text-yellow-800'
    if (urgency === 'urgent') return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const handleResourceClick = (index: number) => {
    const r = recommended_pathway[index]
    if (r?.latitude != null && r?.longitude != null) {
      setSelectedResourceIndex(index)
      setFocusPosition({ lat: r.latitude, lng: r.longitude })
      setListPanelOpen(true)
      cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const availabilitySlots = getNextAvailability()
  const bookingResource = bookingResourceIndex != null ? recommended_pathway[bookingResourceIndex] : null

  const handleBookClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookingResourceIndex(index)
    setSelectedSlot(null)
  }

  const closeBookingPanel = () => {
    setBookingResourceIndex(null)
    setSelectedSlot(null)
  }

  const handleFinalizeBooking = async () => {
    if (!bookingResource || !selectedSlot) return
    const hasCoords = bookingResource.latitude != null && bookingResource.longitude != null
    setBookingLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const receipt = {
        placeName: bookingResource.name,
        slot: selectedSlot.label,
        location: {
          id: String(bookingResourceIndex),
          name: bookingResource.name,
          lat: hasCoords ? bookingResource.latitude! : DEFAULT_CENTER.lat,
          lng: hasCoords ? bookingResource.longitude! : DEFAULT_CENTER.lng,
        },
      }
      sessionStorage.setItem(BOOKING_RECEIPT_KEY, JSON.stringify(receipt))
      router.push('/map/confirmation')
    } finally {
      setBookingLoading(false)
    }
  }

  const showMap = !!apiKey
  const hasMapMarkers = resourcesWithCoords.length > 0 || (userLocation?.lat != null && userLocation?.lng != null)

  const locationCount = facilityResources.filter((item) => !item.shouldSkip).length
  const countLabel = locationCount > 0 ? `${locationCount} Locations Recommended` : '0 Locations'

  return (
    <>
      <div className="app-background" />
      
      {/* Quick Contacts Bar at Top with Profile Button */}
      {quickContacts.length > 0 && (
        <div className="relative z-20 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm">
          {/* Profile Button - Top Right */}
          <div className="absolute right-4 top-3">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-queens-navy text-white hover:bg-queens-navy/90 transition-colors shadow-md"
              aria-label="Profile"
              title="Profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
          
          <div className="max-w-full mx-auto text-center">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Quick Contacts</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickContacts.map(({ resource, index, isPhone, isWebsite }) => {
                const contactInfo = resource.data || resource.contact
                const isHovered = hoveredQuickContact === index
                return (
                  <div
                    key={index}
                    className="relative"
                    onMouseEnter={() => setHoveredQuickContact(index)}
                    onMouseLeave={() => setHoveredQuickContact(null)}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-help"
                    >
                      <div>
                        <p className="text-xs font-medium text-text-primary">{resource.name}</p>
                        {isPhone && (
                          <a
                            href={`tel:${String(contactInfo).replace(/\D/g, '')}`}
                            className="text-xs text-queens-navy font-semibold hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3" />
                            {String(contactInfo)}
                          </a>
                        )}
                        {isWebsite && (
                          <a
                            href={String(contactInfo).startsWith('http') ? String(contactInfo) : `https://${contactInfo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-queens-navy font-semibold hover:underline truncate max-w-[150px] block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {String(contactInfo)}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    {isHovered && resource.description && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-max max-w-xs">
                        <div className="bg-queens-navy text-white text-xs rounded-lg p-2 shadow-lg">
                          {resource.description}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-queens-navy"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 flex overflow-hidden bg-white/95" style={{ height: `calc(100vh - ${quickContacts.length > 0 ? '100px' : '0px'})` }}>
        {/* Left: locations list (~1/3 width, like the image) */}
        {listPanelOpen && (
          <div className="flex h-full w-full flex-col border-r border-gray-200 bg-gray-50/80 md:w-[36%] md:min-w-[320px] md:max-w-[420px]">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-text-primary">{countLabel}</span>
              <h1 className="font-heading text-lg font-bold text-queens-navy truncate">Support Pathway</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-4">
              <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold text-text-primary text-sm mb-1">Message for You</h2>
                    <p className="text-text-secondary text-sm leading-relaxed">{scores.personalized_note}</p>
                  </div>
                </div>
              </div>
              <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-text-primary mb-2">Assessment Summary</h2>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-text-secondary mb-0.5">Issue</p>
                    <p className="font-medium text-text-primary capitalize">{scores.issue_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-0.5">Urgency</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded-full font-medium ${getUrgencyColor(scores.urgency)}`}>
                      {scores.urgency.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-0.5">Severity</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded-full font-medium ${getSeverityColor(scores.severity_score)}`}>
                      {scores.severity_score}/4
                    </span>
                  </div>
                </div>
                {scores.needs_immediate_resources && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-900">Immediate support recommended.</p>
                  </div>
                )}
              </div>

              {pathwayData.exercises && pathwayData.exercises.length > 0 && (
                <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Exercise Toolbox</h2>
                  <div className="relative">
                    {/* Carousel Box */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white min-h-[200px] flex flex-col justify-between">
                      {/* Exercise Content */}
                      <div>
                        <h3 className="text-base font-semibold text-queens-navy mb-3">
                          {pathwayData.exercises[currentExerciseIndex].title}
                        </h3>
                        
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-text-secondary mb-2">Steps:</p>
                          <ol className="space-y-2">
                            {pathwayData.exercises[currentExerciseIndex].steps.map((step, stepIdx) => (
                              <li key={stepIdx} className="text-sm text-text-primary leading-relaxed">
                                <span className="font-semibold text-queens-navy">{stepIdx + 1}.</span> {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="bg-blue-100 rounded p-3 border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Why it helps: </span>
                            {pathwayData.exercises[currentExerciseIndex].benefit}
                          </p>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setCurrentExerciseIndex((i) => (i - 1 + pathwayData.exercises!.length) % pathwayData.exercises!.length)}
                          className="flex items-center justify-center w-8 h-8 rounded-full border border-queens-navy text-queens-navy hover:bg-queens-navy/10 transition-colors"
                          aria-label="Previous exercise"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <span className="text-xs font-medium text-text-secondary">
                          {currentExerciseIndex + 1} / {pathwayData.exercises.length}
                        </span>

                        <button
                          type="button"
                          onClick={() => setCurrentExerciseIndex((i) => (i + 1) % pathwayData.exercises!.length)}
                          className="flex items-center justify-center w-8 h-8 rounded-full border border-queens-navy text-queens-navy hover:bg-queens-navy/10 transition-colors"
                          aria-label="Next exercise"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Click a location to see it on the map</p>
            {facilityResources.length === 0 ? (
              <p className="text-text-secondary text-sm">No specific resources recommended at this time.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {facilityResources.map(({ resource, index, shouldSkip }) => {
                  // Skip quick contacts that are already shown at the top (phone/website that aren't facilities)
                  if (shouldSkip) return null
                  
                  const contactInfo = resource.data || resource.contact
                  const isPhone = contactInfo && /^[\d\-\(\)\s]+$/.test(String(contactInfo))
                  const isWebsite = contactInfo && (String(contactInfo).startsWith('http') || String(contactInfo).includes('.ca') || String(contactInfo).includes('.com'))
                  const isAddress = contactInfo && !isPhone && !isWebsite
                  const hasCoords = resource.latitude != null && resource.longitude != null
                  const isSelected = selectedResourceIndex === index

                  return (
                    <div
                      key={index}
                      ref={(el) => { cardRefs.current[index] = el }}
                      role={hasCoords ? 'button' : undefined}
                      tabIndex={hasCoords ? 0 : undefined}
                      onClick={() => hasCoords && handleResourceClick(index)}
                      onKeyDown={(e) => hasCoords && (e.key === 'Enter' || e.key === ' ') && handleResourceClick(index)}
                      className={`rounded-lg border-l-4 p-3 transition-all text-left ${
                        isSelected
                          ? 'border-l-queens-navy bg-queens-navy/5 border border-queens-navy/30 shadow-md'
                          : 'border-l-transparent border border-gray-200 bg-white hover:border-queens-gold/40 hover:bg-gray-50/80'
                      } ${hasCoords ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary text-base mb-1">{resource.name}</h3>
                          <span className="inline-block px-2 py-0.5 bg-queens-navy/10 text-queens-navy text-xs rounded-full">
                            {resource.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasCoords && (
                            <span className="flex items-center gap-1 text-xs font-medium text-queens-navy">
                              <MapPin className="w-3.5 h-3.5" />
                              View on map
                            </span>
                          )}
                          {resource.type === 'Facility' && (
                            <button
                              type="button"
                              onClick={(e) => handleBookClick(index, e)}
                              className="rounded-lg bg-queens-navy text-white px-3 py-1.5 text-xs font-medium hover:bg-queens-navy/90"
                            >
                              Book
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mt-2 leading-relaxed">{resource.description}</p>
                      {contactInfo && (
                        <div className="space-y-1 text-sm mt-2">
                          {isPhone && (
                            <div className="flex items-center gap-1.5 text-queens-navy font-medium">
                              <Phone className="w-3.5 h-3.5" />
                              <a href={`tel:${String(contactInfo).replace(/\D/g, '')}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                {String(contactInfo)}
                              </a>
                            </div>
                          )}
                          {isWebsite && (
                            <div className="flex items-center gap-1.5 text-queens-navy font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              <a
                                href={String(contactInfo).startsWith('http') ? String(contactInfo) : `https://${contactInfo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {String(contactInfo)}
                              </a>
                            </div>
                          )}
                          {isAddress && (
                            <div className="flex items-start gap-1.5 text-text-secondary">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span>{String(contactInfo)}</span>
                            </div>
                          )}
                          {resource.availability && (
                            <div className="flex items-center gap-1.5 text-text-secondary">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{String(resource.availability)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Booking panel */}
                      {bookingResourceIndex === index && (
                        <div className="mt-3 border-t border-gray-200 pt-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-queens-navy">Choose a time</span>
                            <button type="button" onClick={closeBookingPanel} className="text-xs text-gray-500 hover:text-queens-navy">Close</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {availabilitySlots.map((slot, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                                    ? 'border-queens-gold bg-queens-gold/20 text-queens-navy'
                                    : 'border-gray-200 bg-white text-text-primary hover:border-queens-gold/50'
                                }`}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={closeBookingPanel} className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-text-primary hover:bg-gray-50">
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleFinalizeBooking}
                              disabled={!selectedSlot || bookingLoading}
                              className="flex-1 rounded-lg bg-queens-navy text-white py-2 text-xs font-medium hover:bg-queens-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bookingLoading ? 'Booking...' : 'Finalize booking'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

              <div className="flex flex-col gap-2 mb-4">
                <button
                  onClick={() => router.push('/assessment')}
                  className="w-full bg-queens-navy hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  Start New Assessment
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-white hover:bg-gray-50 text-queens-navy font-medium py-2 px-4 rounded-lg border border-gray-300 text-sm"
                >
                  Print Pathway
                </button>
              </div>

              <details className="bg-white rounded-lg p-3 shadow-sm mb-3">
                <summary className="cursor-pointer font-semibold text-text-primary text-xs hover:text-queens-navy">
                  Why these recommendations?
                </summary>
                <p className="text-text-secondary text-xs mt-2 leading-relaxed">{scores.reasoning}</p>
                <p className="text-xs text-text-secondary mt-1">Confidence: {(scores.confidence * 100).toFixed(0)}%</p>
              </details>

              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>Important:</strong> In crisis, call 988 or 911.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right: map (~2/3 width, like the image); hidden on small screens so list is full width */}
        {showMap ? (
          <div className="relative hidden min-w-0 flex-1 flex-col overflow-hidden md:flex">
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                type="button"
                onClick={() => setListPanelOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-queens-navy shadow-md hover:bg-gray-50"
                aria-label={listPanelOpen ? 'Hide list' : 'Show list'}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                type="button"
                onClick={() => setRecenterTrigger((t) => t + 1)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-queens-navy shadow-md hover:bg-gray-50"
              >
                <Navigation className="h-4 w-4" />
                Center map
              </button>
            </div>
            <div className="flex-1 min-h-0 relative">
              {!hasMapMarkers && (
                <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg border border-queens-gold/40 bg-amber-50 px-4 py-2 shadow-md max-w-[90%]">
                  <p className="text-center text-sm text-amber-900">
                    <strong>Tip:</strong> Next time, allow location when asked during the assessment to see your position and nearby places on the map.
                  </p>
                </div>
              )}
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={mapCenter}
                  defaultZoom={hasMapMarkers ? (resourcesWithCoords.length > 1 || userLocation ? 11 : 14) : 10}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapFocusToPosition position={focusPosition} onFocused={clearFocus} />
                  <MapRecenterController
                    userLocation={userLocation?.lat != null && userLocation?.lng != null ? userLocation : null}
                    resources={resourcesWithCoords}
                    trigger={recenterTrigger}
                  />
                  {userLocation?.lat != null && userLocation?.lng != null && (
                    <Marker
                      position={{ lat: userLocation.lat, lng: userLocation.lng }}
                      title="You are here"
                      icon={USER_MARKER_ICON as google.maps.Icon}
                    />
                  )}
                  {recommended_pathway.map(
                    (r, i) =>
                      r.latitude != null &&
                      r.longitude != null && (
                        <Marker
                          key={i}
                          position={{ lat: r.latitude, lng: r.longitude }}
                          title={r.name}
                          icon={selectedResourceIndex === i ? (SELECTED_MARKER_ICON as google.maps.Icon) : undefined}
                        />
                      )
                  )}
                </Map>
              </APIProvider>
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-2 border-l border-gray-200 bg-gray-50/50 p-8 md:flex">
            <MapPin className="h-12 w-12 text-gray-300" />
            <p className="text-center text-sm text-text-secondary max-w-xs">
              Add <code className="rounded bg-gray-100 px-1 py-0.5 text-queens-navy">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env.local to see the map.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
