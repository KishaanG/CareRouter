import { Clock, MapPin, DollarSign, Info } from 'lucide-react'

interface Resource {
  id: number
  name: string
  type: string
  description: string
  availability: string
  cost: string
  distance: string
  waitTime?: string
  whyRecommended?: string
}

interface ResourceCardProps {
  resource: Resource
  onBook?: () => void
}

export default function ResourceCard({ resource, onBook }: ResourceCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
          <span className="text-sm text-primary-600 font-medium">{resource.type}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{resource.availability}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{resource.cost}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{resource.distance}</span>
        </div>
        {resource.waitTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">Wait: {resource.waitTime}</span>
          </div>
        )}
      </div>

      {/* Why Recommended */}
      {resource.whyRecommended && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-4">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            <strong>Why this was chosen:</strong> {resource.whyRecommended}
          </p>
        </div>
      )}

      {/* Action Button */}
      {onBook && (
        <button onClick={onBook} className="btn-primary w-full text-sm py-2">
          Book Appointment
        </button>
      )}
    </div>
  )
}
