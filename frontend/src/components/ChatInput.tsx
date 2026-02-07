'use client'

import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ onSend, placeholder = 'Type your answer...', disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoFocus
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}
