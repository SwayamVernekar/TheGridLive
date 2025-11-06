# MongoDB Setup & Data Import Guide

## 📋 Prerequisites

You already have MongoDB installed at: `/opt/homebrew/bin/mongod`

## 🚀 Step 1: Start MongoDB

### Option A: Start MongoDB Manually (Recommended for testing)

Open a **new terminal window** and run:

```bash
# Create data directory if it doesn't exist
mkdir -p ~/data/db

# Start MongoDB (this will run in foreground)
mongod --dbpath ~/data/db
```

**Keep this terminal open** - MongoDB will run here and show logs.

### Option B: Start MongoDB as a Background Service

```bash
# Using Homebrew services
brew services start mongodb/brew/mongodb-community

# Or if you have mongodb-community formula:
brew services start mongodb-community
```

Check if MongoDB is running:
```bash
# Should return a process ID if running
pgrep mongod

# Or check the service status
brew services list
```

---

## 🔍 Step 2: Verify MongoDB is Running

Test the connection:
```bash
# This should connect without errors
mongosh
# Then type: exit
```

Or check if the port is open:
```bash
lsof -i:27017
```

You should see MongoDB listening on port 27017.

---

## 💾 Step 3: Download & Install MongoDB Compass

### Download MongoDB Compass

1. Go to: https://www.mongodb.com/try/download/compass
2. Select **macOS** platform
3. Download and install the `.dmg` file
4. Open **MongoDB Compass** application

---

## 🔗 Step 4: Connect to MongoDB with Compass

### In MongoDB Compass:

1. **Connection String**: Use this URI:
   ```
   mongodb://localhost:27017/f1app
   ```

2. Click **"Connect"** button

3. You should see the database **f1app** (it will be empty initially)

---

## 📥 Step 5: Import Data Using MongoDB Compass

### Method 1: Import CSV Files (If you have CSV files)

#### 5.1 Find Your CSV Files

Check if you have CSV data in the project:
```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive
find . -name "*.csv" | head -20
```

#### 5.2 Import Each CSV in Compass

For each collection (e.g., drivers, teams, schedule):

1. In Compass, click **"CREATE DATABASE"**
   - Database name: `f1app`
   - Collection name: `drivers` (or teams, schedule, etc.)

2. Open the collection (click on it)

3. Click **"ADD DATA"** → **"Import JSON or CSV file"**

4. Select your CSV file

5. **Configure Import:**
   - File Type: CSV
   - Select options (header row, delimiter, etc.)
   - Click **"Import"**

6. **Repeat** for each collection:
   - `drivers` - driver information
   - `driver_standings` - championship standings
   - `teams` - team information
   - `constructor_standings` - team standings
   - `schedule` - race schedule
   - `race_results` - race results

### Method 2: Import Using mongoimport Command (Alternative)

If you have CSV files, you can import via terminal:

```bash
# Import drivers
mongoimport --db f1app --collection drivers --type csv --headerline --file /path/to/drivers.csv

# Import schedule
mongoimport --db f1app --collection schedule --type csv --headerline --file /path/to/schedule.csv

# Import driver standings
mongoimport --db f1app --collection driver_standings --type csv --headerline --file /path/to/driver_standings.csv
```

---

## 🔄 Step 6: Populate Data via API (Easiest Method)

If you don't have CSV files, you can populate MongoDB automatically:

### 6.1 Restart the Python FastF1 Service

Open a new terminal:
```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive/f1-data-service
python3 python_server.py
```

### 6.2 Restart the Backend

The backend will now connect to MongoDB:
```bash
cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
node server.js
```

### 6.3 Call Each Endpoint Once

This will fetch from FastF1 and save to MongoDB:

```bash
# Driver standings (will save to MongoDB)
curl "http://localhost:5002/api/data/standings/drivers?year=2024"

# Constructor standings
curl "http://localhost:5002/api/data/standings/constructors?year=2024"

# Drivers
curl "http://localhost:5002/api/data/drivers?year=2024"

# Teams
curl "http://localhost:5002/api/data/teams?year=2024"

# Schedule
curl "http://localhost:5002/api/data/schedule?year=2024"
```

### 6.4 Verify in Compass

Go back to MongoDB Compass and refresh. You should see data in the collections!

---

## 🎯 Quick Start (Recommended Path)

**If you want to get started quickly without CSV imports:**

1. **Terminal 1** - Start MongoDB:
   ```bash
   mkdir -p ~/data/db
   mongod --dbpath ~/data/db
   ```

2. **Terminal 2** - Start Python FastF1:
   ```bash
   cd /Users/swayam.vernekar/Desktop/TheGridLive/f1-data-service
   python3 python_server.py
   ```

3. **Terminal 3** - Start Backend:
   ```bash
   cd /Users/swayam.vernekar/Desktop/TheGridLive/backend
   node server.js
   ```

4. **Terminal 4** - Populate Database:
   ```bash
   curl "http://localhost:5002/api/data/standings/drivers?year=2024"
   curl "http://localhost:5002/api/data/schedule?year=2024"
   ```

5. **MongoDB Compass** - View the data:
   - Connect to: `mongodb://localhost:27017/f1app`
   - Browse collections: `driver_standings`, `schedule`, etc.

---

## 🛠️ Troubleshooting

### MongoDB won't start
```bash
# Check if port 27017 is in use
lsof -i:27017

# Kill any existing process
lsof -ti:27017 | xargs kill -9

# Try starting again
mkdir -p ~/data/db
mongod --dbpath ~/data/db
```

### Can't connect with Compass
- Make sure MongoDB is running (check Terminal 1)
- Use connection string: `mongodb://localhost:27017`
- Try without database name: `mongodb://localhost:27017`

### No data in MongoDB
- Make sure Python FastF1 service is running
- Make sure you've called the API endpoints
- Check backend logs for MongoDB connection confirmation
- Verify `MONGO_URI` in backend/.env is correct

### FastF1 Service Issues
```bash
# Check if running
lsof -i:5003

# View requirements
cd f1-data-service
cat requirements.txt

# Install dependencies
pip3 install -r requirements.txt
```

---

## 📊 Verifying Everything Works

Once setup is complete, test the full stack:

```bash
# 1. Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# 2. Check FastF1 API
curl http://localhost:5003/api/v1/health

# 3. Check Backend
curl http://localhost:5002/api/health

# 4. Check data in MongoDB
mongosh f1app --eval "db.driver_standings.countDocuments()"
```

All commands should return successful responses!

---

## 💡 Pro Tips

1. **Keep MongoDB running** in a separate terminal for easy monitoring
2. **Use MongoDB Compass** to browse and query data visually
3. **Call API endpoints** periodically to keep data fresh
4. **Monitor logs** in all three terminals for errors
5. **Check cache** - data is cached for 5 minutes in the backend

---

## 📝 Summary

You now have three data sources working together:
1. **FastF1 API** (Python) - Real-time F1 data
2. **MongoDB** - Persistent storage & fallback
3. **Memory Cache** - Fast response times

The system is resilient: if FastF1 is down, MongoDB serves as backup!
