import React from 'react'
import { Bot } from 'lucide-react'

interface ChatMessageProps {
  message: string
  isBot: boolean
  timestamp?: Date
}

export default function ChatMessage({ message, isBot, timestamp }: ChatMessageProps) {
  if (!message) return null
  
  return (
    <div className={`flex items-start mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="avatar-ai mr-3 text-white">
          <Bot size={20} />
        </div>
      )}
      
      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} max-w-[75%]`}>
        <div className="message-bubble">
          <p className="text-base whitespace-pre-wrap leading-relaxed text-text-primary">
            {message}
          </p>
        </div>
        {timestamp && (
          <p className="text-xs text-text-secondary mt-1 px-2">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      
      {!isBot && (
        <div className="avatar-user ml-3 text-queens-navy font-semibold text-lg">
          You
        </div>
      )}
    </div>
  )
}
