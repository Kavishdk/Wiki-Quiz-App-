# 🚀 Quick Start Guide - WikiQuiz AI

## Step-by-Step Instructions to Run the Project

### ✅ Prerequisites Verified
- Python 3.12.0 ✓
- Node.js 22.12.0 ✓
- PostgreSQL (needs to be installed and running)

---

## 📝 Step 1: Set Up PostgreSQL Database

### Option A: Using PostgreSQL (Recommended)

1. **Make sure PostgreSQL is running**
   ```bash
   # Check if PostgreSQL is running
   psql --version
   ```

2. **Create the database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE wikiquiz;
   
   # Exit
   \q
   ```

### Option B: Quick Setup (if PostgreSQL is already configured)
Just note your connection details:
- Host: `localhost`
- Port: `5432`
- Database: `wikiquiz`
- Username: `postgres` (or your username)
- Password: (your password)

---

## 🔧 Step 2: Configure Backend Environment

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Copy environment template**
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env` file** with your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/wikiquiz
   GEMINI_API_KEY=your_gemini_api_key_here
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

   **Get Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy and paste into `.env`

---

## 🐍 Step 3: Set Up Python Backend

1. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # You should see (venv) in your terminal
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python init_db.py
   ```
   
   You should see: "✓ Database initialized successfully!"

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   
   Backend will run at: **http://localhost:8000**
   API Docs available at: **http://localhost:8000/docs**

---

## ⚛️ Step 4: Set Up React Frontend

**Open a NEW terminal** (keep backend running)

1. **Navigate to project root**
   ```bash
   cd a:\projects\wikiquiz-ai---smart-trivia-generator
   ```

2. **Copy environment template**
   ```bash
   copy .env.example .env.local
   ```

3. **Edit `.env.local`** (should already be correct):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Install Node dependencies**
   ```bash
   npm install
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```
   
   Frontend will run at: **http://localhost:5173**

---

## 🎉 Step 5: Access the Application

1. **Open your browser** and go to:
   ```
   http://localhost:5173
   ```

2. **Try it out:**
   - Paste a Wikipedia URL (e.g., `https://en.wikipedia.org/wiki/Alan_Turing`)
   - Click "Generate Quiz"
   - Wait for the AI to generate questions
   - View your quiz!

---

## 🛠️ Alternative: Use Quick Start Script (Windows)

If you want to automate everything:

```bash
start.bat
```

This will:
- Check prerequisites
- Set up virtual environment
- Install dependencies
- Initialize database
- Start both backend and frontend

---

## 📊 Verify Everything is Running

### Check Backend
- Open: http://localhost:8000
- You should see: `{"message": "WikiQuiz AI API", "status": "running"}`

### Check API Docs
- Open: http://localhost:8000/docs
- You should see interactive API documentation

### Check Frontend
- Open: http://localhost:5173
- You should see the WikiQuiz AI interface

---

## 🧪 Test the Application

### Test URLs (from sample_data/test_urls.txt):

1. **Alan Turing** (Computer Science)
   ```
   https://en.wikipedia.org/wiki/Alan_Turing
   ```

2. **Artificial Intelligence** (Technology)
   ```
   https://en.wikipedia.org/wiki/Artificial_intelligence
   ```

3. **Marie Curie** (Science)
   ```
   https://en.wikipedia.org/wiki/Marie_Curie
   ```

4. **World War II** (History)
   ```
   https://en.wikipedia.org/wiki/World_War_II
   ```

---

## 🐛 Troubleshooting

### Backend won't start?

**Error: "No module named 'fastapi'"**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate
pip install -r requirements.txt
```

**Error: "could not connect to server"**
```bash
# PostgreSQL is not running
# Start PostgreSQL service or check connection details in .env
```

**Error: "Invalid API key"**
```bash
# Check your GEMINI_API_KEY in backend/.env
# Make sure you copied it correctly from Google AI Studio
```

### Frontend won't start?

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Failed to fetch"**
```bash
# Backend is not running
# Make sure backend is running on port 8000
# Check VITE_API_URL in .env.local
```

### Database issues?

**Error: "database does not exist"**
```bash
# Create the database
psql -U postgres
CREATE DATABASE wikiquiz;
\q

# Then run init_db.py again
python init_db.py
```

---

## 🔄 Stopping the Application

### Stop Backend
- Press `Ctrl+C` in the backend terminal
- Type `deactivate` to exit virtual environment

### Stop Frontend
- Press `Ctrl+C` in the frontend terminal

---

## 📝 Summary of Commands

### First Time Setup:
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your credentials
python init_db.py

# Frontend (new terminal)
cd ..
npm install
copy .env.example .env.local
```

### Every Time You Run:
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload

# Terminal 2 - Frontend
npm run dev
```

### Or Just Use:
```bash
start.bat
```

---

## ✅ You're All Set!

Your WikiQuiz AI application should now be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Happy quiz generating! 🎓
