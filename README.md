# 🚀 Placement Predictor — AI-Powered Career Intelligence

> Upload your resume. Discover your potential. Own your future.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://placement-predictor-psi.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?style=for-the-badge)](https://placement-predictor-production-2753.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Divyansh20Gupta/Placement-Predictor)

---

## 📌 What is this?

Placement Predictor is a full-stack AI web application that helps students and freshers understand their placement potential. Upload your resume, enter a few academic details, and the system:

- **Parses your resume** using Google Gemini API (handles any resume format)
- **Predicts placement likelihood** using a trained ML classification model
- **Predicts expected salary** using a trained ML regression model
- **Generates personalized career advice** including skills to learn, certifications to get, and project ideas — all tailored to your actual profile

---

## 🎯 Why I Built This

As a final-year CSE student going through placement season, I noticed there was no tool that could give a fresher an honest, data-driven assessment of where they stand — and more importantly, what they should do about it. I built this to solve that problem, and learned the entire ML + deployment pipeline in the process.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python | Core language |
| FastAPI | REST API framework |
| scikit-learn | ML models (Logistic Regression + Linear Regression) |
| Google Gemini API | LLM-based resume parsing + career recommendations |
| pdfplumber | PDF text extraction |
| joblib | Model serialization |
| Railway | Backend deployment + CI/CD |

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | Frontend framework |
| Axios | HTTP requests to backend |
| HTML5 Canvas | Nebula particle background animation |
| CSS-in-JS | Liquid glass UI (iOS 26 inspired) |
| Vercel | Frontend deployment + CI/CD |

---

## 🧠 How It Works

```
User uploads resume PDF + enters academic marks
        ↓
pdfplumber extracts raw text from PDF
        ↓
Google Gemini API parses unstructured text → structured JSON
(name, college, skills, internships, projects, certifications, college tier)
        ↓
ML Pipeline:
  • Classification Model → Placed / Not Placed (94% accuracy)
  • Regression Model    → Expected Salary (₹2.5L - ₹8L range)
        ↓
Gemini API generates personalized career recommendations
(skills to learn, certifications, project ideas)
        ↓
Results displayed on beautiful nebula UI with liquid glass cards
```

---

## 📊 ML Model Details

### Features Used
| Feature | Source |
|---|---|
| 10th Percentage | User input |
| 12th Percentage | User input |
| CGPA | User input / Resume |
| College Tier (1/2/3) | Gemini API classification |
| Number of Skills | Resume parser |
| Number of Internships | Resume parser |
| Number of Certifications | Resume parser |
| Number of Projects | Resume parser |

### Model Performance
- **Classification (Placed/Not Placed):** 94% accuracy (vs 90.8% dumb baseline)
- **Regression (Salary Prediction):** MAE ₹17,835 (vs ₹37,046 baseline — 52% improvement)
- **Training data:** 500 synthetic students with realistic placement patterns
- Models are automatically regenerated during deployment via build command

---

## 🚀 Live Demo

👉 **[Try it here — placement-predictor-psi.vercel.app](https://placement-predictor-psi.vercel.app)**

Upload any resume PDF and see your placement prediction in under 30 seconds.

---

## 🏗️ Project Structure

```
Placement-Predictor/
├── backend/
│   ├── app.py              # FastAPI server + /predict REST endpoint
│   ├── resume_parser.py    # Gemini-powered PDF resume parser
│   ├── train_model.py      # ML model training pipeline
│   ├── pridict.py          # Terminal-based prediction script
│   ├── requirements.txt    # Python dependencies
│   └── Procfile            # Railway deployment configuration
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Complete React application
│   │   └── index.css       # Global styles
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
│
├── .gitignore
└── README.md
```

---

## ⚙️ Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
python train_model.py       # generates placement_model.pkl + salary_model.pkl
```

Create a `.env` file inside `backend/`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:
```bash
uvicorn app:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

> **Note:** Update the API URL in `frontend/src/App.jsx` to `http://localhost:8000` when running locally.

---

## 🔌 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{"message": "Placement Predictor API is running!"}
```

### `POST /predict`
Main prediction endpoint. Accepts multipart form data.

**Request:**
| Field | Type | Required | Description |
|---|---|---|---|
| file | PDF file | ✅ | Resume PDF |
| ssc_p | float | ✅ | 10th percentage |
| hsc_p | float | ✅ | 12th percentage |
| degree_p | float | ✅ | CGPA (out of 10) |
| is_graduated | boolean | ❌ | Default: false |

**Response:**
```json
{
  "name": "Student Name",
  "college": "College Name",
  "college_tier": "Tier 3",
  "skills_count": 21,
  "internships_count": 4,
  "certifications_count": 5,
  "projects_count": 6,
  "placement_prediction": 1,
  "salary_prediction": 350000,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "gemini_suggestions": "AI-powered career recommendations..."
}
```

---

## 🎨 UI Features

- **Nebula background** — animated star particles with subtle cosmic glow
- **Liquid glass cards** — iOS 26 inspired frosted glass effect with colored tints
- **Click ripple effect** — satisfying blue ripple on every click
- **Smooth animations** — results fade in with staggered timing
- **Smart tier badges** — Tier 1 highlighted in gold, Tier 2 in blue, Tier 3 subtle
- **Structured AI recommendations** — Skills, Certifications, and Project ideas in separate cards

---

## 🔮 Planned Enhancements (Phase 6)

- [ ] RAG-powered suggestions using real-time job market data from Naukri/LinkedIn
- [ ] GitHub Actions CI/CD testing pipeline
- [ ] Real placement data collection and automatic model retraining
- [ ] College tier database with 1000+ Indian institutions
- [ ] Support for non-tech roles (BBA, BCom, MBA students)
- [ ] Resume improvement suggestions with before/after comparison
- [ ] Company-specific placement predictions (TCS, Infosys, Wipro, etc.)

---

## 🏆 Key Learnings

Building this project taught me:

1. **End-to-end ML pipeline** — data generation, feature engineering, model training, evaluation against baselines
2. **LLM integration** — using Gemini API for unstructured text extraction (resume parsing)
3. **REST API design** — FastAPI, async endpoints, file uploads, CORS
4. **React fundamentals** — hooks (useState, useEffect, useRef), axios, form handling, conditional rendering
5. **Deployment** — Railway (Python backend), Vercel (React frontend), CI/CD via GitHub
6. **Security** — environment variables, .gitignore, API key management
7. **Product thinking** — identifying real user needs, handling edge cases, calibrating model outputs

---

## 👨‍💻 Author

**Divyansh Gupta**
- B.Tech CSE | HMR Institute of Technology and Management (GGSIPU) | 2026
- 📧 divyanshgupta845@gmail.com
- 🔗 [GitHub](https://github.com/Divyansh20Gupta)

---

## 📄 License

MIT License — feel free to use this project as inspiration for your own portfolio.

---

*Built with ❤️ to help freshers navigate placement season with confidence.*
