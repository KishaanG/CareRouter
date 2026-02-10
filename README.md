# CareRouterCareRouter is an AI-powered mental health triage and navigation system that connects people in crisis with the right support at the right time. Users complete a conversational 6-question assessment, and our Gemini AI analyzes their needs to provide a personalized care pathway with crisis resources, nearby facilities, and immediate coping exercises.## Features- **Conversational Assessment**: Empathetic 6-question chatbot interface designed to reduce cognitive load during crisis- **AI-Powered Triage**: Gemini 2.5 Flash classifies severity (1-4), urgency level, and issue type with personalized messaging- **Location-Based Matching**: Google Maps API finds nearby mental health facilities within 5km radius- **Smart Filtering**: Dual-LLM architecture filters resources based on user constraints (cost, transportation, language)- **Immediate Coping Tools**: 3 evidence-based exercises users can do right now while waiting for professional care- **Text-to-Speech**: ElevenLabs integration for accessibility- **Interactive Map**: Visual discovery of support options with one-click directions- **Safety-First Design**: Crisis keyword detection bypasses AI for immediate 911/988 routing- **User Authentication**: JWT-based secure login with assessment history tracking## Tech Stack### Frontend- **Next.js 16**: React framework with TypeScript- **Tailwind CSS**: Utility-first CSS framework- **@vis.gl/react-google-maps**: Interactive Google Maps integration- **Lucide React**: Icon library- **ElevenLabs API**: Text-to-speech for accessibility### Backend- **FastAPI**: High-performance Python web framework- **Gemini 2.5 Flash**: Google's LLM for intelligent triage and resource filtering- **Google Places API**: Location-based facility search- **SQLite**: Database (PostgreSQL-ready for production)- **SQLModel**: SQL database toolkit with Pydantic models- **JWT Authentication**: Secure user sessions with bcrypt password hashing- **Python-Jose**: JWT token creation and verification- **Passlib**: Password hashing utilities## Setup and Installation### Backend1. Navigate to the backend directory:
bash
cd backend
2. Create a virtual environment:
bash
python -m venv venv
3. Activate the virtual environment:   - **On Windows:**     .\venv\Scripts\activate     
On macOS/Linux:
     source venv/bin/activate
Install the required dependencies:
pip install -r requirements.txt
Create a .env file in the backend directory and add your API keys:
GEMINI_API_KEY=your_gemini_api_key_hereGOOGLE_MAPS_API_KEY=your_google_maps_api_key_hereSECRET_KEY=your_jwt_secret_key_here
Note: Use an API key without HTTP referrer restrictions for the backend Google Maps API.
Frontend
Navigate to the frontend directory:
cd frontend
Install the required dependencies:
npm install
Create a .env.local file in the frontend directory:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_frontend_google_maps_keyNEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key_optional
Note: Use an API key with HTTP referrer restrictions (localhost:3000) for the frontend.
Running the Application
Start the Backend Server
Make sure you are in the backend directory with the virtual environment activated.
Run the following command:
uvicorn main:app --reload
The backend server will be running at http://127.0.0.1:8000.
Start the Frontend Development Server
Make sure you are in the frontend directory.
Run the following command:
npm run dev
The frontend application will be available at http://localhost:3000.
Open your browser and navigate to http://localhost:3000 to use the application.
