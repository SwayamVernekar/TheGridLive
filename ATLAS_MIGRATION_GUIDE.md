# MongoDB Atlas Cloud Setup - Complete Guide

## ✅ What You Have
- Atlas Cluster Created
- Connection String: `mongodb+srv://swayamvernekar:<db_password>@cluster0.ytnvzov.mongodb.net/?appName=Cluster0`

---

## 📝 Step-by-Step Instructions

### Step 1: Set Your Database Password

1. **Replace `<db_password>` in your `.env` file**
   
   Open: `/Users/swayam.vernekar/Desktop/TheGridLive/backend/.env`
   
   Replace this line:
   ```
   MONGO_URI=mongodb+srv://swayamvernekar:<db_password>@cluster0.ytnvzov.mongodb.net/f1app?retryWrites=true&w=majority&appName=Cluster0
   ```
   
   With your actual password:
   ```
   MONGO_URI=mongodb+srv://swayamvernekar:YOUR_ACTUAL_PASSWORD@cluster0.ytnvzov.mongodb.net/f1app?retryWrites=true&w=majority&appName=Cluster0
   ```

   **Important:** 
   - Remove the angle brackets `< >`
   - If your password contains special characters (@, #, %, etc.), URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - Example: `Pass@123` becomes `Pass%40123`

### Step 2: Whitelist Your IP Address

1. Go to MongoDB Atlas Dashboard
2. Click **"Network Access"** in the left sidebar
3. Click **"Add IP Address"**
4. Choose one:
   - **"Add Current IP Address"** - For your computer only
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - For development/testing

### Step 3: Upload Data to Atlas

Run the upload script that will now connect to Atlas:

```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
node scripts/upload-csvs-to-mongo.js
```

This will upload all your CSV data from `f1data/outputs_2025/` to MongoDB Atlas.

### Step 4: Start the Backend

```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
node server.js
```

### Step 5: Verify Connection

Test the backend health endpoint:
```bash
curl http://localhost:5002/api/health
```

You should see:
```json
{
  "mongodb": "connected"
}
```

### Step 6: Start Frontend

```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive/frontend
npm install  # (if not done already)
npm run dev
```

---

## 🚀 Quick Start Script

Or use the all-in-one startup script:

```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive

# 1. Upload data to Atlas (first time only)
cd backend && node scripts/upload-csvs-to-mongo.js && cd ..

# 2. Start backend
cd backend && node server.js &

# 3. Start frontend
cd frontend && npm run dev
```

---

## 🔍 Verification Checklist

- [ ] Password replaced in `.env` file (no `< >` brackets)
- [ ] IP address whitelisted in Atlas
- [ ] CSV data uploaded successfully
- [ ] Backend shows "MongoDB connected"
- [ ] API health check returns `"mongodb": "connected"`
- [ ] Frontend can access the data

---

## 🛠️ Troubleshooting

### "Authentication failed" Error
- Check your password is correct in `.env`
- Make sure special characters are URL-encoded
- Verify username is `swayamvernekar`

### "Network error" or "Connection timeout"
- Add your IP to Atlas whitelist
- Try using `0.0.0.0/0` (allow all) temporarily

### "MongoServerError: user not found"
- Go to Atlas → Database Access
- Create a database user with username `swayamvernekar`
- Set password and remember it

### Data not showing up
- Run the upload script again
- Check MongoDB Atlas → Browse Collections
- Verify collections exist: `drivers`, `driver_standings`, `schedule`, etc.

---

## 📊 View Your Data in Atlas

1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"**
3. Select database: **f1app**
4. Browse your collections

---

## 🔐 Security Best Practices

For production:

1. **Use Environment Variables** (already done ✓)
2. **Restrict IP Access** - Only whitelist necessary IPs
3. **Create Read-Only User** for frontend if needed
4. **Rotate Passwords** regularly
5. **Never commit `.env`** to git (already in `.gitignore`)

---

## 🌐 Access Your App from Anywhere

Once deployed to Atlas:
- Your backend can run on any cloud service (Vercel, Railway, Render, etc.)
- Frontend can be deployed to Vercel/Netlify
- MongoDB Atlas handles all database scaling automatically

---

## 💡 Next Steps After Setup

1. **Deploy Backend** to Railway/Render
2. **Deploy Frontend** to Vercel
3. **Update Frontend API URL** to point to deployed backend
4. **Test from any device** - your app is now in the cloud!

---

## 📞 Need Help?

Common issues and solutions are above. If you encounter other problems:
1. Check Atlas logs in the dashboard
2. Check backend terminal for error messages
3. Verify `.env` file has correct connection string
