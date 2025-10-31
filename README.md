# F1 Web Application - Live Data Integration

A full-stack Formula 1 web application with live data from the FastF1 Python library, featuring real-time race data, driver standings, telemetry, and more.

## 🎉 Latest Updates (January 2025)

**✅ Complete API Integration Finished!**
- All pages now use centralized API architecture
- F1 Rewind, Podium Predictor, and News pages now fetch data from backend
- New `/api/data/stats` endpoint for comprehensive mock data
- Loading states and error handling on all pages
- Zero hardcoded data in frontend components

## Architecture

This application uses a **three-tier architecture**:

1. **Python Data Service (Flask)** - Port 5003
   - Connects to FastF1 library to fetch live F1 data
   - Provides REST API endpoints for race data, standings, telemetry, etc.

2. **Node.js Backend (Express)** - Port 5002 *(updated from 5001)*
   - Proxies requests from frontend to Python service
   - Serves mock data for historical pages via `/api/data/stats`
   - Handles user data and authentication (MongoDB)
   - Manages favorites, preferences, etc.

3. **React Frontend (Vite)** - Port 5173
   - Modern React app with Vite
   - Beautiful UI with animations (Framer Motion)
   - Charts and visualizations (Recharts)
   - Centralized API helper (`f1Api.js`)

## Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **MongoDB** (local or cloud instance - optional)

### Automated Setup (Recommended)

```bash
# One-command start all services
./start-all.sh
```

### 1. Set Up Python Data Service

```bash
cd f1-data-service

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Run the service
python python_server.py
```

The Python service will start on **http://localhost:5003**

> **Note**: First run will take longer as FastF1 downloads and caches race data.

### 2. Set Up Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional - defaults are provided)
cp .env.example .env

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

The backend will start on **http://localhost:5002**

**Important**: Verify `.env` has `PORT=5002` (not 5001)

### 3. Set Up React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:5002

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

## Environment Variables

### Backend (.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/f1app
PYTHON_API_URL=http://localhost:5003/api/v1
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## API Endpoints

### Python Data Service (Port 5003)

- `GET /api/v1/health` - Health check
- `GET /api/v1/standings?year=2024` - Driver standings
- `GET /api/v1/constructor-standings?year=2024` - Constructor standings
- `GET /api/v1/drivers?year=2024` - List of drivers
- `GET /api/v1/telemetry/<driver>?year=2024&event=1&session=R` - Driver telemetry
- `GET /api/v1/schedule?year=2024` - Race schedule
- `GET /api/v1/race-results/<year>/<event>` - Race results

### Node.js Backend (Port 5001)

All F1 data endpoints are proxied from the Python service:

- `GET /api/data/standings`
- `GET /api/data/constructor-standings`
- `GET /api/data/drivers`
- `GET /api/data/telemetry/:driverAbbr`
- `GET /api/data/schedule`
- `GET /api/data/race-results/:year/:event`

User data endpoints (MongoDB):
- `GET /api/user/:email` - Get user profile
- `POST /api/user` - Create/update user
- `PATCH /api/user/:email/favorite-driver` - Update favorite driver

## Technology Stack

### Python Data Service
- Flask - Web framework
- FastF1 - F1 data library
- Flask-CORS - Cross-origin support
- Pandas - Data processing

### Node.js Backend
- Express - Web framework
- Mongoose - MongoDB ODM
- CORS - Cross-origin support
- dotenv - Environment configuration

### React Frontend
- React 18 - UI library
- Vite - Build tool
- Framer Motion - Animations
- Recharts - Data visualizations
- Lucide React - Icons
- TailwindCSS - Styling

## Image Strategy

Driver and team images use **Unsplash dynamic URLs** with query parameters:

```jsx
src={`https://source.unsplash.com/400x400/?formula1,racer,portrait,${driver.number}`}
```

**Benefits:**
- ✅ Zero configuration - no local image uploads needed
- ✅ Dynamic content based on driver number
- ✅ Always high-quality images
- ✅ No storage or CDN costs

**Alternative (if FastF1 provides URLs):**
```jsx
src={driver.headshotUrl || fallbackUnsplashUrl}
```

## Troubleshooting

### Python Service Not Starting
```bash
# Check if port 5003 is available
lsof -i :5003

# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Backend Can't Connect to Python Service
```bash
# Check if Python service is running
curl http://localhost:5003/api/v1/health

# Check backend environment variable
echo $PYTHON_API_URL  # Should be http://localhost:5003/api/v1
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:5001/api/ping

# Check frontend .env file
cat frontend/.env  # VITE_API_URL should be http://localhost:5001
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is running (local)
brew services list | grep mongodb  # macOS
sudo systemctl status mongodb  # Linux

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env to your Atlas connection string
```

### FastF1 Data Not Loading
```bash
# Clear FastF1 cache
rm -rf f1-data-service/cache

# Check internet connection - FastF1 needs to download data
# Try a different year if current season hasn't started
```

## Development Tips

1. **Always start services in order:**
   - Python service first (port 5003)
   - Node.js backend second (port 5001)
   - React frontend last (port 5173)

2. **Check service health:**
   ```bash
   # Python service
   curl http://localhost:5003/api/v1/health
   
   # Backend (checks both backend and Python service)
   curl http://localhost:5001/api/health
   ```

3. **View logs:**
   - Python: Terminal output shows request logs
   - Backend: Terminal output shows proxy requests
   - Frontend: Browser console shows fetch requests

4. **Hot reload:**
   - Python: Manual restart needed (or use Flask debug mode)
   - Backend: Use `npm run dev` with nodemon
   - Frontend: Vite provides instant HMR

## Deployment

### Python Service
- Deploy to: Heroku, Railway, Render, or any Python hosting
- Use Gunicorn: `gunicorn python_server:app`
- Set environment variable for cache directory

### Node.js Backend
- Deploy to: Heroku, Railway, Render, Vercel, or AWS
- Set PYTHON_API_URL to deployed Python service
- Set MONGO_URI to MongoDB Atlas connection string

### React Frontend  
- Deploy to: Vercel, Netlify, or AWS S3 + CloudFront
- Set VITE_API_URL to deployed backend URL
- Build: `npm run build`
- Deploy the `dist/` folder

## Project Structure

```
converted_mern/
├── f1-data-service/          # Python Flask service
│   ├── python_server.py      # Main Flask app
│   ├── requirements.txt      # Python dependencies
│   ├── cache/                # FastF1 data cache (gitignored)
│   └── README.md
├── backend/                  # Node.js Express server
│   ├── server.js             # Main Express app
│   ├── package.json
│   └── .env.example
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities and mock data
│   │   └── App.jsx          # Main app component
│   ├── package.json
│   └── .env.example
└── README.md                # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all three services
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or personal use.

## Credits

- **FastF1** - Amazing Python library for F1 data
- **Unsplash** - Dynamic image source
- **Formula 1** - For the exciting sport!

---

**Happy Racing! 🏎️💨**