'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { CheckCircle, Clock, MapPinned, MapPin } from 'lucide-react'

const BOOKING_RECEIPT_KEY = 'carerouter_booking_receipt'

type StoredReceipt = {
  placeName: string
  slot: string
  location: { id: string; name: string; lat: number; lng: number }
}

function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function MapConfirmationPage() {
  const [receipt, setReceipt] = useState<StoredReceipt | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = sessionStorage.getItem(BOOKING_RECEIPT_KEY)
      if (raw) setReceipt(JSON.parse(raw) as StoredReceipt)
    } catch {
      setReceipt(null)
    }
  }, [])

  if (!mounted) {
    return (
      <>
        <div className="app-background" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    )
  }

  if (!receipt) {
    return (
      <>
        <div className="app-background" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <p className="text-center text-gray-600">No booking found.</p>
          <Link href="/map" className="btn-primary inline-flex items-center gap-2 py-2 px-4">
            <MapPin className="h-4 w-4" />
            View locations
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="app-background" />
      <div className="relative z-10 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-lg">
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-8 w-8 shrink-0 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Booking receipt</h1>
          </div>
          <p className="text-sm text-gray-600">Therapist session booking confirmed.</p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-900">{receipt.placeName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
              <Clock className="h-4 w-4" />
              {receipt.slot}
            </p>
          </div>
          <div className="mt-4 h-56 overflow-hidden rounded-lg border border-gray-200">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  center={{ lat: receipt.location.lat, lng: receipt.location.lng }}
                  zoom={15}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Marker
                    position={{ lat: receipt.location.lat, lng: receipt.location.lng }}
                    title={receipt.placeName}
                  />
                </Map>
              </APIProvider>
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                Map unavailable
              </div>
            )}
          </div>
          <a
            href={directionsUrl(receipt.location.lat, receipt.location.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3"
          >
            <MapPinned className="h-5 w-5" />
            Directions
          </a>
          <p className="mt-2 text-center text-xs text-gray-500">
            Opens Google Maps with directions to the venue.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/results" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to results
          </Link>
          <Link href="/map" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to locations
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
