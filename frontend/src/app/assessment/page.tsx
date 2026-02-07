'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProgressBar from '@/components/ProgressBar'
import QuestionCard from '@/components/QuestionCard'
import { questions } from '@/data/questions'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [currentQuestion]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Assessment complete - submit to backend
      submitAssessment()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = async () => {
    // TODO: Person 2 - Submit to backend
    // POST /api/route with answers
    
    try {
      console.log('Submitting assessment:', answers)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to results with pathway data
      router.push('/results')
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Failed to process assessment. Please try again.')
    }
  }

  const currentQuestionData = questions[currentQuestion]
  const hasAnswer = answers[currentQuestion] !== undefined

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Check-in</h1>
          <p className="text-gray-600">
            This should take about 2-3 minutes. You can skip any question.
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} current={currentQuestion + 1} total={questions.length} />

        {/* Question Card */}
        <QuestionCard
          question={currentQuestionData}
          answer={answers[currentQuestion]}
          onAnswer={handleAnswer}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {currentQuestion === questions.length - 1 ? 'Get Support Pathway' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Notice */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This tool does not diagnose or replace professional care.
            If you're in crisis, please call 988 immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
