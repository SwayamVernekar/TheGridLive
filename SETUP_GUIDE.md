# TheGridLive - Setup Guide

Complete setup instructions for the F1 Web Application with detailed troubleshooting.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Verify Installation

```bash
# Check versions
python --version  # Should be 3.8+
node --version    # Should be 18+
npm --version
mongod --version  # If using local MongoDB
```

---

## Installation Steps

### Step 1: Python Data Service

```bash
cd f1-data-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional - uses defaults if not present)
# See Configuration section below
```

### Step 3: React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# See Configuration section below
```

---

## Configuration

### Backend Configuration (`backend/.env`)

```env
# Server port
PORT=5002

# MongoDB connection
MONGO_URI=mongodb://localhost:27017/f1app
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/f1app

# Python service URL
PYTHON_API_URL=http://localhost:5003/api/v1
```

### Frontend Configuration (`frontend/.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:5002
```

**Note:** If you don't create `.env` files, the application will use default values.

---

## Running the Application

### Quick Start (One Command)

```bash
# Make script executable (first time only on macOS/Linux)
chmod +x start-all.sh

# Run all services
./start-all.sh
```

This automatically starts:
1. Python service (port 5003)
2. Node.js backend (port 5002)
3. React frontend (port 5173)

### Manual Start (Three Terminals)

**Terminal 1 - Python Service:**
```bash
cd f1-data-service
# Activate venv first
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

python python_server.py
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser to: **http://localhost:5173**

---

## Testing

### 1. Test Python Service

```bash
curl http://localhost:5003/api/v1/health
```

Expected: `{"status": "healthy", "service": "F1 Data Service"}`

### 2. Test Backend

```bash
curl http://localhost:5002/api/health
```

Expected: Backend and Python service health status

### 3. Test Frontend

1. Open browser to `http://localhost:5173`
2. Navigate to different pages (Drivers, Standings, etc.)
3. Verify data loads correctly
4. Check browser console for errors

---

## Troubleshooting

### Python Service Issues

**Port 5003 already in use:**
```bash
# Windows
netstat -ano | findstr :5003
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5003
kill -9 <PID>
```

**Module not found errors:**
```bash
# Ensure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

**FastF1 data not loading:**
```bash
# Clear cache and restart
rm -rf f1-data-service/cache  # macOS/Linux
rmdir /s f1-data-service\cache  # Windows
python python_server.py
```

### Backend Issues

**Cannot connect to Python service:**
- Verify Python service is running: `curl http://localhost:5003/api/v1/health`
- Check `PYTHON_API_URL` in backend `.env`

**MongoDB connection failed:**
- Local: Ensure MongoDB is running (`mongod`)
- Cloud: Use MongoDB Atlas connection string in `.env`

**Port 5002 already in use:**
```bash
# Windows
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5002
kill -9 <PID>
```

### Frontend Issues

**API calls failing:**
- Verify backend is running: `curl http://localhost:5002/api/health`
- Check `VITE_API_URL` in frontend `.env`
- Restart frontend after changing `.env`

**Data not loading:**
- Check browser console for errors
- Verify all three services are running
- Check network tab in DevTools

### Common Issues

**First run takes a long time:**
- Normal! FastF1 downloads and caches race data on first run
- Subsequent runs will be much faster

**No data for current season:**
- F1 season may not have started yet
- Use previous year's data by changing year parameter

**Images not loading:**
- Application uses dynamic Unsplash images
- Requires internet connection
- Some variation in images is normal

**MongoDB not installed:**
- Application will work without MongoDB
- User features (profile, chat) won't function
- Install MongoDB or use Atlas for full features

---

## Need More Help?

- Check the main [README.md](./README.md) for architecture overview
- Review API endpoints in README
- Check browser console for detailed error messages
- Verify all services show healthy status

---

**Happy Racing! 🏎️💨**