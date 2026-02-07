# CareRouter Frontend - Complete Structure Overview

## 📂 Full Directory Tree

```
frontend/
│
├── 📄 package.json                 # Dependencies and scripts
├── 📄 next.config.js               # Next.js configuration
├── 📄 tailwind.config.js           # Tailwind CSS styling config
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 postcss.config.js            # PostCSS for Tailwind
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 src/                         # Source code
│   │
│   ├── 📁 app/                     # Next.js App Router (all pages)
│   │   ├── 📄 layout.tsx           # Root layout (wraps all pages)
│   │   ├── 📄 globals.css          # Global styles + Tailwind
│   │   ├── 📄 page.tsx             # Home page (redirects to login)
│   │   │
│   │   ├── 📁 login/               # Login & Signup page
│   │   │   └── 📄 page.tsx         # Auth UI and logic
│   │   │
│   │   ├── 📁 assessment/          # Mental health check-in
│   │   │   └── 📄 page.tsx         # 5 questions with progress bar
│   │   │
│   │   ├── 📁 results/             # Support pathway results
│   │   │   └── 📄 page.tsx         # Tiered resource display
│   │   │
│   │   ├── 📁 booking/             # Appointment booking
│   │   │   └── 📄 page.tsx         # Book appointments
│   │   │
│   │   └── 📁 dashboard/           # User dashboard
│   │       └── 📄 page.tsx         # View bookings & pathway
│   │
│   ├── 📁 components/              # Reusable UI components
│   │   ├── 📄 ProgressBar.tsx      # Progress indicator
│   │   ├── 📄 QuestionCard.tsx     # Assessment question display
│   │   ├── 📄 ResourceCard.tsx     # Resource information card
│   │   └── 📄 PathwaySection.tsx   # Tiered pathway section
│   │
│   ├── 📁 data/                    # Static data
│   │   └── 📄 questions.ts         # The 5 assessment questions
│   │
│   ├── 📁 lib/                     # Utility functions
│   │   └── 📄 api.ts               # Backend API integration
│   │
│   └── 📁 types/                   # TypeScript type definitions
│       └── 📄 index.ts             # All app types
│
├── 📄 README.md                    # Technical documentation
├── 📄 QUICK_START.md               # Quick start guide (you are here)
├── 📄 TASK_DIVISION.md             # Task breakdown for Person 2 & 4
└── 📄 STRUCTURE_OVERVIEW.md        # This file

```

---

## 🔗 Page Flow Diagram

```
┌─────────────┐
│   page.tsx  │  (Auto-redirects)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    LOGIN    │  ← User enters email/password
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ ASSESSMENT  │  ← 5-question check-in (2-3 min)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   RESULTS   │  ← Personalized support pathway
└──────┬──────┘     (Right Now / This Week / Crisis)
       │
       ├───────────────┐
       │               │
       ↓               ↓
┌─────────────┐  ┌─────────────┐
│   BOOKING   │  │  DASHBOARD  │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ↓
         User can logout
         or take new assessment
```

---

## 🎨 Component Hierarchy

### Login Page
```
LoginPage
  └── Card
      ├── Form
      │   ├── Email Input
      │   ├── Password Input
      │   └── Submit Button
      └── Privacy Notice
```

### Assessment Page
```
AssessmentPage
  ├── ProgressBar
  │   └── Shows current question number
  ├── QuestionCard
  │   └── Question options (single/multi-choice)
  └── Navigation
      ├── Back Button
      └── Next Button
```

### Results Page
```
ResultsPage
  ├── PathwaySection (Right Now) 🟢
  │   └── ResourceCard × N
  ├── PathwaySection (This Week) 🟡
  │   └── ResourceCard × N
  ├── PathwaySection (Crisis) 🔴
  │   └── ResourceCard × N
  └── Actions
      ├── Book Appointment
      └── Save/Print Pathway
```

### Booking Page
```
BookingPage
  └── Booking Form
      ├── Resource Selector
      ├── Date Picker
      ├── Time Selector
      ├── Notes Textarea
      └── Submit Button
```

