'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock, Phone, MapPin, CheckCircle } from 'lucide-react'
import { AssessmentResponse } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [pathwayData, setPathwayData] = useState<AssessmentResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get pathway data from localStorage (saved by assessment page)
    const savedPathway = localStorage.getItem('pathway')
    
    if (savedPathway) {
      try {
        const data = JSON.parse(savedPathway) as AssessmentResponse
        setPathwayData(data)
        console.log('📋 Loaded pathway from storage:', data)
      } catch (error) {
        console.error('Error parsing pathway data:', error)
        router.push('/assessment')
      }
    } else {
      // No pathway data, redirect to assessment
      console.log('⚠️ No pathway data found, redirecting to assessment')
      router.push('/assessment')
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <>
        <div className="app-background" />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-queens-navy border-t-transparent mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your support pathway...</p>
          </div>
        </div>
      </>
    )
  }

  if (!pathwayData) {
    return null // Will redirect
  }

  const { scores, recommended_pathway } = pathwayData

  // Determine severity badge color
  const getSeverityColor = (score: number) => {
    if (score === 1) return 'bg-green-100 text-green-800'
    if (score === 2) return 'bg-yellow-100 text-yellow-800'
    if (score === 3) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'routine') return 'bg-blue-100 text-blue-800'
    if (urgency === 'soon') return 'bg-yellow-100 text-yellow-800'
    if (urgency === 'urgent') return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <>
      <div className="app-background" />
      <div className="min-h-screen py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/CareRouterLogo.png" alt="CareRouter Logo" className="h-20 w-auto mx-auto mb-4" />
            <h1 className="text-4xl font-heading font-bold text-queens-navy mb-3">
              Your Personalized Support Pathway
            </h1>
            <p className="text-text-secondary text-lg">
              Based on your responses, here's what we recommend
            </p>
          </div>

          {/* Personalized Note */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Message for You
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  {scores.personalized_note}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Scores Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Issue Type</p>
                <p className="font-medium text-text-primary capitalize">
                  {scores.issue_type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Urgency Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(scores.urgency)}`}>
                  {scores.urgency.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Severity Score</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(scores.severity_score)}`}>
                  {scores.severity_score}/4
                </span>
              </div>
            </div>
            
            {scores.needs_immediate_resources && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Immediate Support Recommended
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please consider reaching out to crisis resources right away.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Resources */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Recommended Resources ({recommended_pathway.length})
            </h2>
            
            {recommended_pathway.length === 0 ? (
              <p className="text-text-secondary">No specific resources were recommended at this time.</p>
            ) : (
              <div className="space-y-4">
                {recommended_pathway.map((resource, index) => {
                  // Backend sends contact info in 'data' field
                  const contactInfo = resource.data || resource.contact
                  const isPhone = contactInfo && /^[\d\-\(\)\s]+$/.test(contactInfo.replace(/[^\d\-\(\)\s]/g, ''))
                  const isWebsite = contactInfo && (contactInfo.startsWith('http') || contactInfo.includes('.ca') || contactInfo.includes('.com'))
                  const isAddress = contactInfo && !isPhone && !isWebsite
                  
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-5 hover:border-queens-gold transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary text-lg mb-1">
                            {resource.name}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-queens-navy/10 text-queens-navy text-sm rounded-full">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-text-secondary mb-3 leading-relaxed">
                        {resource.description}
                      </p>
                      
                      {/* Contact Information */}
                      {contactInfo && (
                        <div className="space-y-2 text-sm">
                          {isPhone && (
                            <div className="flex items-center gap-2 text-queens-navy font-medium">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${contactInfo.replace(/\D/g, '')}`} className="hover:underline">
                                {contactInfo}
                              </a>
                            </div>
                          )}
                          
                          {isWebsite && (
                            <div className="flex items-center gap-2 text-queens-navy font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              <a 
                                href={contactInfo.startsWith('http') ? contactInfo : `https://${contactInfo}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {contactInfo}
                              </a>
                            </div>
                          )}
                          
                          {isAddress && (
                            <div className="flex items-start gap-2 text-text-secondary">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{contactInfo}</span>
                            </div>
                          )}
                          
                          {/* Additional fields if present */}
                          {resource.availability && (
                            <div className="flex items-center gap-2 text-text-secondary">
                              <Clock className="w-4 h-4" />
                              <span>{resource.availability}</span>
                            </div>
                          )}
                          
                          {resource.rating && (
                            <div className="flex items-center gap-2 text-text-secondary">
                              <span className="text-queens-gold">★</span>
                              <span>{resource.rating}/5</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => router.push('/assessment')}
              className="flex-1 bg-queens-navy hover:bg-opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start New Assessment
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white hover:bg-gray-50 text-queens-navy font-medium py-3 px-6 rounded-xl border border-gray-300 transition-all duration-200"
            >
              Print Pathway
            </button>
          </div>

          {/* Reasoning (for transparency) */}
          <details className="bg-white rounded-2xl p-6 shadow-md">
            <summary className="cursor-pointer font-semibold text-text-primary hover:text-queens-navy">
              Why these recommendations? (Click to expand)
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-text-secondary text-sm leading-relaxed">
                {scores.reasoning}
              </p>
              <p className="text-xs text-text-secondary mt-3">
                Confidence: {(scores.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </details>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> This tool provides suggestions based on your responses and does not replace professional medical advice, diagnosis, or treatment. If you're in crisis, please call 988 (Suicide & Crisis Lifeline) or 911 immediately.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
