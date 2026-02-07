import { Question } from '@/types'

// Questions in the exact order specified
export const questions: Question[] = [
  {
    id: 0,
    text: "What's the main reason you're here today?",
    subtitle: "Share whatever feels most important to you right now.",
    type: 'single-choice',
  },
  {
    id: 1,
    text: 'Over the past week, how intense has your emotional distress been?',
    subtitle: "Describe how you've been feeling in your own words.",
    type: 'single-choice',
  },
  {
    id: 2,
    text: 'How much is this affecting your ability to function day-to-day?',
    subtitle: 'Share how this is impacting your daily activities.',
    type: 'single-choice',
  },
  {
    id: 3,
    text: 'How soon do you feel you need support?',
    subtitle: 'Be honest about your timeline - this helps us prioritize resources.',
    type: 'single-choice',
  },
  {
    id: 4,
    text: 'Which statement best describes your safety right now?',
    subtitle: 'Your safety is our priority. Please be honest.',
    type: 'single-choice',
    note: 'If you are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right now.',
  },
  {
    id: 5,
    text: 'What could make it hard for you to get help?',
    subtitle: 'Think about things like: cost, transportation, language, work schedule, childcare, insurance, not knowing where to start, etc.',
    type: 'single-choice',
  },
]
