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
