
🏥 CareRouter

CareRouter is an AI-powered mental health triage and navigation system designed to connect individuals in crisis with the right support at the right time. By streamlining the path to help, CareRouter reduces cognitive load during high-stress moments and provides actionable resources immediately.

🌟 Key Features
Conversational Assessment: An empathetic, 6-question chatbot interface designed to minimize stress during a crisis.

AI-Powered Triage: Utilizes Gemini 2.5 Flash to classify severity (Levels 1-4), urgency, and issue type with personalized messaging.

Location-Based Matching: Integration with Google Maps API to identify nearby mental health facilities within a 5km radius.

Smart Filtering: A dual-LLM architecture that filters resources based on specific user constraints such as cost, transportation, and language.

Immediate Coping Tools: Access to three evidence-based exercises for immediate use while waiting for professional care.

Accessibility First: Features ElevenLabs Text-to-Speech integration for enhanced accessibility.

Safety-First Design: Includes automated crisis keyword detection that bypasses AI for immediate 911/988 routing.

Secure Authentication: JWT-based secure login to track assessment history safely.

🛠 Tech Stack
Frontend
Next.js 16: React framework utilizing TypeScript and App Router.

Tailwind CSS: For a responsive, utility-first UI design.

@vis.gl/react-google-maps: Interactive map integration.

Lucide React: Comprehensive icon library.

ElevenLabs API: AI-driven Text-to-Speech functionality.

Backend
FastAPI: High-performance, asynchronous Python web framework.

Gemini 2.5 Flash: Advanced LLM for intelligent triage and resource filtering.

Google Places API: Powering location-based facility discovery.

SQLModel & SQLite: Pydantic-based SQL toolkit (PostgreSQL-ready).

Security: JWT Authentication with bcrypt password hashing via Python-Jose and Passlib.

⚙️ Setup and Installation
1. Backend Setup
Bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows: .\venv\Scripts\activate | On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
Environment Variables (.env): Create a .env file in the backend directory:

Code snippet
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
SECRET_KEY=your_jwt_secret_key_here
Note: Use an API key without HTTP referrer restrictions for the backend.

2. Frontend Setup
Bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
Environment Variables (.env.local): Create a .env.local file in the frontend directory:

Code snippet
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_frontend_google_maps_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key_optional
🚀 Running the Application
Start Backend
From the backend directory:

Bash
uvicorn main:app --reload
Server runs at: http://127.0.0.1:8000

Start Frontend
From the frontend directory:

Bash
npm run dev
Application available at: http://localhost:3000

🛡 Safety & Privacy
Crisis Detection: Specific keywords trigger immediate emergency resource displays, bypassing AI logic.

Conservative Bias: The system is engineered to err on the side of higher urgency when triage data is uncertain.

Graceful Degradation: Core crisis resources remain accessible even if third-party APIs fail.

PHIPA-Ready: Architecture designed with Ontario health privacy standards in mind.
