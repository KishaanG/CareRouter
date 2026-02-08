import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ onSend, placeholder = 'Type your answer...', disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  
  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        className="input-chat-modern flex-1"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        aria-label="Type your message"
      />
      <button
        onClick={handleSend}
        className="send-button-circular"
        disabled={!input.trim() || disabled}
        aria-label="Send message"
      >
        <Send size={24} className="text-white" />
      </button>
    </div>
  )
}
