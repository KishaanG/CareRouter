import React from 'react'
import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start mb-6">
      <div className="avatar-ai mr-3 text-white">
        <Bot size={20} />
      </div>
      <div className="message-bubble">
        <div className="typing-indicator">
          <div className="typing-dot-wave"></div>
          <div className="typing-dot-wave"></div>
          <div className="typing-dot-wave"></div>
        </div>
      </div>
    </div>
  )
}
