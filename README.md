# 🏋️ FitGENIE AI Agent

> **Your Personal AI Fitness, Nutrition & Posture Coach**

A production-quality AI fitness web application built for a semester project. Powered by **Gemini AI**, **Random Forest ML**, and **MediaPipe Computer Vision**.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) Gemini API key from [aistudio.google.com](https://aistudio.google.com)

---

### Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key
# Edit backend/.env and replace: GEMINI_API_KEY=your_key_here

# Train ML models (first time only)
python -m ml.trainer

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

---

### Step 2: Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Charts | Recharts 2 |
| State | Zustand |
| Backend | FastAPI + Uvicorn |
| ML | scikit-learn (Random Forest + Decision Tree) |
| Computer Vision | OpenCV + MediaPipe |
| AI Agent | Google Gemini API |
| PDF | ReportLab |

---

## 📱 Features

### ✅ Implemented
- **BMI Calculator** — Automated BMI calculation with gauge chart visualization
- **BMR Calculator** — Mifflin-St Jeor formula with TDEE and macro targets
- **Fitness Score** — Composite 0-100 score with breakdown
- **ML Recommendations** — Random Forest + Decision Tree ensemble (5,000 training samples)
- **AI Agent** — Gemini-powered personalized health analysis
- **Workout Plans** — 7-day personalized weekly plans
- **Diet Plans** — Meal-by-meal nutrition with macros
- **Health Charts** — BMI gauge, calorie breakdown, radar chart, trend projection
- **AI Chat** — Conversational fitness coaching via Gemini
- **Workout Session** — Camera-based exercise tracking (camera OFF by default)
- **Posture Analysis** — MediaPipe neck/back/shoulder posture scoring
- **Exercise Tracking** — Rep counter + form feedback (pushup, squat, lunge, plank)
- **PDF Reports** — Professional downloadable fitness reports

### 🎨 UI/UX
- Dark theme with glassmorphism
- Blue/cyan/purple/green color palette
- Framer Motion animations throughout
- Responsive design (mobile + desktop)
- Recharts interactive visualizations

---

## 📁 Project Structure

```
FITGENIE/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── routers/             # API endpoints
│   │   ├── fitness.py       # BMI, BMR, score
│   │   ├── ml_model.py      # ML predictions
│   │   ├── ai_agent.py      # Gemini analysis
│   │   ├── chat.py          # AI chat
│   │   ├── workout.py       # Workout plans
│   │   ├── diet.py          # Diet plans
│   │   ├── posture.py       # CV WebSocket
│   │   └── report.py        # PDF generation
│   ├── ml/
│   │   ├── dataset_generator.py  # Synthetic data
│   │   ├── trainer.py            # Model training
│   │   └── predictor.py          # Inference
│   ├── cv/
│   │   ├── pose_detector.py      # MediaPipe wrapper
│   │   ├── posture_analyzer.py   # Posture scoring
│   │   └── exercise_tracker.py   # Rep counting
│   ├── services/
│   │   ├── gemini_service.py     # Gemini AI
│   │   └── pdf_service.py        # ReportLab PDF
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # All UI components
    │   ├── store/           # Zustand state
    │   ├── api/             # Axios client
    │   ├── App.jsx          # Main dashboard
    │   └── main.jsx         # Entry point
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🔑 Configuration

### Gemini API Key
Edit `backend/.env`:
```
GEMINI_API_KEY=your_actual_key_here
```
Get your free key at: https://aistudio.google.com

### Without Gemini API Key
The app fully works without a Gemini key! It uses intelligent fallback responses for:
- AI Agent analysis
- AI Fitness Chat
All other features (BMI, BMR, ML, CV, PDF) work without the key.

---

## 🤖 ML Model Details

**Dataset**: 5,000 synthetic fitness records with realistic distributions

**Features**:
- BMI (15-45 range)
- Age (15-70 years)
- Gender (binary)
- Activity Level (5 categories)
- Fitness Goal (5 categories)

**Models**:
- Random Forest Classifier (200 trees, max_depth=12)
- Decision Tree Classifier (max_depth=8)
- Ensemble: RF 70% + DT 30%

**Targets**:
- Workout Category (5 classes)
- Diet Category (5 classes)  
- Fitness Level (3 classes)

---

## 🎥 Computer Vision

**Exercises Supported**:
- Push-Ups (elbow angle detection)
- Squats (knee angle detection)  
- Lunges (knee angle detection)
- Plank (body alignment, timed)

**Posture Checks**:
- Head forward posture (neck angle)
- Back alignment (slouching)
- Shoulder symmetry
- Hip alignment

---

## ⚠️ Notes

- Camera NEVER opens automatically — only on "START WORKOUT" click
- No authentication required — open and use immediately
- No database — all data is session-based
- For educational purposes — consult healthcare professionals for medical advice
