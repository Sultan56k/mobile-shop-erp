# 🚀 Deploy to Railway - Quick Guide

## Why Railway for This Project?

- ✅ **Supports SQLite** - No database changes needed!
- ✅ **Full-stack friendly** - Backend + Frontend together
- ✅ **Free tier** - $5/month credit (enough for testing)
- ✅ **Easy setup** - Few commands
- ✅ **Perfect for local-first apps**

---

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Railway Account** (free - sign up at railway.app)
3. **Git installed** on your computer

---

## 🔧 Step 1: Prepare Project for Deployment

### 1.1 Create Production Build Scripts

**Update `backend/package.json`:**

Add these scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npm install",
    "db:migrate": "node src/config/migrate.js",
    "db:seed": "node src/config/seed.js"
  }
}
```

### 1.2 Create Root Package.json

Create `F:\erp\package.json`:

```json
{
  "name": "mobile-shop-erp",
  "version": "1.0.0",
  "scripts": {
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3 Create .gitignore

Create `F:\erp\.gitignore`:

```
# Dependencies
node_modules/
**/node_modules/
package-lock.json

# Environment
.env
.env.local

# Build
dist/
build/
frontend/dist/

# Database (optional - include if you want fresh DB)
backend/database/erp.db
backend/database/.secrets.json

# Backups
backend/backups/*.db

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

---

## 🌐 Step 2: Update Configuration for Production

### 2.1 Update Backend Config

**Edit `backend/src/config/config.js`:**

Find the CORS section and update:

```javascript
// CORS (for local frontend)
cors: {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
},
```

### 2.2 Update Frontend API URL

**Edit `frontend/src/services/api.js`:**

Change line 4:

```javascript
// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 2.3 Create Environment Files

**Create `backend/.env.example`:**

```env
# Server
PORT=5000
NODE_ENV=production

# Frontend URL (set in Railway)
FRONTEND_URL=https://your-app.railway.app
```

**Create `frontend/.env.example`:**

```env
# Backend API URL (set in Railway)
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📤 Step 3: Push to GitHub

### 3.1 Initialize Git

```bash
cd F:\erp

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Mobile Shop ERP"
```

### 3.2 Create GitHub Repository

1. Go to https://github.com
2. Click "New Repository"
3. Name: `mobile-shop-erp`
4. Keep it **Private** (for client testing)
5. Don't initialize with README
6. Click "Create repository"

### 3.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mobile-shop-erp.git

# Push
git branch -M main
git push -u origin main
```

---

## 🚂 Step 4: Deploy to Railway

### 4.1 Sign Up for Railway

1. Go to https://railway.app
2. Click "Login"
3. Sign in with GitHub
4. Authorize Railway

### 4.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `mobile-shop-erp` repository
4. Click "Deploy Now"

### 4.3 Configure Backend Service

Railway will create one service. We need two (backend + frontend):

**Backend:**
1. Click on the deployed service
2. Click "Settings"
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `npm start`
5. Click "Variables" tab
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=${RAILWAY_STATIC_URL}
   ```

### 4.4 Add Frontend Service

1. Click "New Service" in your project
2. Select "GitHub Repo"
3. Select same repository
4. In Settings:
   - Set **Root Directory**: `frontend`
   - Set **Build Command**: `npm run build`
   - Set **Start Command**: `npx serve -s dist -l $PORT`
5. Click "Variables" tab
6. Add variable:
   ```
   VITE_API_URL=https://YOUR_BACKEND_URL.railway.app/api
   ```

### 4.5 Install Serve Package

Add to `frontend/package.json`:

```json
{
  "dependencies": {
    // ... existing dependencies
    "serve": "^14.2.1"
  }
}
```

### 4.6 Seed Database

In Backend service, go to Settings → Deploy:
1. Add deployment trigger
2. Or manually run: `npm run db:seed`

---

## ✅ Step 5: Test Deployment

1. Railway will provide URLs for both services
2. Open frontend URL: `https://your-frontend.railway.app`
3. Login with admin/admin123
4. Test all features!

---

## 🔒 Step 6: Create Production Admin

SSH into Railway backend or use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run seed
railway run npm run db:seed
```

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month
- **Pro Plan**: $5/month base + usage
- For testing: Free tier is enough!

---

## 🐛 Troubleshooting

### Backend won't start:
- Check logs in Railway dashboard
- Verify environment variables
- Check Node version (must be 18+)

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- View Network tab in browser DevTools

### Database not persisting:
- Railway provides persistent volumes
- Database file should persist across deploys
- Check Railway volumes in dashboard

---

## 📝 Alternative: One-Click Deploy

Create `railway.json` in root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🎯 Summary

**What Railway Gives You:**
- ✅ Public URL for testing
- ✅ HTTPS automatically
- ✅ Persistent SQLite database
- ✅ Easy updates (git push)
- ✅ Environment variables
- ✅ Logs and monitoring

**Perfect for:**
- ✅ Client testing
- ✅ Demos
- ✅ MVP deployment
- ✅ Small teams

---

## 🔄 Updating After Changes

```bash
git add .
git commit -m "Update features"
git push

# Railway auto-deploys!
```

---

**Deployment Status: Ready for Railway!** 🚂✨
