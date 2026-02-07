'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Heart, LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    router.push('/login')
  }

  // TODO: Person 2 - Fetch user bookings and pathway history from backend

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-xl">CareRouter</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/assessment')}
                className="btn-primary w-full"
              >
                Take New Assessment
              </button>
              <button
                onClick={() => router.push('/results')}
                className="btn-secondary w-full"
              >
                View My Pathway
              </button>
              <button
                onClick={() => router.push('/booking')}
                className="btn-secondary w-full"
              >
                Book Appointment
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Appointments
            </h2>
            <div className="text-gray-500 text-center py-8">
              <p>No upcoming appointments</p>
              <button
                onClick={() => router.push('/booking')}
                className="text-primary-600 hover:text-primary-700 mt-2 text-sm font-medium"
              >
                Book your first appointment
              </button>
            </div>
          </div>

          {/* Saved Resources */}
          <div className="card md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Support Pathway</h2>
            <div className="text-gray-500 text-center py-8">
              <p>Take an assessment to get your personalized support pathway</p>
              <button
                onClick={() => router.push('/assessment')}
                className="text-primary-600 hover:text-primary-700 mt-2 text-sm font-medium"
              >
                Start assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
