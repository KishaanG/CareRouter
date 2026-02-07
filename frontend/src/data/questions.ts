import { Question } from '@/types'

// The 5 strategic questions for mental health assessment
export const questions: Question[] = [
  {
    id: 1,
    text: 'Over the past week, how often have you felt overwhelmed, anxious, or emotionally distressed?',
    type: 'single-choice',
  },
  {
    id: 2,
    text: 'How much is this affecting your ability to manage daily life (work, school, self-care)?',
    type: 'single-choice',
  },
  {
    id: 3,
    text: 'How soon do you feel you need support?',
    type: 'single-choice',
  },
  {
    id: 4,
    text: 'Are you feeling unsafe or worried you might harm yourself right now?',
    type: 'single-choice',
    note: 'If you are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right now.',
  },
  {
    id: 5,
    text: 'What challenges or barriers are making it hard for you to get support right now?',
    subtitle: 'Think about things like: cost, transportation, language, work schedule, childcare, insurance, not knowing where to start, past bad experiences, etc. Be as specific as you can - this helps us find resources that actually work for your situation.',
    type: 'single-choice',
  },
]
