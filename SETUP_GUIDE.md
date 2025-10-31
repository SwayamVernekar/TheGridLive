# Complete Setup Guide - F1 Web Application

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)
7. [Common Issues](#common-issues)

---

## System Requirements

### Required Software

- **Python 3.8 or higher** - [Download](https://www.python.org/downloads/)
- **Node.js 18 or higher** - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (recommended) - [Download](https://git-scm.com/)

### Verify Installation

```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# Check MongoDB (if installed locally)
mongod --version
```

---

## Installation Steps

### Step 1: Python Data Service Setup

```bash
# Navigate to the data service directory
cd f1-data-service

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastf1; print('FastF1 version:', fastf1.__version__)"
```

**Expected Output:**
```
Successfully installed Flask-3.0.0 fastf1-3.4.0 ...
FastF1 version: 3.4.0
```

### Step 2: Node.js Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install npm dependencies
npm install

# Create .env file from example
cp .env.example .env

# (Optional) Edit .env if you have custom MongoDB URI
nano .env
```

**Expected Output:**
```
added 150 packages in 10s
```

### Step 3: React Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Create .env file (optional)
cp .env.example .env
```

**Expected Output:**
```
added 500+ packages in 30s
```

---

## Configuration

### Python Service Configuration

The Python service runs on port **5003** by default. No additional configuration needed unless you want to change the port.

To change port, edit `f1-data-service/python_server.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)  # Change 5003 to your port
```

### Backend Configuration

Edit `backend/.env`:

```env
# Server port
PORT=5001

# MongoDB connection string
# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/f1app

# Or MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/f1app

# Python Data Service URL
PYTHON_API_URL=http://localhost:5003/api/v1
```

### Frontend Configuration

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5001
```

---

## Running the Application

### Method 1: Automatic Startup (Recommended)

Use the provided startup script:

```bash
# Make script executable (first time only)
chmod +x start-all.sh

# Run the script
./start-all.sh
```

This will:
1. ✅ Check if all dependencies are installed
2. ✅ Start Python service on port 5003
3. ✅ Start Node.js backend on port 5001
4. ✅ Start React frontend on port 5173
5. ✅ Open browser automatically

### Method 2: Manual Startup

Open **three separate terminal windows**:

**Terminal 1 - Python Service:**
```bash
cd f1-data-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python python_server.py
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### Expected Console Output

**Python Service (Terminal 1):**
```
 * Running on http://0.0.0.0:5003
 * Debug mode: on
INFO:__main__:Starting F1 Data Service on port 5003
```

**Node.js Backend (Terminal 2):**
```
🏎️  F1 Backend Server running on port 5001
📊 Proxying F1 data requests to: http://localhost:5003/api/v1
🗄️  MongoDB: mongodb://localhost:27017/f1app
MongoDB connected
```

**React Frontend (Terminal 3):**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Testing the Integration

### 1. Test Python Service

```bash
# Health check
curl http://localhost:5003/api/v1/health

# Expected response:
{
  "status": "healthy",
  "service": "F1 Data Service",
  "version": "1.0.0"
}
```

### 2. Test Backend API

```bash
# Health check (tests both backend and Python service)
curl http://localhost:5001/api/health

# Expected response:
{
  "backend": "healthy",
  "pythonService": "healthy",
  "pythonServiceVersion": "1.0.0"
}

# Test driver standings
curl http://localhost:5001/api/data/standings
```

### 3. Test Frontend

1. Open browser to `http://localhost:5173`
2. You should see the F1 app homepage
3. Navigate to "Drivers" - should load live driver data
4. Navigate to "Standings" - should show real-time standings

**Look for these indicators:**
- ✅ Loading spinner appears briefly
- ✅ Real driver data loads (not mock data)
- ✅ Team colors display correctly
- ✅ No error messages in browser console

---

## Troubleshooting

### Python Service Issues

**Issue: ModuleNotFoundError: No module named 'fastf1'**

Solution:
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

**Issue: Port 5003 already in use**

Solution:
```bash
# Find process using port 5003
lsof -i :5003  # macOS/Linux
netstat -ano | findstr :5003  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Issue: FastF1 data not loading**

Solution:
```bash
# Clear cache
rm -rf f1-data-service/cache

# Try using 2024 data (current season may not have data yet)
# Access: http://localhost:5003/api/v1/standings?year=2024
```

### Backend Issues

**Issue: Cannot connect to Python service**

Check:
```bash
# Is Python service running?
curl http://localhost:5003/api/v1/health

# Check backend .env file
cat backend/.env | grep PYTHON_API_URL
# Should show: PYTHON_API_URL=http://localhost:5003/api/v1
```

**Issue: MongoDB connection failed**

Solutions:
```bash
# Local MongoDB not running?
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
# Get connection string from: https://cloud.mongodb.com
# Update backend/.env with Atlas URI
```

### Frontend Issues

**Issue: API calls failing (CORS errors)**

Check browser console. If you see CORS errors:
1. Ensure backend is running on port 5001
2. Check frontend .env: `VITE_API_URL=http://localhost:5001`
3. Restart frontend: `Ctrl+C` then `npm run dev`

**Issue: Data not loading (shows loading spinner forever)**

Check:
```bash
# Backend health check
curl http://localhost:5001/api/health

# Frontend environment variable
echo $VITE_API_URL  # Should be http://localhost:5001
```

---

## Common Issues

### 1. First Run Takes Long Time

**This is normal!** FastF1 downloads and caches race data on first run. Subsequent runs will be much faster.

### 2. No Data for Current Season

If it's early in the F1 season, use previous year's data:
```jsx
// In frontend code, change default year:
const [season, setSeason] = useState(2024);  // Instead of new Date().getFullYear()
```

### 3. Images Not Loading

The app uses Unsplash dynamic images. If images don't load:
- Check internet connection
- Unsplash may have rate limits (rare)
- Images are based on search terms + driver number (variation is normal)

### 4. MongoDB Not Installed

You can run the app without MongoDB (user features won't work):
- Python service will work fine
- Backend will start (but show MongoDB connection error)
- Frontend will work for all F1 data pages

To add MongoDB later:
```bash
# macOS:
brew install mongodb-community

# Ubuntu:
sudo apt-get install mongodb

# Or use MongoDB Atlas (free tier available)
```

---

## Next Steps

Once everything is running:

1. **Explore the App:**
   - View driver standings
   - Check constructor standings
   - Browse driver profiles

2. **Customize:**
   - Change colors in `frontend/src/styles/globals.css`
   - Add more API endpoints in Python service
   - Enhance frontend components

3. **Deploy:**
   - See README.md for deployment instructions
   - Consider Heroku, Railway, or Render for backend
   - Use Vercel or Netlify for frontend

---

## Support

If you encounter issues not covered here:

1. Check logs in all three terminals
2. Verify all services are running: `curl http://localhost:5003/api/v1/health`
3. Clear browser cache and restart all services
4. Check the main README.md for additional information

---

**Happy Racing! 🏎️💨**
