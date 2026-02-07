'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { questions } from '@/data/questions'

interface ChatEntry {
  id: string
  type: 'bot' | 'user'
  message: string
  timestamp: Date
}

export default function AssessmentPage() {
  const router = useRouter()
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1) // Start at -1 to show welcome first
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [waitingForAnswer, setWaitingForAnswer] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  // Start conversation when component mounts
  useEffect(() => {
    // Prevent double initialization (React Strict Mode)
    if (hasStarted) return
    setHasStarted(true)

    const welcomeMessage: ChatEntry = {
      id: 'welcome',
      type: 'bot',
      message: "Hi! I'm here to help you find the right mental health support. 💙\n\nI'll ask you a few quick questions. Just answer in your own words - there are no wrong answers.\n\nReady? Let's begin.",
      timestamp: new Date(),
    }
    setChatHistory([welcomeMessage])

    // Show first question after brief delay
    setTimeout(() => {
      askQuestion(0)
    }, 2000)
  }, [])

  const askQuestion = (index: number) => {
    // This function should only be called for valid question indices
    if (index >= questions.length) {
      return
    }

    // Prevent asking the same question twice
    if (index === currentQuestionIndex && waitingForAnswer) {
      return
    }

    const question = questions[index]
    setCurrentQuestionIndex(index)
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      const timestamp = Date.now()
      const questionMessage: ChatEntry = {
        id: `question-${index}-${timestamp}`,
        type: 'bot',
        message: question.text,
        timestamp: new Date(),
      }

      setChatHistory(prev => [...prev, questionMessage])

      // Add subtitle if exists
      if (question.subtitle) {
        setTimeout(() => {
          const subtitleMessage: ChatEntry = {
            id: `subtitle-${index}-${timestamp}`,
            type: 'bot',
            message: question.subtitle || '',
            timestamp: new Date(),
          }
          setChatHistory(prev => [...prev, subtitleMessage])
        }, 400)
      }

      // Show note if exists
      if (question.note) {
        setTimeout(() => {
          const noteMessage: ChatEntry = {
            id: `note-${index}-${timestamp}`,
            type: 'bot',
            message: `⚠️ ${question.note}`,
            timestamp: new Date(),
          }
          setChatHistory(prev => [...prev, noteMessage])
        }, question.subtitle ? 800 : 400)
      }

      setWaitingForAnswer(true)
    }, 600)
  }

  const handleUserResponse = (response: string) => {
    if (!waitingForAnswer || isComplete) return

    // Add user's answer to chat
    const userMessage: ChatEntry = {
      id: `answer-${currentQuestionIndex}-${Date.now()}`,
      type: 'user',
      message: response,
      timestamp: new Date(),
    }

    setChatHistory(prev => [...prev, userMessage])
    setWaitingForAnswer(false)

    // Store the response as plain text
    const updatedResponses = { ...responses, [currentQuestionIndex]: response }
    setResponses(updatedResponses)

    // Move to next question immediately (no "thanks for sharing" - less robotic)
    const nextIndex = currentQuestionIndex + 1
    
    // Check if this was the last question
    if (nextIndex >= questions.length) {
      // Complete assessment with updated responses
      setTimeout(() => {
        completeAssessment(updatedResponses)
      }, 800)
    } else {
      setTimeout(() => {
        askQuestion(nextIndex)
      }, 800)
    }
  }

  const completeAssessment = async (finalResponses: Record<number, string>) => {
    setIsComplete(true)
    setIsTyping(true)
    
    // Format responses as JSON for backend
    const assessmentData = {
      responses: finalResponses,  // Use the passed responses to ensure all 5 are included
      completedAt: new Date().toISOString(),
      questionsAnswered: Object.keys(finalResponses).length,
      totalQuestions: questions.length
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
      
      setChatHistory(prev => [...prev, finalMessage])

      // TODO: Person 2 - Send to backend
      // Example:
      // const result = await fetch(`${API_URL}/api/route`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(assessmentData)
      // })
      // const pathway = await result.json()
      
      setTimeout(() => {
        router.push('/results')
      }, 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">CareRouter</h1>
          </div>
          <div className="text-sm text-gray-600">
            {currentQuestionIndex >= 0 && (
              <>Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}</>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {chatHistory.map((entry) => (
            <ChatMessage
              key={entry.id}
              message={entry.message}
              isBot={entry.type === 'bot'}
              timestamp={entry.timestamp}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleUserResponse}
            placeholder={isComplete ? "Assessment complete" : waitingForAnswer ? "Type your answer..." : "Please wait..."}
            disabled={!waitingForAnswer || isComplete}
          />
          <p className="text-xs text-gray-500 text-center mt-3">
            This tool does not diagnose or replace professional care. Crisis support: call 988
          </p>
        </div>
      </div>
    </div>
  )
}
