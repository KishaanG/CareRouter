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

// Backend response format - Matches backend/schemas.py FinalPlan
export interface AssessmentResponse {
  scores: {
    issue_type: string                  // "mental_health", "gambling", "alcohol", etc.
    urgency: string                     // "routine", "soon", "urgent", "immediate_crisis"
    severity_score: number              // 1-4
    needs_immediate_resources: boolean  // true if crisis
    confidence: number                  // 0-1 (e.g., 0.85)
    reasoning: string                   // Why these scores were given
    personalized_note: string           // Friendly message to user
  }
  recommended_pathway: Array<{
    name: string
    type: string
    contact?: string
    availability?: string
    description: string
    latitude?: number
    longitude?: number
    [key: string]: any
  }>
}

// Stored in localStorage after assessment (pathway + user location for map)
export interface StoredPathway extends AssessmentResponse {
  userLocation?: { lat: number; lng: number } | null
  exercises?: Array<{
    title: string
    steps: string[]
    benefit: string
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
  latitude: number | null
  longitude: number | null
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
