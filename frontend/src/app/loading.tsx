import { Heart } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <Heart className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CareRouter</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
