@echo off
REM WikiQuiz AI - Quick Start Script for Windows

echo ========================================
echo WikiQuiz AI - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: PostgreSQL not found in PATH
    echo Make sure PostgreSQL is installed and running
    echo.
)

echo [2/5] Setting up Python backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ERROR: .env file not found in backend directory
    echo Please copy .env.example to .env and configure it:
    echo   1. Set DATABASE_URL to your PostgreSQL connection string
    echo   2. Set GEMINI_API_KEY to your Google Gemini API key
    echo.
    pause
    exit /b 1
)

REM Initialize database
echo Initializing database...
python init_db.py

cd ..

echo.
echo [3/5] Setting up frontend...
cd frontend
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
) else (
    echo Node modules already installed
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
)
cd ..

echo.
echo [4/5] Setup complete!
echo.
echo ========================================
echo Starting WikiQuiz AI...
echo ========================================
echo.
echo Backend will start on: http://localhost:8000
echo Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop the servers
echo.
pause

echo [5/5] Starting servers...
echo.

REM Start backend in new window
start "WikiQuiz Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "WikiQuiz Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo WikiQuiz AI is starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Check the new windows for server output
echo.
pause
