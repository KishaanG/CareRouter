# CareRouter Frontend - Task Division

## Team Structure
- **Person 2**: Frontend Developer (Backend Integration & Functionality)
- **Person 4**: Product/UX (Copy, Design Polish, User Flow)

---

## PERSON 2: Frontend Developer (Backend Integration)

### Your Focus
Core functionality, API integration, data flow, state management

### Tasks

#### ✅ Phase 1: Setup & Backend Connection (Hours 1-4)

**1.1 Initial Setup** ⏱️ 30 min
- [ ] Run `npm install` in frontend folder
- [ ] Create `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Run `npm run dev` and verify app loads at localhost:3000
- [ ] Test navigation: home → login page (should auto-redirect)

**1.2 Backend API Coordination** ⏱️ 1 hour
- [ ] Get backend endpoint schemas from Person 1
- [ ] Update `src/lib/api.ts` with actual endpoint URLs
- [ ] Test `/health` endpoint if available
- [ ] Set up CORS handling (coordinate with backend)

**1.3 Authentication Integration** ⏱️ 2 hours
- [ ] Implement real login in `src/app/login/page.tsx`
  - Replace simulated auth with actual API call
  - Handle JWT/token storage properly
  - Add error handling for failed login/signup
- [ ] Add token validation on page load
- [ ] Implement protected route logic (redirect to login if no token)
- [ ] Test: Login → Assessment flow

**1.4 Auth State Management** ⏱️ 30 min
- [ ] Create auth context/hook (optional but recommended)
- [ ] Add logout functionality across all pages
- [ ] Handle token expiration

---

#### ✅ Phase 2: Assessment & Routing Logic (Hours 5-8)

**2.1 Assessment Submission** ⏱️ 2 hours
- [ ] In `src/app/assessment/page.tsx`:
  - Connect `submitAssessment()` to real backend endpoint
  - Format answers according to backend schema
  - Handle loading/error states
  - Store assessment ID for results retrieval
- [ ] Test with backend: Submit answers → Get pathway response

**2.2 Results Page Integration** ⏱️ 2 hours
- [ ] In `src/app/results/page.tsx`:
  - Replace mock pathway data with real API response
  - Parse backend JSON into component format
  - Handle different severity levels
  - Add error handling if no pathway found
- [ ] Test: Complete assessment → View personalized pathway

**2.3 Location & Filters** ⏱️ 1 hour
- [ ] Add geolocation prompt (optional for MVP)
- [ ] Pass location to assessment API
- [ ] Add manual location input fallback
- [ ] Test: Location affects resource recommendations

---

#### ✅ Phase 3: Booking System (Hours 9-12)

**3.1 Booking Flow** ⏱️ 2 hours
- [ ] In `src/app/booking/page.tsx`:
  - Fetch available resources from backend
  - Implement real booking submission
  - Add validation (date/time/resource selection)
  - Show confirmation on success
- [ ] Test: Book appointment → Confirmation → Dashboard update

**3.2 Dashboard Functionality** ⏱️ 2 hours
- [ ] In `src/app/dashboard/page.tsx`:
  - Fetch user's bookings from backend
  - Display upcoming appointments
  - Show saved pathway history
  - Add "Take assessment again" flow
- [ ] Test: Dashboard loads user data correctly

**3.3 Data Persistence** ⏱️ 1 hour
- [ ] Verify all user data saves to backend (not just localStorage)
- [ ] Handle data fetching on page reload
- [ ] Add loading skeletons for data fetch

---

#### ✅ Phase 4: Polish & Testing (Hours 13-16)

**4.1 Error Handling** ⏱️ 2 hours
- [ ] Add error boundaries
- [ ] Implement retry logic for failed API calls
- [ ] Show user-friendly error messages
- [ ] Handle offline/network errors

**4.2 Loading States** ⏱️ 1 hour
- [ ] Add spinners/skeletons for all async operations
- [ ] Disable buttons during submission
- [ ] Add progress indicators

**4.3 Form Validation** ⏱️ 1 hour
- [ ] Validate email format on login
- [ ] Validate booking date/time selection
- [ ] Add helpful validation messages

**4.4 Testing** ⏱️ 2 hours
- [ ] Test full user flow: Login → Assessment → Results → Booking → Dashboard
- [ ] Test edge cases (no resources, API errors, invalid data)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness check

---

## PERSON 4: Product/UX (Copy, Polish, Demo)

### Your Focus
User experience, copy, design polish, demo preparation, flow optimization

### Tasks

#### ✅ Phase 1: Copy & Content (Hours 1-4)

**1.1 Login Page Polish** ⏱️ 1 hour
- [ ] Review and improve welcome copy in `src/app/login/page.tsx`
- [ ] Ensure privacy notice is clear and reassuring
- [ ] Add "What is CareRouter?" micro-copy
- [ ] Test: Does copy reduce anxiety? Is it inviting?

**1.2 Assessment Questions** ⏱️ 2 hours
- [ ] Review questions in `src/data/questions.ts`
- [ ] Refine question wording for clarity
- [ ] Add helpful subtitles/context
- [ ] Ensure non-clinical, accessible language
- [ ] Add skip/back functionality clarity
- [ ] Test: Can users understand without confusion?

**1.3 Results Page Explanations** ⏱️ 1 hour
- [ ] Review "Why recommended" explanations
- [ ] Make sure each resource shows clear reasoning
- [ ] Add encouraging, non-alarmist tone
- [ ] Verify crisis resources are always visible but calm

---

#### ✅ Phase 2: Visual Design & UX (Hours 5-8)

**2.1 Design Consistency** ⏱️ 2 hours
- [ ] Review color scheme across all pages
- [ ] Ensure button styles are consistent
- [ ] Check spacing/padding consistency
- [ ] Verify font hierarchy (headings, body, captions)
- [ ] Mobile design check

**2.2 Iconography & Visual Cues** ⏱️ 1 hour
- [ ] Ensure icons are intuitive (Clock = availability, $ = cost, etc.)
- [ ] Add visual separators between sections
- [ ] Use color meaningfully (green = accessible, red = crisis)

**2.3 Accessibility** ⏱️ 2 hours
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Ensure all buttons have focus states
- [ ] Add aria-labels where needed
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (optional but recommended)

**2.4 Micro-interactions** ⏱️ 1 hour
- [ ] Add hover states to buttons/cards
- [ ] Smooth transitions between questions
- [ ] Progress bar animation
- [ ] Loading state animations

---

#### ✅ Phase 3: User Flow Optimization (Hours 9-12)

**3.1 Flow Testing** ⏱️ 2 hours
- [ ] Walk through entire flow as a user
- [ ] Identify friction points
- [ ] Note any confusing steps
- [ ] Document suggested improvements

**3.2 Onboarding Clarity** ⏱️ 1 hour
- [ ] Add "How this works" info (optional modal/tooltip)
- [ ] Ensure first-time users understand the purpose
- [ ] Add progress indicators throughout journey

**3.3 Results Page UX** ⏱️ 2 hours
- [ ] Ensure pathway sections are scannable
- [ ] Make booking actions prominent
- [ ] Add "What's next?" guidance
- [ ] Test: Can users quickly find relevant resources?

**3.4 Mobile Experience** ⏱️ 1 hour
- [ ] Test full flow on mobile device
- [ ] Ensure touch targets are large enough (min 44px)
- [ ] Check text readability on small screens
- [ ] Verify modals/popups work on mobile

---

#### ✅ Phase 4: Demo Prep & Pitch Support (Hours 13-16)

**4.1 Demo Script** ⏱️ 2 hours
- [ ] Write demo walkthrough script (what to say at each step)
- [ ] Identify key selling points to highlight
- [ ] Create "wow moments" (explainability, accessibility)
- [ ] Time the demo (should be 3-5 minutes)

**4.2 Demo Data** ⏱️ 1 hour
- [ ] Coordinate with backend for realistic demo data
- [ ] Ensure demo resources are compelling examples
- [ ] Create 2-3 demo user scenarios (different severity levels)

**4.3 Presentation Polish** ⏱️ 1 hour
- [ ] Take screenshots of key screens
- [ ] Create slide deck outline (if needed)
- [ ] Highlight competitive advantages
- [ ] Practice demo run-through

**4.4 Pitch Points Document** ⏱️ 1 hour
- [ ] Document what makes CareRouter unique:
  - ✅ No login required initially (trust-first)
  - ✅ 5-question check-in (fast, respectful)
  - ✅ Access constraints as first-class concern
  - ✅ Explainability (why each resource was chosen)
  - ✅ Tiered pathway (not a resource dump)
- [ ] Prepare answers to likely judge questions
- [ ] Create "elevator pitch" (30 seconds)

**4.5 Final QA** ⏱️ 1 hour
- [ ] Do final walkthrough with fresh eyes
- [ ] Check for typos, broken links
- [ ] Verify all flows work end-to-end
- [ ] Confirm demo readiness

---

## Coordination Points

### Daily Sync (Recommended)
- **Morning**: 5-10 min standup
  - What did you complete yesterday?
  - What are you working on today?
  - Any blockers?
  
- **End of Day**: 5 min check
  - Show progress
  - Coordinate next steps

### Critical Handoffs

**Person 2 → Person 4**
- When: After Phase 2 (Assessment & Results working)
- What: Working prototype for UX review
- Action: Person 4 tests and provides feedback

**Person 4 → Person 2**
- When: After Phase 2 (Copy & Design review)
- What: List of copy changes and UX improvements
- Action: Person 2 implements changes

**Both → Demo**
- When: Hour 14-16
- What: Rehearse demo together
- Action: Finalize script and polish

---

## Success Criteria

### Person 2
✅ All pages connected to backend
✅ Full user flow works end-to-end
✅ No console errors
✅ Data persists correctly
✅ Error handling in place

### Person 4
✅ Copy is clear, compassionate, non-clinical
✅ Design is polished and consistent
✅ User flow feels smooth and trustworthy
✅ Demo script ready
✅ Pitch points documented

---

## Quick Reference

### File Locations
- **Pages**: `src/app/[page-name]/page.tsx`
- **Components**: `src/components/[ComponentName].tsx`
- **API Integration**: `src/lib/api.ts`
- **Questions Data**: `src/data/questions.ts`
- **Types**: `src/types/index.ts`

### Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check for errors
```

