# WikiQuiz AI - Complete Setup Guide

This guide will walk you through setting up the WikiQuiz AI application from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Python 3.9 or higher** installed
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/

- [ ] **Node.js 18 or higher** installed
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **PostgreSQL 14 or higher** installed and running
  - Check: `psql --version`
  - Download: https://www.postgresql.org/download/

- [ ] **Gemini API Key**
  - Get one: https://makersuite.google.com/app/apikey

## Step-by-Step Setup

### Part 1: Database Setup

#### Option A: Using PostgreSQL (Recommended)

1. **Start PostgreSQL service**
   ```bash
   # Windows (if installed as service)
   # It should start automatically
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Create database**
   ```bash
   # Using createdb command
   createdb wikiquiz
   
   # OR using psql
   psql -U postgres
   CREATE DATABASE wikiquiz;
   \q
   ```

3. **Note your connection details**
   - Host: `localhost`
   - Port: `5432` (default)
   - Database: `wikiquiz`
   - User: `postgres` (or your username)
   - Password: (your password)

#### Option B: Using Docker PostgreSQL

```bash
docker run --name wikiquiz-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=wikiquiz \
  -p 5432:5432 \
  -d postgres:14
```

### Part 2: Backend Setup

1. **Navigate to project directory**
   ```bash
   cd a:\projects\wikiquiz-ai---smart-trivia-generator
   ```

2. **Create Python virtual environment** (recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy example file
   copy .env.example .env    # Windows
   cp .env.example .env      # macOS/Linux
   ```

5. **Edit `.env` file** with your settings:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/wikiquiz
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

   Replace:
   - `postgres:password` with your PostgreSQL username and password
   - `your_actual_gemini_api_key_here` with your Gemini API key

6. **Initialize database**
   ```bash
   python init_db.py
   ```

   You should see:
   ```
   ✅ Database connection successful!
   ✅ Database tables created successfully!
   ```

7. **Start backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

8. **Verify backend is running**
   - Open browser: http://localhost:8000
   - You should see: `{"message": "WikiQuiz AI API", "version": "1.0.0", "status": "running"}`
   - API Docs: http://localhost:8000/docs

### Part 3: Frontend Setup

1. **Open new terminal** (keep backend running)

2. **Navigate to project root**
   ```bash
   cd a:\projects\wikiquiz-ai---smart-trivia-generator
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Configure frontend environment**
   ```bash
   # Copy example file
   copy .env.example .env.local    # Windows
   cp .env.example .env.local      # macOS/Linux
   ```

5. **Edit `.env.local`** (should already have):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

6. **Start frontend development server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v6.2.0  ready in XXX ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

7. **Open application**
   - Open browser: http://localhost:5173
   - You should see the WikiQuiz AI interface!

## Testing the Application

### Test 1: Generate Your First Quiz

1. Go to **"Generate Quiz"** tab
2. Enter URL: `https://en.wikipedia.org/wiki/Alan_Turing`
3. Click **"Generate Quiz"**
4. Wait 15-30 seconds
5. You should see:
   - Article title and summary
   - Key entities (people, organizations, locations)
   - 7-10 quiz questions
   - Related topics

### Test 2: View History

1. Go to **"History"** tab
2. You should see the Alan Turing quiz listed
3. Click **"Details"** to view full quiz in modal

### Test 3: Take Quiz (Bonus Feature)

1. After generating a quiz, click **"Take Quiz"**
2. Answer the questions
3. Click **"Submit Quiz"**
4. See your score and explanations

## Troubleshooting

### Backend Issues

#### "Connection refused" or database errors
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Test connection manually
psql -U postgres -d wikiquiz
```

#### "ModuleNotFoundError"
```bash
# Make sure virtual environment is activated
# Re-install dependencies
pip install -r requirements.txt
```

#### "Invalid API key" or LLM errors
- Verify your Gemini API key is correct in `.env`
- Check API key at: https://makersuite.google.com/app/apikey
- Ensure no extra spaces in the `.env` file

### Frontend Issues

#### "Failed to fetch" or CORS errors
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in `.env.local`
- Verify CORS_ORIGINS in backend `.env`

#### Port 5173 already in use
```bash
# Kill existing process or use different port
npm run dev -- --port 3000
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Quick Reference

### Start Development Environment

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Stop Everything

- Press `Ctrl+C` in both terminals
- Deactivate virtual environment: `deactivate`

## Next Steps

1. ✅ Application running successfully
2. 📝 Test with different Wikipedia articles
3. 🎨 Customize the UI (optional)
4. 🚀 Deploy to production (see DEPLOYMENT.md)
5. 📸 Take screenshots for submission

## Support

If you encounter issues:

1. Check this guide again
2. Review error messages carefully
3. Check the logs in both terminals
4. Verify all prerequisites are installed
5. Ensure all environment variables are set correctly

## Sample Test URLs

Try these Wikipedia articles:
- https://en.wikipedia.org/wiki/Alan_Turing
- https://en.wikipedia.org/wiki/Albert_Einstein
- https://en.wikipedia.org/wiki/Marie_Curie
- https://en.wikipedia.org/wiki/Artificial_intelligence
- https://en.wikipedia.org/wiki/Python_(programming_language)

---

**Congratulations! Your WikiQuiz AI application is now running! 🎉**
