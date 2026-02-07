'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, MapPin, DollarSign, Calendar } from 'lucide-react'
import ResourceCard from '@/components/ResourceCard'
import PathwaySection from '@/components/PathwaySection'

// TODO: Person 2 - Replace with real data from backend
const mockPathway = {
  severity: 'moderate',
  urgency: 'soon',
  rightNow: [
    {
      id: 1,
      name: 'Crisis Text Line',
      type: 'Peer Support',
      description: 'Text HOME to 741741 for free, 24/7 support',
      availability: 'Available now',
      cost: 'Free',
      distance: 'Online',
      whyRecommended: 'Free and immediately accessible',
    },
    {
      id: 2,
      name: 'Community Mental Health Drop-In',
      type: 'Community Support',
      description: 'Walk-in support group meetings',
      availability: 'Today 6-8 PM',
      cost: 'Free',
      distance: '1.2 km away',
      whyRecommended: 'Free and within 3 km of your location',
    },
  ],
  thisWeek: [
    {
      id: 3,
      name: 'Sliding Scale Counseling Center',
      type: 'Professional Therapy',
      description: 'Individual therapy with licensed counselors',
      availability: 'Appointments available this week',
      cost: '$20-60 sliding scale',
      distance: '2.5 km away',
      waitTime: '3-5 days',
      whyRecommended: 'Affordable and accepts walk-ins',
    },
  ],
  crisis: [
    {
      id: 4,
      name: '988 Suicide & Crisis Lifeline',
      type: 'Crisis Support',
      description: 'Call or text 988 for immediate crisis support',
      availability: '24/7',
      cost: 'Free',
      distance: 'Phone/Text',
    },
  ],
}

export default function ResultsPage() {
  const router = useRouter()
  const [pathway, setPathway] = useState(mockPathway)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Person 2 - Fetch pathway from backend or route state
    // For now, using mock data
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your support pathway...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Support Pathway</h1>
          <p className="text-gray-600">
            Based on your responses, here are personalized support options for you.
          </p>
        </div>

        {/* Right Now Section */}
        <PathwaySection
          title="Right Now"
          subtitle="Support you can access today"
          color="green"
          resources={pathway.rightNow}
        />

        {/* This Week Section */}
        <PathwaySection
          title="This Week"
          subtitle="Short-term help and ongoing support"
          color="yellow"
          resources={pathway.thisWeek}
        />

        {/* If Things Worsen Section */}
        <PathwaySection
          title="If Things Worsen"
          subtitle="Safety net and crisis resources"
          color="red"
          resources={pathway.crisis}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/booking')}
            className="btn-primary flex-1"
          >
            Book an Appointment
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
          >
            Save/Print Pathway
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            This pathway was created based on your location, needs, and accessibility preferences.
            All resources are verified and updated regularly.
          </p>
        </div>
      </div>
    </div>
  )
}
