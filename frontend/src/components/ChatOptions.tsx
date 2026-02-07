interface ChatOption {
  value: string
  label: string
  description?: string
}

interface ChatOptionsProps {
  options: ChatOption[]
  onSelect: (value: string) => void
  multiSelect?: boolean
  selectedValues?: string[]
}

export default function ChatOptions({ 
  options, 
  onSelect, 
  multiSelect = false,
  selectedValues = []
}: ChatOptionsProps) {
  const handleClick = (value: string) => {
    if (multiSelect) {
      // For multi-select, just toggle selection
      onSelect(value)
    } else {
      // For single-select, submit immediately
      onSelect(value)
    }
  }

  return (
    <div className="space-y-2 mb-4">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value)
        
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-2">
              {multiSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-600 mt-0.5">{option.description}</div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