### Dashboard Page
```
DashboardPage
  ├── Header
  │   └── Logout Button
  ├── Quick Actions
  │   ├── Take New Assessment
  │   ├── View Pathway
  │   └── Book Appointment
  ├── Upcoming Appointments
  └── Saved Pathways
```

---

## 🔌 API Integration Points

### Authentication (`src/lib/api.ts`)
```typescript
authAPI.login(email, password)
  → POST /auth/login
  → Returns: { token, user }

authAPI.signup(email, password)
  → POST /auth/signup
  → Returns: { token, user }
```

### Assessment (`src/lib/api.ts`)
```typescript
assessmentAPI.submitAssessment(answers)
  → POST /api/route
  → Sends: { answers: { 0: "2", 1: "3", ... } }
  → Returns: { severity, urgency, pathway }
```

### Resources (`src/lib/api.ts`)
```typescript
resourcesAPI.getResources({ lat, lon, filters })
  → GET /api/resources?lat=...&lon=...&filters=...
  → Returns: [ { id, name, type, cost, distance, ... } ]
```

### Bookings (`src/lib/api.ts`)
```typescript
bookingAPI.createBooking({ resourceId, date, time, notes })
  → POST /api/bookings
  → Returns: { id, status, confirmation }

bookingAPI.getBookings()
  → GET /api/bookings
  → Returns: [ { id, resourceName, date, time, status } ]
```

---

## 🎯 Data Flow Example: Complete Assessment

```
1. User on Assessment Page
   │
   ├─ Answers Question 1: "Most days" (value: "2")
   ├─ Answers Question 2: "A lot" (value: "2")
   ├─ Answers Question 3: "As soon as possible" (value: "2")
   ├─ Answers Question 4: "No" (value: "0")
   └─ Answers Question 5: ["cost", "transport"]
   │
   ↓
2. User clicks "Get Support Pathway"
   │
   ↓
3. Frontend calls submitAssessment()
   │
   ├─ Formats: { answers: { 0: "2", 1: "2", 2: "2", 3: "0", 4: ["cost", "transport"] } }
   └─ Sends to: POST /api/route
   │
   ↓
4. Backend processes
   │
   ├─ Calculates severity: "moderate"
   ├─ Calculates urgency: "soon"
   └─ Filters resources by: free/low-cost, nearby
   │
   ↓
5. Backend returns pathway JSON
   │
   {
     "severity": "moderate",
     "urgency": "soon",
     "rightNow": [
       { id: 1, name: "Crisis Text Line", cost: "Free", ... },
       { id: 2, name: "Drop-In Center", cost: "Free", distance: "1.2 km", ... }
     ],
     "thisWeek": [
       { id: 3, name: "Sliding Scale Therapy", cost: "$20-60", ... }
     ],
     "crisis": [
       { id: 4, name: "988 Lifeline", ... }
     ]
   }
   │
   ↓
6. Frontend receives data
   │
   └─ Navigates to Results Page
   │
   ↓
7. Results Page displays
   │
   ├─ 🟢 RIGHT NOW: 2 resources
   ├─ 🟡 THIS WEEK: 1 resource
   └─ 🔴 IF THINGS WORSEN: 1 resource
   │
   ↓
8. User clicks "Book Appointment"
   │
   └─ Navigates to Booking Page (with resource pre-selected)
```

---

## 🎨 Styling System

### Tailwind Utility Classes (Custom)
Defined in `src/app/globals.css`:

```css
.btn-primary
  → Blue button (primary actions)

.btn-secondary
  → White button with border (secondary actions)

.card
  → White rounded card with shadow

.input-field
  → Standard form input styling
```

### Color Palette
Defined in `tailwind.config.js`:

```
Primary (Blues):
  - primary-50  → #f0f9ff (lightest)
  - primary-600 → #0284c7 (main)
  - primary-700 → #0369a1 (hover)

Pathway Colors:
  - green-500  → Right Now (accessible today)
  - yellow-500 → This Week (soon)
  - red-500    → Crisis (safety net)
```

