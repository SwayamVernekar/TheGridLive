# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] MongoDB Atlas database set up and populated with data
- [ ] Code pushed to GitHub repository
- [ ] Render account created
- [ ] Vercel account created

---

## 📦 Backend (Render)

### Configuration:
```
Service Type: Web Service
Runtime: Node
Root Directory: backend
Build Command: npm install
Start Command: npm start
Branch: mongo-backend
```

### Environment Variables:
```bash
MONGO_URI=mongodb+srv://swayamvernekar:<password>@cluster0.ytnvzov.mongodb.net/f1app?retryWrites=true&w=majority&appName=Cluster0
NODE_VERSION=18.17.0
FRONTEND_URL=<your-vercel-url>
FASTF1_API_URL=http://localhost:5003/api/v1
```

### Test URL:
```
https://thegridlive-backend.onrender.com/api/health
```

---

## 🎨 Frontend (Vercel)

### Configuration:
```
Framework: Vite (auto-detected)
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### Environment Variable:
```bash
VITE_API_URL=https://thegridlive-backend.onrender.com
```

### After Deployment:
1. Copy your Vercel URL
2. Go back to Render
3. Update `FRONTEND_URL` environment variable
4. Save (auto-redeploys)

---

## 🔗 Deployment Order:

1. **Deploy Backend First** → Get backend URL
2. **Deploy Frontend** → Use backend URL in `VITE_API_URL`
3. **Update Backend CORS** → Add frontend URL to `FRONTEND_URL`

---

## 🧪 Quick Test Commands:

```bash
# Test Backend Health
curl https://thegridlive-backend.onrender.com/api/health

# Test Driver Standings
curl https://thegridlive-backend.onrender.com/api/data/standings/drivers

# Test Schedule
curl https://thegridlive-backend.onrender.com/api/data/schedule
```

---

## 📝 Important URLs:

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** https://github.com/SwayamVernekar/TheGridLive

---

## ⚡ Commands to Run:

```bash
# Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin mongo-backend

# Create frontend .env (before Vercel deploy)
cd frontend
cp .env.example .env
# Edit .env with your Render backend URL
```

---

## 🚨 Remember:

✅ Replace `<password>` in MONGO_URI with actual password  
✅ No trailing slash in URLs  
✅ Update FRONTEND_URL after deploying to Vercel  
✅ Wait for Render redeploy after updating env vars  

---

**Need detailed steps? See DEPLOYMENT_GUIDE.md**
