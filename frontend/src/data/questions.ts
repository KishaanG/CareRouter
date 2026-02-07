import { Question } from '@/types'

export const questions: Question[] = [
  {
    id: 1,
    text: 'Over the past week, how often have you felt overwhelmed, anxious, or emotionally distressed?',
    subtitle: 'This helps us understand your baseline distress level.',
    type: 'single-choice',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'A few days' },
      { value: '2', label: 'Most days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  {
    id: 2,
    text: 'How much is this affecting your ability to manage daily life (work, school, self-care)?',
    subtitle: 'Daily functioning is an important indicator of support needs.',
    type: 'single-choice',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'A little' },
      { value: '2', label: 'A lot' },
      { value: '3', label: "I'm really struggling to function" },
    ],
  },
  {
    id: 3,
    text: 'How soon do you feel you need support?',
    subtitle: 'This helps us prioritize resources based on urgency.',
    type: 'single-choice',
    options: [
      { value: '0', label: 'Not urgent' },
      { value: '1', label: 'Soon (within a week or two)' },
      { value: '2', label: 'As soon as possible' },
    ],
  },
  {
    id: 4,
    text: 'Are you feeling unsafe or worried you might harm yourself right now?',
    subtitle: 'Your safety is our priority. This helps us provide appropriate resources.',
    type: 'single-choice',
    options: [
      { value: '0', label: 'No' },
      { value: '1', label: "I'm not sure" },
      { value: '2', label: 'Yes' },
    ],
    note: 'If you are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right now.',
  },
  {
    id: 5,
    text: 'Which of the following would make it hard to get support right now?',
    subtitle: 'Select all that apply. This helps us recommend accessible options.',
    type: 'multi-choice',
    options: [
      { value: 'cost', label: 'Cost / affordability' },
      { value: 'language', label: 'Language or cultural fit' },
      { value: 'transport', label: 'Transportation or distance' },
      { value: 'time', label: 'Time (work, school, caregiving)' },
      { value: 'none', label: 'None of these' },
    ],
    note: 'You can skip any question if you prefer not to answer.',
  },
]
