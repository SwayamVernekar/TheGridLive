# 🚀 Deployment Guide: TheGridLive

Complete step-by-step guide to deploy your F1 application to **Render** (backend) and **Vercel** (frontend).

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ MongoDB Atlas database set up with data uploaded
- ✅ GitHub account
- ✅ Render account (free tier available)
- ✅ Vercel account (free tier available)
- ✅ Your code pushed to a GitHub repository

---

## 🎯 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Commit all changes to GitHub:**
   ```bash
   cd /Users/swayam.vernekar/Desktop/TheGridLive
   git add .
   git commit -m "Prepare for deployment: Add Render and Vercel configs"
   git push origin mongo-backend
   ```

### Step 2: Create Render Account & Deploy

1. **Go to Render:** https://render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → Select **"Web Service"**
4. **Connect your GitHub repository:**
   - Find and select: `SwayamVernekar/TheGridLive`
   - Click **"Connect"**

### Step 3: Configure Render Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `thegridlive-backend`
- **Region:** `Oregon (US West)` (or closest to you)
- **Branch:** `mongo-backend`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (starts with 0.1 CPU, 512 MB RAM)

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URI` | `mongodb+srv://swayamvernekar:<password>@cluster0.ytnvzov.mongodb.net/f1app?retryWrites=true&w=majority&appName=Cluster0` | Replace `<password>` with your actual password |
| `FRONTEND_URL` | Leave blank for now | We'll update this after deploying frontend |
| `FASTF1_API_URL` | `http://localhost:5003/api/v1` | Optional - won't work without Python service |
| `NODE_VERSION` | `18.17.0` | Ensures compatible Node.js version |

**Important:** Make sure to replace `<password>` in MONGO_URI with your actual MongoDB Atlas password!

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will start building and deploying (takes 2-5 minutes)
3. Watch the logs - you should see:
   - `npm install` running
   - `npm start` executing
   - `✅ MongoDB connected`
   - `✅ Server running on port XXXX`

### Step 6: Get Your Backend URL

Once deployed, you'll see your backend URL at the top:
```
https://thegridlive-backend.onrender.com
```

**Save this URL!** You'll need it for the frontend.

**Test it:** Visit `https://thegridlive-backend.onrender.com/api/health`
- You should see: `{"status":"healthy","mongodb":"connected",...}`

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Production Environment File

1. **Create frontend/.env file:**
   ```bash
   cd /Users/swayam.vernekar/Desktop/TheGridLive/frontend
   cp .env.example .env
   ```

2. **Edit frontend/.env:**
   ```bash
   VITE_API_URL=https://thegridlive-backend.onrender.com
   ```
   
   ⚠️ Replace with your actual Render URL from Part 1, Step 6

3. **Commit this change:**
   ```bash
   git add .env
   git commit -m "Add production environment config"
   git push origin mongo-backend
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel:** https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New..."** → **"Project"**
4. **Import your repository:**
   - Find: `SwayamVernekar/TheGridLive`
   - Click **"Import"**

### Step 3: Configure Vercel Project

**Framework Preset:** Auto-detected as **Vite** ✅

**Build and Output Settings:**
- Root Directory: `frontend`
- Build Command: `npm run build` (should be auto-detected)
- Output Directory: `dist` (should be auto-detected)
- Install Command: `npm install` (should be auto-detected)

**Environment Variables:**

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://thegridlive-backend.onrender.com` |

⚠️ Replace with your actual Render backend URL!

### Step 4: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repo
   - Install dependencies
   - Build your Vite app
   - Deploy to CDN (takes 1-3 minutes)

3. Once complete, you'll get a URL like:
   ```
   https://the-grid-live.vercel.app
   ```

---

## 🔄 Part 3: Update Backend CORS

Now that you have your frontend URL, update the backend to allow requests from it:

### Step 1: Update Render Environment Variables

