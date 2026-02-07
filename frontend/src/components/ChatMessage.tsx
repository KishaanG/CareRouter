interface ChatMessageProps {
  message: string
  isBot: boolean
  timestamp?: Date
}

export default function ChatMessage({ message, isBot, timestamp }: ChatMessageProps) {
  // Safety check: don't render if message is undefined or empty
  if (!message) return null

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3 ${
          isBot
            ? 'bg-white border-2 border-gray-200 text-gray-900 shadow-sm'
            : 'bg-primary-600 text-white shadow-md'
        }`}
      >
        <p className={`${isBot ? 'text-base' : 'text-sm'} whitespace-pre-wrap leading-relaxed`}>
          {message}
        </p>
        {timestamp && !isBot && (
          <p className="text-xs mt-1 text-primary-100 opacity-80">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
