# Deployment Guide - WikiQuiz AI

This guide covers deploying the WikiQuiz AI application to production.

## Deployment Architecture

```
Frontend (Vercel) → Backend (Render) → Database (Render PostgreSQL)
```

---

## Part 1: Database Deployment (Render PostgreSQL)

### 1. Create Render Account
- Go to https://render.com
- Sign up or log in with GitHub

### 2. Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `wikiquiz-db`
   - **Database**: `wikiquiz`
   - **User**: `wikiquiz_user` (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is sufficient for testing

3. Click **"Create Database"**

4. **Save connection details**:
   - Internal Database URL (for backend)
   - External Database URL (for local testing)

   Example:
   ```
   Internal: postgresql://wikiquiz_user:xxx@dpg-xxx/wikiquiz
   External: postgresql://wikiquiz_user:xxx@dpg-xxx.oregon-postgres.render.com/wikiquiz
   ```

---

## Part 2: Backend Deployment (Render Web Service)

### 1. Prepare Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure service:

   **Basic Settings:**
   - **Name**: `wikiquiz-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`

   **Build & Deploy:**
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   
   - **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Environment Variables** (click "Advanced"):
   
   Add these variables:
   ```
   DATABASE_URL=<your_internal_database_url_from_step_1>
   GEMINI_API_KEY=<your_gemini_api_key>
   CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173
   ```

   Note: You'll update `CORS_ORIGINS` after deploying frontend

5. Click **"Create Web Service"**

6. Wait for deployment (5-10 minutes)

7. **Initialize Database**:
   - Go to your service's **"Shell"** tab
   - Run: `python init_db.py`

8. **Test Backend**:
   - Your backend URL: `https://wikiquiz-backend.onrender.com`
   - Test: `https://wikiquiz-backend.onrender.com/`
   - Should return: `{"message": "WikiQuiz AI API", ...}`

---

## Part 3: Frontend Deployment (Vercel)

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # From project root
   vercel --prod
   ```

4. **Configure during deployment**:
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N`
   - Project name: `wikiquiz-ai`
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Set Environment Variable**:
   ```bash
   vercel env add VITE_API_URL production
   # Enter: https://wikiquiz-backend.onrender.com
   ```

6. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   - Add: `VITE_API_URL` = `https://wikiquiz-backend.onrender.com`

6. Click **"Deploy"**

7. **Get your URL**: `https://wikiquiz-ai.vercel.app`

---

## Part 4: Final Configuration

### 1. Update Backend CORS

Go back to Render backend service:
1. Go to **"Environment"** tab
2. Update `CORS_ORIGINS`:
   ```
   https://wikiquiz-ai.vercel.app,http://localhost:5173
   ```
3. Save changes (service will redeploy)

### 2. Test Production Application

1. Visit your Vercel URL: `https://wikiquiz-ai.vercel.app`
2. Generate a quiz
3. Check history
4. Verify all features work

---

## Part 5: Custom Domain (Optional)

### Vercel Custom Domain

1. In Vercel project settings → **"Domains"**
2. Add your domain: `wikiquiz.yourdomain.com`
3. Follow DNS configuration instructions
4. Update backend CORS_ORIGINS with new domain

### Render Custom Domain

1. In Render service settings → **"Custom Domain"**
2. Add: `api.wikiquiz.yourdomain.com`
3. Configure DNS
4. Update frontend `VITE_API_URL`

---

## Monitoring & Maintenance

### Render Dashboard
- View logs: Service → **"Logs"** tab
- Monitor usage: **"Metrics"** tab
- Database backups: Database → **"Backups"**

### Vercel Dashboard
- View deployments: Project → **"Deployments"**
- Analytics: **"Analytics"** tab
- Logs: Deployment → **"Logs"**

---

## Environment Variables Summary

### Backend (Render)
```env
DATABASE_URL=postgresql://user:pass@host/db
GEMINI_API_KEY=your_api_key
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Troubleshooting Deployment

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `requirements.txt` is in `backend/` directory
- Check start command uses `$PORT` variable

### Database connection fails
- Verify DATABASE_URL is the **Internal** URL
- Check database is in same region as backend
- Ensure database is running (not suspended)

### Frontend can't connect to backend
- Check CORS_ORIGINS includes frontend URL
- Verify VITE_API_URL is correct
- Check backend is running and accessible
- Look for CORS errors in browser console

### Free tier limitations
- **Render Free**: 
  - Services spin down after 15 min inactivity
  - First request may be slow (cold start)
  - 750 hours/month limit
  
- **Vercel Free**:
  - 100 GB bandwidth/month
  - Unlimited deployments

---

## Production Checklist

- [ ] Database deployed and accessible
- [ ] Backend deployed and running
- [ ] Database initialized (`init_db.py` run)
- [ ] Frontend deployed
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Test quiz generation works
- [ ] Test history feature works
- [ ] All bonus features working
- [ ] Screenshots taken
- [ ] Screen recording created

---

## Submission URLs

After deployment, you'll have:

1. **GitHub Repository**: `https://github.com/yourusername/wikiquiz-ai`
2. **Frontend URL**: `https://wikiquiz-ai.vercel.app`
3. **Backend URL**: `https://wikiquiz-backend.onrender.com`
4. **API Docs**: `https://wikiquiz-backend.onrender.com/docs`

---

## Cost Optimization

### Free Tier Usage
- Both Render and Vercel offer generous free tiers
- Sufficient for development and demonstration
- No credit card required initially

### Upgrade Considerations
- Render Starter ($7/month): No spin-down, better performance
- Vercel Pro ($20/month): More bandwidth, better analytics
- Render PostgreSQL ($7/month): More storage, better performance

---

**Your WikiQuiz AI is now live! 🚀**

Share your deployed application:
- Frontend: https://wikiquiz-ai.vercel.app
- API Docs: https://wikiquiz-backend.onrender.com/docs
