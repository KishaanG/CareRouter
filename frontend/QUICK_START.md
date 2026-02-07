# CareRouter Frontend - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Set Up Environment
Create a `.env.local` file in the `frontend` folder:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the app redirect to the login page.

---

## 📁 Project Structure at a Glance

```
frontend/
├── src/
│   ├── app/                    # 📄 All pages live here
│   │   ├── login/              # Login & signup
│   │   ├── assessment/         # 5-question check-in
│   │   ├── results/            # Support pathway display
│   │   ├── booking/            # Appointment booking
│   │   └── dashboard/          # User dashboard
│   ├── components/             # 🧩 Reusable UI pieces
│   ├── data/                   # 📊 Static data (questions)
│   ├── lib/                    # 🔧 API integration
│   └── types/                  # 📝 TypeScript types
└── public/                     # Static assets (if needed)
```

---

## 👥 Who Does What?

### Person 2 (You): Frontend Developer
**Your main files:**
- `src/lib/api.ts` - Backend connection
- `src/app/*/page.tsx` - All page functionality
- Look for `TODO: Person 2` comments in the code

**Your focus:** Make everything work with the backend

### Person 4 (Your Teammate): Product/UX
**Their main files:**
- `src/data/questions.ts` - Question wording
- `src/app/*/page.tsx` - Copy and design polish
- All visual/UX improvements

**Their focus:** Make it beautiful and user-friendly

---

## 🎯 Your First Tasks (Person 2)

### Task 1: Verify Setup (10 min)
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Click through: Login → Assessment → Results
- [ ] Everything should work (with mock data for now)

### Task 2: Connect Auth (1 hour)
- [ ] Get backend login endpoint from Person 1
- [ ] Update `src/lib/api.ts` → `authAPI.login()`
- [ ] Update `src/app/login/page.tsx` → `handleSubmit()`
- [ ] Test: Real login works

### Task 3: Connect Assessment (2 hours)
- [ ] Get backend routing endpoint from Person 1
- [ ] Update `src/lib/api.ts` → `assessmentAPI.submitAssessment()`
- [ ] Update `src/app/assessment/page.tsx` → `submitAssessment()`
- [ ] Update `src/app/results/page.tsx` → load real pathway
- [ ] Test: Complete assessment → See real results

---

## 🎨 Your First Tasks (Person 4)

### Task 1: Review User Flow (30 min)
- [ ] Run `npm run dev`
- [ ] Go through entire flow as a user
- [ ] Note anything confusing or unclear
- [ ] Write down your first impressions

### Task 2: Polish Copy (1 hour)
- [ ] Open `src/data/questions.ts`
- [ ] Review each question for clarity
- [ ] Open `src/app/login/page.tsx`
- [ ] Make welcome message warm and reassuring

### Task 3: Design Consistency (1 hour)
- [ ] Check colors match across all pages
- [ ] Ensure buttons look consistent
- [ ] Verify spacing feels balanced
- [ ] Test on your phone

---

## 🔗 Backend Connection

### What You Need From Backend Team
Ask Person 1 for:
1. **API Base URL** (e.g., `http://localhost:8000`)
2. **Endpoint List** with example requests/responses
3. **CORS Setup** (they need to allow your frontend URL)

### Example Backend Endpoints
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
→ Returns: { "token": "...", "user": {...} }

POST /api/route
{
  "answers": { "0": "2", "1": "3", ... }
}
→ Returns: { "severity": "moderate", "pathway": {...} }
```

### Updating API Calls
All API functions are in `src/lib/api.ts`. Update them one by one:

```typescript
// Before (mock):
await new Promise(resolve => setTimeout(resolve, 1000))

// After (real):
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
return response.json()
```

---

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] Login with test account
- [ ] Complete assessment (all questions)
- [ ] View results (personalized pathway)
- [ ] Book an appointment
- [ ] View dashboard
- [ ] Logout and login again

### Common Issues & Fixes

**Issue:** "Failed to fetch" error
- **Fix:** Check backend is running on correct port
- **Fix:** Verify CORS is enabled on backend
- **Fix:** Check `.env.local` has correct API_URL

**Issue:** Page shows "Loading..." forever
- **Fix:** Check browser console for errors
- **Fix:** Verify backend endpoint returns correct JSON
- **Fix:** Add error handling to catch failed requests

**Issue:** Styling looks broken
- **Fix:** Run `npm install` again
- **Fix:** Check `tailwind.config.js` is present
- **Fix:** Restart dev server

---

## 📱 Mobile Testing

### Quick Mobile Test
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update dev server to allow external connections:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. On phone, visit: `http://YOUR_IP:3000`

### What to Check on Mobile
- Text is readable (not too small)
- Buttons are easy to tap (not too close together)
- Navigation works smoothly
- Forms are usable

---

## 🎬 Demo Preparation

### Week of Demo
- **3 days before:** All functionality working
- **2 days before:** Design polished
- **1 day before:** Demo rehearsal
- **Demo day:** Test demo flow one more time before presenting

### Demo Flow (3-5 minutes)
1. **Intro** (30 sec): "CareRouter helps people find mental health support"
2. **Login** (15 sec): "No complex signup - just email and password"
3. **Assessment** (60 sec): "5 quick questions - 2 minutes max"
4. **Results** (90 sec): "Personalized pathway with clear explanations" ⭐ KEY MOMENT
5. **Booking** (30 sec): "Book directly from the app"
6. **Close** (30 sec): "Questions?"

---

## 🆘 Need Help?

### Person 2 (Frontend Dev)
- Stuck on API integration? Check `src/lib/api.ts` comments
- Components not rendering? Check browser console
- TypeScript errors? Check `src/types/index.ts`

### Person 4 (Product/UX)
- Want to change copy? Look in `.tsx` files
- Want to change colors? Check `tailwind.config.js`
- Want to change question text? Check `src/data/questions.ts`

### Both
- Read `TASK_DIVISION.md` for detailed task breakdown
- Read `README.md` for technical details
- Check code for `TODO` comments

---

## ✅ Success Checklist

### MVP (Minimum Viable Product)
- [ ] User can login/signup
- [ ] User can complete 5-question assessment
- [ ] User sees personalized pathway with 3 tiers
- [ ] User can book an appointment
- [ ] User can view their dashboard
- [ ] Works on mobile and desktop
- [ ] No major bugs

### Demo Ready
- [ ] All MVP features work
- [ ] Design is polished and consistent
- [ ] Copy is clear and compassionate
- [ ] Demo script prepared
- [ ] Tested on fresh browser (no cache)
- [ ] Backup plan if live demo fails (screenshots/video)

---

## 🎉 You've Got This!

Remember:
- **Start simple** - Get one flow working first
- **Communicate often** - Don't work in silos
- **Test frequently** - Don't wait until the end
- **Focus on the user** - Someone seeking help should feel supported

Good luck with CareRouter! 🚀

---

**Questions or stuck?** Check the other docs:
- 📖 `README.md` - Technical details
- 📋 `TASK_DIVISION.md` - Detailed task breakdown
- 💡 This file - Quick start reference
