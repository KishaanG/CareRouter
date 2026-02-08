'use client'

import React, { useState, useEffect } from 'react'
import { Bot, Volume2, VolumeX } from 'lucide-react'

interface ChatMessageProps {
  message: string
  isBot: boolean
  timestamp?: Date
}

export default function ChatMessage({ message, isBot, timestamp }: ChatMessageProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Log info on mount
  useEffect(() => {
    const hasElevenLabsKey = !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    if (hasElevenLabsKey) {
      console.log('🎙️ ElevenLabs TTS enabled! Voice: Domi (strong, confident)')
      console.log('💡 To see all available voices, run: listElevenLabsVoices()')
    } else {
      console.log('🔊 Using browser TTS (ElevenLabs key not found)')
    }
  }, [])

  if (!message) return null

  const handleSpeak = async () => {
    const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

    // If already speaking, stop it
    if (isSpeaking) {
      setIsSpeaking(false)
      // Stop any playing audio
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach(audio => audio.pause())
      return
    }

    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found, falling back to browser TTS')
      // Fallback to browser TTS
      if (!window.speechSynthesis) {
        alert('Text-to-speech is not supported.')
        return
      }
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      return
    }

    try {
      setIsSpeaking(true)

      // Voice IDs: 
      // Rachel (calm, friendly female): 21m00Tcm4TlvDq8ikWAM
      // Domi (confident female): AZnzlk1XvdvUeBnXmlld
      // Bella (soft, warm female): EXAVITQu4vr4xnSDxMaL
      // Grace (calm, professional): oWAxZDx7w5VEj9dCyTzz
      const VOICE_ID = 'AZnzlk1XvdvUeBnXmlld' // Domi - strong, confident

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          model_id: 'eleven_turbo_v2_5', // Fastest model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      setIsSpeaking(false)
      alert('Failed to play audio. Check console for details.')
    }
  }
  
  return (
    <div className={`flex items-start mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="avatar-ai mr-3 text-white">
          <Bot size={20} />
        </div>
      )}
      
      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} max-w-[75%]`}>
        <div className={`message-bubble relative group ${isBot ? 'bot-message' : 'user-message'}`}>
          <p className="text-base whitespace-pre-wrap leading-relaxed text-text-primary">
            {message}
          </p>
          
          {/* Text-to-Speech button (only for bot messages) */}
          {isBot && (
            <button
              onClick={handleSpeak}
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
                isSpeaking
                  ? 'bg-queens-gold text-queens-navy shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-queens-gold hover:text-queens-navy'
              }`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
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
