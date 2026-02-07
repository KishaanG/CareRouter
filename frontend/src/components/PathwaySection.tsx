import ResourceCard from './ResourceCard'

interface PathwaySectionProps {
  title: string
  subtitle: string
  color: 'green' | 'yellow' | 'red'
  resources: any[]
}

export default function PathwaySection({ title, subtitle, color, resources }: PathwaySectionProps) {
  const colorStyles = {
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  }

  const iconStyles = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className={`p-4 rounded-t-lg border ${colorStyles[color]} flex items-center gap-3`}>
        <div className={`w-3 h-3 rounded-full ${iconStyles[color]}`}></div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-4">
        <div className="space-y-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </div>
  )
}
