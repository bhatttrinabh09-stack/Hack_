# AdaptLearn 🎓⚡

> **Adaptive Exam-Prep Platform with AI Micro-Learning, Panic Urgency Computing & Swipe-to-Learn Deck**

AdaptLearn dynamically adjusts study materials based on remaining exam time and syllabus importance.

---

## 📁 Repository Architecture

```
Hack2/
├── FrontEnd/       # React Native (Expo) + TypeScript Mobile & Web App
├── BackEnd/        # FastAPI REST API + SQLAlchemy ORM + Urgency Engine
└── ML/             # AI Microservice for Topic Ranking, Summarization & Video Scripts
```

---

## 🚀 Quick Start Guide

### 1. BackEnd Service
```bash
cd BackEnd
pip install -r requirements.txt
python3 -m app.seed
uvicorn app.main:app --reload --port 8000
```
- OpenAPI Documentation: `http://localhost:8000/docs`

### 2. ML Service
```bash
cd ML
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
- OpenAPI Documentation: `http://localhost:8001/docs`

### 3. FrontEnd App
```bash
cd FrontEnd
npm install
npx expo start --web
```
- Web Application: `http://localhost:8081`
- Demo Credentials: `demo@adaptlearn.dev` / `password123` (or click **⚡ Quick One-Click Demo Login**)

---

## ⚡ Core Features
1. **Swipe-to-Learn Deck**: Tinder-style flashcards with automatic 6-second advance and Skip/Learn classification.
2. **Panic Urgency Engine**:
   - **High Urgency**: Drops low-priority topics, selects shortest high-yield review assets.
   - **Medium Urgency**: Highlights high-yield topics with `MUST ASK` badges and condensed bullet notes.
   - **Low Urgency**: Full comprehensive textbook notes and complete video lectures.
3. **AI Video Script Generator & Content Compression**: CPU-only deterministic extractive summarization and short-form video generation.
