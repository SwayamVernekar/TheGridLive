# MongoDB Atlas Setup Guide - Cloud Migration

## 📋 Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with:
   - Email
   - Google account
   - Or GitHub account

## 🌟 Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier:
   - ✅ 512 MB storage
   - ✅ Shared RAM
   - ✅ No credit card required

3. **Choose Cloud Provider & Region:**
   - Provider: AWS, Google Cloud, or Azure
   - Region: Choose closest to you (e.g., `us-east-1` or your region)
   - Cluster Name: `TheGridLive` (or keep default)

4. Click **"Create"** (takes 3-5 minutes)

## 🔐 Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"+ ADD NEW DATABASE USER"**
3. Choose **"Password"** authentication
4. Set credentials:
   ```
   Username: thegridlive
   Password: [Generate strong password and save it!]
   ```
5. **Database User Privileges:** Select `readWriteAnyDatabase`
6. Click **"Add User"**

⚠️ **SAVE YOUR PASSWORD!** You'll need it for the connection string.

## 🌐 Step 4: Whitelist Your IP Address

1. Click **"Network Access"** in left sidebar
2. Click **"+ ADD IP ADDRESS"**
3. Options:
   - **For Testing:** Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
   - **For Production:** Add your specific IP
4. Click **"Confirm"**

⚠️ For production, restrict to specific IPs for security!

## 🔗 Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 4.1 or later
6. **Copy the connection string:**
   ```
   mongodb+srv://thegridlive:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Replace `<password>`** with your actual password
8. **Add database name** at the end:
   ```
   mongodb+srv://thegridlive:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/f1app?retryWrites=true&w=majority
   ```

## 💾 Step 6: Update Backend Environment Variables

Update your `.env` file in the backend:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://thegridlive:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/f1app?retryWrites=true&w=majority

# Other settings
PORT=5002
PYTHON_API_URL=http://localhost:5003/api/v1
NEWS_API_KEY=your_news_api_key_here
```

## 📤 Step 7: Upload Data to Atlas

### Option A: Using the Upload Script (Recommended)

1. Make sure your `.env` has the Atlas connection string
2. Run the upload script:
   ```bash
   cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
   node scripts/upload-csvs-to-mongo.js
   ```

### Option B: Using MongoDB Compass

1. Open MongoDB Compass
2. **Disconnect from local:** Click current connection → Disconnect
3. **Connect to Atlas:**
   - Click "New Connection"
   - Paste your Atlas connection string
   - Click "Connect"
4. **Import data:**
   - Select `f1app` database
   - For each collection, use "Add Data" → "Import File"
   - Select corresponding CSV files

### Option C: Export from Local & Import to Atlas

```bash
# Export from local MongoDB
mongodump --db f1app --out ~/f1app-backup

# Import to MongoDB Atlas
mongorestore --uri="mongodb+srv://thegridlive:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/f1app" ~/f1app-backup/f1app
```

## ✅ Step 8: Test Connection

1. **Restart your backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Check health:**
   ```bash
   curl http://localhost:5002/api/health
   ```

3. **Should see:**
   ```json
   {
     "status": "healthy",
     "backend": "running",
     "mongodb": "connected",
     ...
   }
   ```

## 🎯 Step 9: Deploy Backend to Cloud (Optional)

Once Atlas is working locally, you can deploy backend to:

- **Heroku** - Easy deployment
- **Railway** - Modern platform
- **Render** - Free tier available
- **Vercel** - Serverless functions
- **AWS/Azure/GCP** - Full control

## 📊 MongoDB Atlas Dashboard Features

- **Real-time monitoring**
- **Performance metrics**
- **Automated backups**
- **Query profiler**
- **Connection limits**
- **Database size tracking**

## 🔧 Troubleshooting

### Connection Timeout
- Check Network Access whitelist
- Verify password in connection string
- Check if cluster is running

### Authentication Failed
- Verify username/password
- Check user has correct permissions
- Ensure password is URL-encoded if it has special characters

### Can't Find Database
- Add database name to connection string
- Upload data first
- Check in Atlas dashboard

## 💡 Pro Tips

1. **Use Environment Variables:** Never commit connection strings to git
2. **Enable Monitoring:** Check Atlas dashboard regularly
3. **Set Alerts:** Configure email alerts for issues
4. **Backup Regularly:** Atlas has automatic backups (on paid tiers)
5. **Optimize Queries:** Use Atlas Performance Advisor

## 🆓 Free Tier Limits

- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** 500 max concurrent
- **No credit card required**
- **Perfect for development & small apps**

## 🚀 Ready to Upgrade?

If you need more:
- M10: $0.08/hr (~$57/month) - Dedicated cluster
- M20: $0.20/hr (~$147/month) - More RAM/storage
- M30+: Custom pricing

---

## Quick Start Commands

```bash
# 1. Update .env with Atlas URI
# 2. Upload data
cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
node scripts/upload-csvs-to-mongo.js

# 3. Start backend
node server.js

# 4. Test
curl http://localhost:5002/api/health
```

Your data will now be in the cloud! ☁️🏎️
