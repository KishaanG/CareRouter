import React, { useState, useRef } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ onSend, placeholder = 'Type your answer...', disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Try to use MP3 or WAV format if supported
      const options = { mimeType: 'audio/webm' }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        console.log('Audio blob created:', blob.size, 'bytes, type:', blob.type)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        transcribeAudio(blob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    
    try {
      console.log('🎤 Preparing to send audio:', {
        size: audioBlob.size,
        type: audioBlob.type
      })
      
      // ElevenLabs expects field name 'file' and requires model_id
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('model_id', 'scribe_v2') // Use the latest scribe model
      
      console.log('📤 Sending to ElevenLabs with model: scribe_v2')
      
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', response.status, errorText)
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ ElevenLabs response:', data)
      
      // Extract text from response (matches the JSON structure you provided)
      const text = data.text || ''
      
      if (text) {
        console.log('📝 Transcribed text:', text)
        setInput(text) // Put transcribed text in input box
      } else {
        console.warn('No text found in response:', data)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  
  return (
    <div className="flex items-center gap-3">
      {/* Microphone Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : isTranscribing
            ? 'bg-gray-400 text-white cursor-wait'
            : 'bg-queens-gold hover:bg-opacity-90 text-queens-navy'
        } shadow-md focus:outline-none focus:ring-2 focus:ring-queens-gold focus:ring-offset-2`}
        disabled={disabled || isTranscribing}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Click to stop' : isTranscribing ? 'Transcribing...' : 'Click to speak'}
      >
        {isTranscribing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isRecording ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {/* Text Input */}
      <input
        type="text"
        className="input-chat-modern flex-1"
        placeholder={isTranscribing ? 'Transcribing...' : placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || isTranscribing}
        aria-label="Type your message"
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="send-button-circular"
        disabled={!input.trim() || disabled || isTranscribing}
        aria-label="Send message"
      >
        <Send size={24} className="text-white" />
      </button>
    </div>
  )
}
