import { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  answer: any
  onAnswer: (answer: any) => void
}

export default function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  return (
    <div className="card">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">{question.text}</h2>
      
      {question.subtitle && (
        <p className="text-gray-600 mb-6">{question.subtitle}</p>
      )}

      <div className="space-y-3">
        {question.type === 'single-choice' && question.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              answer === option.value
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="font-medium text-gray-900">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </button>
        ))}

        {question.type === 'multi-choice' && question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
              answer?.includes(option.value)
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={answer?.includes(option.value) || false}
              onChange={(e) => {
                const currentAnswers = answer || []
                if (e.target.checked) {
                  onAnswer([...currentAnswers, option.value])
                } else {
                  onAnswer(currentAnswers.filter((a: string) => a !== option.value))
                }
              }}
              className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.note && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">{question.note}</p>
        </div>
      )}
    </div>
  )
}
