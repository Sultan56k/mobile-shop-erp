# 🚀 Railway Deployment Guide

## ✅ Project is Ready for Railway!

All configuration files have been created. Follow these steps to deploy.

---

## 📋 Prerequisites

1. **GitHub Account** (free - github.com)
2. **Railway Account** (free - railway.app) - $5/month credit
3. **Git installed** on your computer

---

## 🚀 QUICK DEPLOYMENT (5 Steps)

### **Step 1: Push to GitHub**

```bash
cd F:\erp

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"
```

**Create GitHub Repository:**
1. Go to https://github.com/new
2. Name: `mobile-shop-erp`
3. Set to **Private** (for client testing)
4. Click "Create repository"
5. **DON'T** initialize with README

**Push to GitHub:**
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mobile-shop-erp.git

# Push
git branch -M main
git push -u origin main
```

---

### **Step 2: Sign Up for Railway**

1. Go to https://railway.app
2. Click "Login"
3. Sign in with **GitHub**
4. Authorize Railway to access your repositories

---

### **Step 3: Create Backend Service**

1. Click "**New Project**"
2. Select "**Deploy from GitHub repo**"
3. Choose `mobile-shop-erp`
4. Click "**Deploy Now**"

**Configure Backend:**
1. Click on the service that was created
2. Go to **Settings** tab
3. Set the following:
   - **Name**: `mobile-shop-erp-backend`
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`

4. Go to **Variables** tab
5. Click "**+ New Variable**"
6. Add these variables:
   ```
   NODE_ENV = production
   PORT = 5000
   ```

7. Click "**Deploy**" (top right)

**Wait for deployment** (2-3 minutes)

---

### **Step 4: Create Frontend Service**

1. In your Railway project, click "**+ New**"
2. Select "**GitHub Repo**"
3. Choose the **same repository** (`mobile-shop-erp`)

**Configure Frontend:**
1. Click on the new service
2. Go to **Settings** tab
3. Set the following:
   - **Name**: `mobile-shop-erp-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Go to **Variables** tab
5. Click "**+ New Variable**"
6. Add this variable:
   ```
   VITE_API_URL = ${{mobile-shop-erp-backend.RAILWAY_STATIC_URL}}/api
   ```

   **Note:** Railway will auto-replace the service reference!

7. Click "**Deploy**"

**Wait for deployment** (2-3 minutes)

---

### **Step 5: Seed Database**

**Option A: Use Railway Dashboard**

1. Click on **Backend service**
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Go to **Logs** tab
5. The database should auto-initialize on first run

**Option B: Use Railway CLI (if needed)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Select backend service
railway service

# Run seed command
railway run npm run db:seed
```

---

## 🎯 Access Your Deployed App

### **Get URLs:**

1. Go to Railway dashboard
2. Click on **Frontend service**
3. Go to **Settings** → **Networking**
4. Click "**Generate Domain**"
5. You'll get a URL like: `https://mobile-shop-erp-frontend.railway.app`

**Open the URL in browser!** 🎉

### **Login:**
- Username: `admin`
- Password: `admin123`
- **⚠️ Change password immediately!**

---

## 🔧 Troubleshooting

### **Backend won't start:**

**Check Logs:**
1. Click Backend service
2. Go to **Deployments** → **View Logs**
3. Look for errors

**Common Issues:**
- ❌ **"Cannot find module"** → Delete service, redeploy
- ❌ **Port already in use** → Railway handles this automatically
- ❌ **Database error** → Check database directory is created

**Solution:**
```bash
# Verify package.json in backend folder
# Ensure all dependencies are listed
```

---

### **Frontend can't connect to backend:**

**Check API URL:**
1. Frontend service → **Variables**
2. Verify `VITE_API_URL` is set correctly
3. Should be: `${{mobile-shop-erp-backend.RAILWAY_STATIC_URL}}/api`

**Check CORS:**
- Backend automatically allows Railway URLs
- Check backend logs for CORS errors

**Browser Console:**
- Open DevTools (F12)
- Check Network tab for API calls
- Look for CORS or 404 errors

---

### **Database not persisting:**

**Railway provides persistent volumes:**
1. Backend service → **Data** tab
2. Verify volume is created
3. Path should be: `/app/backend/database`

