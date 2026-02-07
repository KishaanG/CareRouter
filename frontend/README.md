# CareRouter Frontend

Next.js frontend for CareRouter mental health support platform.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the frontend folder:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx          # Home (redirects to login)
│   │   ├── login/            # Login/Signup page
│   │   ├── assessment/       # Mental health check-in
│   │   ├── results/          # Support pathway results
│   │   ├── booking/          # Appointment booking
│   │   └── dashboard/        # User dashboard
│   ├── components/           # Reusable UI components
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ResourceCard.tsx
│   │   └── PathwaySection.tsx
│   ├── data/                 # Static data (questions)
│   │   └── questions.ts
│   ├── lib/                  # Utilities
│   │   └── api.ts           # API integration functions
│   └── types/               # TypeScript types
│       └── index.ts
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## Pages Overview

### `/login` - Authentication
- Login and signup forms
- Redirects to assessment after authentication
- Clean, accessible UI with privacy notice

### `/assessment` - Mental Health Check-in
- 5-question assessment flow
- Progress tracking
- Answers stored for routing logic

### `/results` - Support Pathway
- Tiered resource display (Right Now / This Week / Crisis)
- Personalized explanations for each recommendation
- Actions: Book appointments, save/print pathway

### `/booking` - Appointment Booking
- Select resource, date, and time
- Additional notes field
- Confirmation flow

### `/dashboard` - User Dashboard
- View upcoming appointments
- Access saved pathways
- Quick actions for re-assessment

## Components

### `ProgressBar`
Progress indicator for assessment flow

### `QuestionCard`
Displays assessment questions with single/multi-choice options

### `ResourceCard`
Displays resource information with details and booking options

### `PathwaySection`
Groups resources by urgency tier (green/yellow/red)

## API Integration

All API calls are in `src/lib/api.ts`. Update these functions to connect to your FastAPI backend:

- `authAPI.login()` - User login
- `authAPI.signup()` - User registration
- `assessmentAPI.submitAssessment()` - Submit check-in answers
- `resourcesAPI.getResources()` - Fetch nearby resources
- `bookingAPI.createBooking()` - Create appointment booking
- `bookingAPI.getBookings()` - Get user bookings

## Styling

- **Tailwind CSS** for styling
- Custom utility classes in `globals.css`
- Color scheme: Blue primary, with green/yellow/red for pathway tiers
- Responsive design for mobile/desktop

## TODO Markers

Search for `TODO: Person 2` comments in the code for backend integration points.

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios (API calls)
- Lucide React (icons)
