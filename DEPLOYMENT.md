# WikiQuiz AI - Deployment Guide

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+ (or SQLite for development)
- Git

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wikiquiz-ai.git
cd wikiquiz-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY=your_api_key_here
# - DATABASE_URL=postgresql://postgres:password@localhost:5432/wikiquiz

# Initialize database
python init_db.py

# Run backend server
python -m uvicorn main:app --reload
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend will run at `http://localhost:3000`

## 🌐 Production Deployment

### Option 1: Deploy to Render (Recommended)

#### Backend Deployment

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: wikiquiz-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `GEMINI_API_KEY`: Your Gemini API key
     - `DATABASE_URL`: (Render will provide PostgreSQL URL)
     - `CORS_ORIGINS`: Your frontend URL

5. Add PostgreSQL database:
   - Go to Dashboard → "New +" → "PostgreSQL"
   - Copy the Internal Database URL
   - Add it as `DATABASE_URL` environment variable

#### Frontend Deployment

1. In Render, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: wikiquiz-frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Your backend URL (e.g., `https://wikiquiz-backend.onrender.com`)

### Option 2: Deploy to Railway

#### Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add PostgreSQL
railway add

# Deploy
railway up

# Set environment variables
railway variables set GEMINI_API_KEY=your_key_here
railway variables set CORS_ORIGINS=your_frontend_url
```

#### Frontend

```bash
cd ../frontend
railway init
railway up
railway variables set VITE_API_URL=your_backend_url
```

### Option 3: Deploy to Vercel + Railway

#### Backend (Railway)

Same as Option 2

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add VITE_API_URL
```

### Option 4: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.com
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000
```

## 📊 Database Setup

### PostgreSQL

```bash
# Create database
createdb wikiquiz

# Or using psql
psql -U postgres
CREATE DATABASE wikiquiz;
\q

# Run migrations
python init_db.py
```

### SQLite (Development Only)

```env
DATABASE_URL=sqlite:///./wikiquiz.db
```

## 🔐 Getting Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Common Issues

### Issue: Database Connection Failed

**Solution**: Check your DATABASE_URL and ensure PostgreSQL is running

```bash
# Check PostgreSQL status
# Windows:
sc query postgresql

# Linux:
sudo systemctl status postgresql
```

### Issue: CORS Errors

**Solution**: Update CORS_ORIGINS in backend .env to include your frontend URL

### Issue: Gemini API 403 Error

**Solution**: Your API key may be invalid or leaked. Get a new one from Google AI Studio

### Issue: Port Already in Use

**Solution**: Kill the process or use different ports

```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

## 🎯 Performance Optimization

### Backend

- Use Gunicorn with multiple workers in production
- Enable database connection pooling
- Add Redis for caching

### Frontend

- Build for production: `npm run build`
- Enable gzip compression
- Use CDN for static assets

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## 📄 License

MIT License - See LICENSE file for details