---

## 📊 State Management

### Current Approach (Simple)
- **Auth**: localStorage (`auth_token`)
- **Assessment answers**: Component state → Sent to backend
- **Pathway results**: API response → Component state
- **Bookings**: Fetched from backend on dashboard load

### Future Improvements (Optional)
- Add React Context for global state
- Use Zustand or Redux for complex state
- Add React Query for API caching

---

## 🔒 Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Token sent in Authorization header: `Bearer <token>`
- Protected routes check for token presence

### Data Privacy
- No data stored locally except auth token
- All sensitive data on backend
- Clear privacy notices throughout app

### Production Checklist
- [ ] Move `.env.local` to `.env.production`
- [ ] Use HTTPS for API calls
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting on backend
- [ ] Sanitize all user inputs

---

## 🧪 Testing Strategy

### Manual Testing Flow
1. **Auth**: Login → Logout → Signup → Login
2. **Assessment**: Complete all questions → Skip questions
3. **Results**: View pathway → Different severity levels
4. **Booking**: Book appointment → View in dashboard
5. **Edge Cases**: API errors → Slow network → Invalid data

### Browser Testing
- [ ] Chrome (most users)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Mobile browsers

---

## 📈 Performance Tips

### What's Already Optimized
✅ Next.js automatic code splitting
✅ Server-side rendering for faster initial load
✅ Tailwind CSS purges unused styles

### What You Can Add
- Image optimization (use Next.js `<Image>`)
- Lazy load components below the fold
- Add loading skeletons for better perceived performance
- Cache API responses (React Query)

---

## 🚀 Deployment Checklist

### Before Deploying
- [ ] Run `npm run build` (check for errors)
- [ ] Test production build locally: `npm start`
- [ ] Update `.env.production` with production API URL
- [ ] Check all images/assets load correctly
- [ ] Test on mobile device

### Deployment Platforms (Recommended)
- **Vercel** (easiest for Next.js)
- **Netlify**
- **AWS Amplify**

### Environment Variables on Hosting
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 📚 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Cheatsheet](https://nerdcave.com/tailwind-cheat-sheet)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🎉 Quick Wins for Demo

### Visual Polish (30 min)
- [ ] Add smooth transitions (already in CSS)
- [ ] Test on mobile (ensure readable)
- [ ] Check for typos in copy
- [ ] Verify all colors are consistent

### Functionality Must-Haves
- [ ] Login works
- [ ] Assessment completes
- [ ] Results show personalized pathway
- [ ] Booking creates appointment
- [ ] No console errors

### Presentation Tips
- Practice demo 3+ times
- Have backup screenshots if live demo fails
- Start with the "why" (problem statement)
- End with "what's next" (future features)

---

## 🆘 Common Issues & Solutions

### "Cannot find module" error
```bash
npm install
# If that doesn't work:
rm -rf node_modules package-lock.json
npm install
```

### Tailwind styles not applying
```bash
# Restart dev server
# Check tailwind.config.js paths are correct
```

### API calls failing
```bash
# Check backend is running
# Verify CORS is enabled on backend
# Check .env.local has correct URL
```

### TypeScript errors
```bash
# Check src/types/index.ts
# Make sure imports are correct
# TypeScript errors won't prevent app from running
```

---

## ✅ Final Checklist Before Demo

### Functionality
- [ ] All pages load without errors
- [ ] Can complete full user flow
- [ ] Data persists correctly
- [ ] Mobile responsive

### Design
- [ ] Copy is clear and compassionate
- [ ] Colors are consistent
- [ ] Buttons and inputs are easy to use
- [ ] Loading states are present

### Demo
- [ ] Demo script prepared
- [ ] Test data is realistic
- [ ] Backup plan ready
- [ ] Can complete demo in 3-5 minutes

---

**You're all set!** 🎊

Refer back to this document anytime you need to understand the project structure.

For detailed tasks: See `TASK_DIVISION.md`  
For quick start: See `QUICK_START.md`  
For technical details: See `README.md`
