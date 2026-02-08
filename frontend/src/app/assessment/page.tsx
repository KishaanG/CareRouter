'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import { questions } from '@/data/questions'
import { AssessmentSubmission, AssessmentResponse } from '@/types'
import { API_URL } from '@/lib/api'
import '@/lib/elevenlabs-voices' // Load voice listing utility
interface ChatEntry {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
}

export default function AssessmentPage() {
  const router = useRouter()
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [waitingForAnswer, setWaitingForAnswer] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const hasLocationRequestedRef = useRef(false)
  const hasStartedRef = useRef(false)
  
  // Auto-start the assessment when component mounts
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      // Start asking questions after a short delay
      setTimeout(() => {
        askNextQuestion(0)
      }, 500)
    }
  }, [])
  
  // Request location on mount
  useEffect(() => {
    if (!hasLocationRequestedRef.current) {
      hasLocationRequestedRef.current = true
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
            console.log('✅ Location accessed:', position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.log('ℹ️ Location permission denied or unavailable - continuing without location')
            // This is fine - location is optional
            setLocation(null)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      } else {
        console.log('ℹ️ Geolocation not supported by browser')
      }
    }
  }, [])
  
  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])
  
  const askNextQuestion = (questionIndex: number) => {
    if (questionIndex >= questions.length) {
      return
    }
    
    setCurrentQuestionIndex(questionIndex)
    setIsTyping(true)
    setWaitingForAnswer(false)
    
    setTimeout(() => {
      setIsTyping(false)
      const question = questions[questionIndex]
      const questionText = question.subtitle 
        ? `${question.text}\n\n${question.subtitle}`
        : question.text
      
      const questionMessage: ChatEntry = {
        id: `question-${questionIndex}-${Date.now()}`,
        type: 'bot',
        message: questionText,
        timestamp: new Date(),
      }
      
      setChatHistory((prev) => [...prev, questionMessage])
      setWaitingForAnswer(true)
    }, 1000)
  }
  
  const handleUserResponse = (answer: string) => {
    if (!waitingForAnswer || isComplete) return
    
    setWaitingForAnswer(false)
    
    const userMessage: ChatEntry = {
      id: `user-${currentQuestionIndex}-${Date.now()}`,
      type: 'user',
      message: answer,
      timestamp: new Date(),
    }
    
    setChatHistory((prev) => [...prev, userMessage])
    
    const updatedResponses = {
      ...responses,
      [currentQuestionIndex]: answer,
    }
    setResponses(updatedResponses)
    
    const nextQuestionIndex = currentQuestionIndex + 1
    
    if (nextQuestionIndex >= questions.length) {
      completeAssessment(updatedResponses)
    } else {
      setTimeout(() => {
        askNextQuestion(nextQuestionIndex)
      }, 800)
    }
  }
  
  const completeAssessment = async (finalResponses: Record<number, string>) => {
    setIsComplete(true)
    setIsTyping(true)
    
    const assessmentData: AssessmentSubmission = {
      primary_concern: finalResponses[0] || '',
      answer_distress: finalResponses[1] || '',
      answer_functioning: finalResponses[2] || '',
      answer_urgency: finalResponses[3] || '',
      answer_safety: finalResponses[4] || '',
      answer_constraints: finalResponses[5] || '',
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
    }
    
    console.log('=== Assessment Data (JSON for Backend) ===')
    console.log(JSON.stringify(assessmentData, null, 2))
    console.log('==========================================')
    
    setTimeout(async () => {
      setIsTyping(false)
      
      const finalMessage: ChatEntry = {
        id: `complete-${Date.now()}`,
        type: 'bot',
        message: "Thank you! 🙏\n\nI'm creating your personalized support pathway now...",
        timestamp: new Date(),
      }
      
      setChatHistory((prev) => [...prev, finalMessage])
      
      try {
        console.log('📤 Sending to backend:', `${API_URL}/api/generate-plan`)
        
        // Get JWT token if user is logged in
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
          console.log('🔐 Sending with authentication token')
        }
        
        const result = await fetch(`${API_URL}/api/generate-plan`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(assessmentData),
        })
        
        if (!result.ok) {
          const errorText = await result.text()
          console.error('❌ Backend error:', result.status, errorText)
          throw new Error(`HTTP error! status: ${result.status}`)
        }
        
        const pathwayData: AssessmentResponse = await result.json()
        console.log('✅ Pathway received from backend:', pathwayData)
        localStorage.setItem('pathway', JSON.stringify(pathwayData))
      } catch (error) {
        console.error('❌ Error submitting assessment:', error)
        // Show user-friendly error message
        const errorMessage: ChatEntry = {
          id: `error-${Date.now()}`,
          type: 'bot',
          message: "I'm having trouble connecting to the server. Please make sure the backend is running at http://localhost:8000",
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, errorMessage])
      }
      
      setTimeout(() => {
        router.push('/results')
      }, 2000)
    }, 1000)
  }
  
  return (
    <>
      <div className="app-background" />
      <div className="chat-view min-h-screen flex flex-col">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-3xl mx-auto">
            {/* Header with Welcome Text - No box, just text */}
            <div className="text-center py-8 mb-6">
              <img src="/CareRouterLogo.png" alt="CareRouter Logo" className="h-20 w-auto mx-auto mb-4" />
              <h1 className="welcome-text text-queens-navy mb-2">
                Hi there, how can I help you today?
              </h1>
              {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
                <div className="text-sm text-text-secondary font-medium mt-3">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              )}
            </div>
            
            {/* Chat Messages */}
            {chatHistory.map((entry) => (
              <ChatMessage
                key={entry.id}
                message={entry.message}
                isBot={entry.type === 'bot'}
                timestamp={entry.timestamp}
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={chatEndRef} />
          </div>
        </div>
        
        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-20">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleUserResponse}
              placeholder={isComplete ? 'Assessment complete' : waitingForAnswer ? "Tell me what's on your mind..." : 'Please wait...'}
              disabled={!waitingForAnswer || isComplete}
            />
            <p className="text-xs text-text-secondary text-center mt-4">
              This tool does not diagnose or replace professional care. Crisis support: call 988
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