**If database resets:**
- Check deployment logs
- Verify `database` folder is not in .gitignore (it's excluded by file, not folder)
- Railway volumes persist across deploys

---

### **Changes not reflecting:**

**Force redeploy:**
1. Make any small change in code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
3. Railway auto-deploys on push

**Manual redeploy:**
1. Service → **Deployments**
2. Click "**Redeploy**" on latest deployment

---

## 💰 Railway Pricing

### **Hobby Plan (Free):**
- ✅ **$5 credit per month** (enough for testing!)
- ✅ 2 services (backend + frontend)
- ✅ Persistent storage
- ✅ Custom domains
- ✅ HTTPS included

### **Usage Estimate:**
- Backend: ~$2-3/month
- Frontend: ~$1-2/month
- **Total: ~$3-5/month** (covered by free credit!)

### **If you exceed free tier:**
- Pro plan: $5/month + usage
- Pay-as-you-go pricing

---

## 🔄 Updating Your App

**After making changes locally:**

```bash
# 1. Test locally first
cd F:\erp\backend
npm run dev

# (in new terminal)
cd F:\erp\frontend
npm run dev

# 2. If everything works, commit and push
git add .
git commit -m "Add new feature"
git push

# 3. Railway auto-deploys! (takes 2-3 minutes)
```

**Watch deployment:**
- Railway dashboard → Service → Deployments
- Click on deployment to see live logs

---

## 📊 Monitoring

### **View Logs:**
1. Service → **Deployments**
2. Click on active deployment
3. **View Logs** (real-time)

### **Check Metrics:**
1. Service → **Metrics**
2. See CPU, Memory, Network usage

### **Set up Alerts:**
1. Service → **Settings** → **Alerts**
2. Get notified of deployment failures

---

## 🔒 Security Best Practices

### **After First Deployment:**

1. **Change Admin Password:**
   - Login immediately
   - Go to user menu → Change Password
   - Use strong password (12+ characters)

2. **Review Environment Variables:**
   - Don't commit `.env` files
   - Keep secrets in Railway Variables
   - Regenerate JWT secret if exposed

3. **Set up Custom Domain (Optional):**
   - Railway → Settings → Networking
   - Add custom domain
   - Configure DNS

---

## 📱 Mobile Access

**Your deployed app works on mobile!**

1. Open Railway URL on phone browser
2. Login with credentials
3. Responsive design adapts to screen size
4. All features work on mobile

---

## 🎯 Deployment Checklist

Before sharing with client:

- [ ] Pushed to GitHub
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Railway
- [ ] Database seeded (admin user created)
- [ ] Both services have public URLs
- [ ] Can access frontend URL in browser
- [ ] Can login successfully
- [ ] Can add mobile (IMEI validation works)
- [ ] Can create sale
- [ ] Dashboard shows data
- [ ] Changed admin password
- [ ] Tested on mobile device

---

## 🎉 You're Done!

**Your app is now live and accessible from anywhere!**

**Share with client:**
- URL: `https://your-app.railway.app`
- Username: `admin`
- Password: `[your-new-secure-password]`

**What client can do:**
- Access from any device
- Test all features
- Add real data
- Give feedback

---

## 📞 Support

**Railway Issues:**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

**App Issues:**
- Check deployment logs
- Review error messages
- Test locally first

---

## 🔄 Alternative: Deploy Frontend Only

**If you want backend to stay local:**

1. Keep backend running on your PC
2. Deploy only frontend to Railway
3. Update CORS to allow Railway URL
4. Frontend connects to your PC's backend

**Not recommended for client testing** (your PC must stay on)

---

## ✅ Summary

**What you get:**
- ✅ Public URL (shareable)
- ✅ HTTPS (secure)
- ✅ Auto-deploy on git push
- ✅ Persistent database
- ✅ 99.9% uptime
- ✅ Mobile responsive
- ✅ Fast global access

**Deployment time:**
- First time: 10-15 minutes
- Updates: 2-3 minutes (automatic)

**Cost:**
- Free for testing (with $5 credit)
- ~$3-5/month for production

---

**Your Mobile Shop ERP is now deployed and ready for client testing!** 🚀✨