1. Go back to **Render Dashboard**
2. Click on your **thegridlive-backend** service
3. Go to **"Environment"** tab
4. Find the `FRONTEND_URL` variable
5. Update its value to your Vercel URL:
   ```
   https://the-grid-live.vercel.app
   ```
6. Click **"Save Changes"**
7. Render will automatically redeploy with the new configuration

---

## ✅ Part 4: Verify Deployment

### Backend Health Check:
Visit: `https://thegridlive-backend.onrender.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-11-07T..."
}
```

### Test API Endpoints:
- Driver Standings: `https://thegridlive-backend.onrender.com/api/data/standings/drivers`
- Schedule: `https://thegridlive-backend.onrender.com/api/data/schedule`

### Frontend:
Visit your Vercel URL: `https://the-grid-live.vercel.app`

**Test these features:**
1. ✅ Home page loads
2. ✅ Standings page shows drivers with correct points
3. ✅ Race Results page displays data
4. ✅ Live Timing page shows schedule
5. ✅ Chat works (if you have username set)

---

## 🎉 Deployment Complete!

Your F1 application is now live on:
- **Backend:** https://thegridlive-backend.onrender.com
- **Frontend:** https://the-grid-live.vercel.app

---

## 🚨 Important Notes

### Render Free Tier Limitations:
- **Cold Starts:** Service spins down after 15 mins of inactivity
- **First request** after sleep takes 30-60 seconds to wake up
- **750 hours/month** of free runtime

**Solution:** Ping your backend every 10 minutes to keep it alive:
```javascript
// Add to frontend or use a service like UptimeRobot
setInterval(() => {
  fetch('https://thegridlive-backend.onrender.com/api/health');
}, 10 * 60 * 1000); // Every 10 minutes
```

### Vercel Free Tier:
- **100 GB bandwidth/month**
- **Unlimited deployments**
- **Automatic HTTPS**
- **Global CDN**

---

## 🔧 Troubleshooting

### Issue: Frontend can't connect to backend
**Solution:** Check CORS settings
1. Verify `FRONTEND_URL` in Render environment variables
2. Make sure it matches your exact Vercel URL (no trailing slash)
3. Check browser console for CORS errors

### Issue: MongoDB connection failed
**Solution:** Check connection string
1. Verify `MONGO_URI` in Render dashboard
2. Ensure password is correct (no `<` `>` brackets)
3. Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)

### Issue: Build fails on Render
**Solution:** Check logs
1. Go to Render dashboard → Your service → Logs
2. Look for errors during `npm install` or `npm start`
3. Common fix: Ensure `package.json` has correct `"type": "module"`

### Issue: Frontend shows blank page
**Solution:** Check Vercel logs
1. Go to Vercel dashboard → Your project → Deployments
2. Click on latest deployment → View Logs
3. Check for build errors or missing environment variables

---

## 🔄 Making Updates

### Update Backend:
```bash
# Make changes to backend code
git add backend/
git commit -m "Update backend feature"
git push origin mongo-backend
# Render auto-deploys on push!
```

### Update Frontend:
```bash
# Make changes to frontend code
git add frontend/
git commit -m "Update frontend feature"
git push origin mongo-backend
# Vercel auto-deploys on push!
```

---

## 📊 Monitoring

### Render Dashboard:
- View logs in real-time
- Monitor CPU/Memory usage
- See request counts

### Vercel Dashboard:
- View deployment history
- Monitor bandwidth usage
- Check build logs

---

## 🎯 Next Steps (Optional)

1. **Add Custom Domain:**
   - Vercel: Settings → Domains → Add your domain
   - Render: Settings → Custom Domain

2. **Set up Monitoring:**
   - Use UptimeRobot to monitor uptime
   - Set up Sentry for error tracking

3. **Upgrade Plans:**
   - Render Pro: $7/month (no cold starts)
   - Vercel Pro: $20/month (more bandwidth)

---

## 🆘 Need Help?

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com

---

**Made with ❤️ for F1 fans**

🏎️ Happy Racing! 🏁
