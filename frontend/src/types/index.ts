export interface Question {
  id: number
  text: string
  subtitle?: string
  type: 'single-choice' | 'multi-choice'
  options?: QuestionOption[]
  note?: string
}

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface Resource {
  id: number
  name: string
  type: string
  description: string
  availability: string
  cost: string
  distance: string
  waitTime?: string
  whyRecommended?: string
}

// Backend response format
export interface AssessmentResponse {
  scores: {
    severity_tier: string      // "Low", "Moderate", "High"
    urgency: string            // "Routine", "Soon", "Immediate"
    support_type: string       // "Peer", "Professional", "Crisis"
    accessibility: string[]    // ["Low Cost", "Online", "English"]
    reasoning: string          // Summary of why it scored this way
  }
  recommended_pathway: Array<{
    name: string
    type: string
    desc: string
    [key: string]: any
  }>
  personalized_note: string
  Locations: Array<{
    [key: string]: any
  }>
}

// Frontend request format (what we send to backend)
export interface AssessmentSubmission {
  primary_concern: string
  answer_distress: string
  answer_functioning: string
  answer_urgency: string
  answer_safety: string
  answer_constraints: string
  location: {
    latitude: number
    longitude: number
  } | null
}

export interface Pathway {
  severity: 'low' | 'moderate' | 'high'
  urgency: 'routine' | 'soon' | 'immediate'
  rightNow: Resource[]
  thisWeek: Resource[]
  crisis: Resource[]
}

export interface Assessment {
  answers: Record<number, any>
  completedAt: string
  questionsAnswered: number
  totalQuestions: number
}

export interface Booking {
  id: string
  resourceId: string
  resourceName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
}

// Chat-specific types
export interface ChatMessage {
  id: string
  type: 'bot' | 'user' | 'options'
  message?: string
  timestamp: Date
  options?: QuestionOption[]
  questionIndex?: number
}