### Backend Endpoints (Example)
```
POST /auth/login
POST /auth/signup
POST /api/route          # Submit assessment
GET  /api/resources      # Get nearby resources
POST /api/bookings       # Create booking
GET  /api/bookings       # Get user bookings
```

---

## Timeline at a Glance

| Hours | Person 2 (Frontend Dev) | Person 4 (Product/UX) |
|-------|-------------------------|------------------------|
| 1-4   | Setup + Auth            | Copy & Content         |
| 5-8   | Assessment + Routing    | Design & Accessibility |
| 9-12  | Booking + Dashboard     | Flow Optimization      |
| 13-16 | Polish + Testing        | Demo Prep              |

**Total: ~16 hours each (2 full work days)**

---

## Tips for Success

### Person 2
- Start with auth and one complete flow (login → assessment → results)
- Don't block on backend - use mock data initially
- Add TODO comments for future improvements
- Focus on functionality first, refinement later

### Person 4
- Test as a real user would
- Challenge anything that feels confusing
- Document all suggested changes clearly
- Think about the demo story arc

### Both
- Communicate blockers immediately
- Over-communicate progress
- Test on mobile early and often
- Keep the end user (someone seeking mental health support) in mind

---

## Questions?

If stuck, check:
1. README.md for setup instructions
2. Code comments (look for TODO markers)
3. Backend team for API schema
4. Each other - you're a team!

Good luck! 🚀
