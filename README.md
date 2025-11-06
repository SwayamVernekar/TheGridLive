# TheGridLive - F1 Web Application

A full-stack Formula 1 web application featuring real-time race data, driver standings, constructor standings, live chat, and more. Built with a modern three-tier architecture using FastF1, Node.js, and React.

## �️ Features

- **Live Race Data**: Real-time driver and constructor standings from FastF1
- **Driver Profiles**: Comprehensive driver information with stats and visualizations
- **Race Schedule**: Complete F1 calendar with race results
- **F1 Rewind**: Historical data and legendary drivers
- **Podium Predictor**: Interactive race prediction tool
- **News Feed**: Latest F1 news and updates
- **Live Chat**: Real-time chat room for F1 fans
- **User Profiles**: Personalized experience with favorite drivers and teams

## 🏗️ Architecture

This application uses a **three-tier architecture**:

1. **Python Data Service (Flask)** - Port 5003
   - Connects to FastF1 library to fetch live F1 data
   - Provides REST API endpoints for race data, standings, telemetry

2. **Node.js Backend (Express)** - Port 5002
   - Proxies requests from frontend to Python service
   - Handles user data and chat (MongoDB)
   - Serves additional endpoints for news, stats, and historical data

3. **React Frontend (Vite)** - Port 5173
   - Modern React app with Vite and TailwindCSS
   - Beautiful UI with animations (Framer Motion)
   - Charts and visualizations (Recharts)
   - Centralized API helper (`f1Api.js`)

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **MongoDB** (local or MongoDB Atlas)

### 1. Set Up Python Data Service

```bash
cd f1-data-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the service
python python_server.py
```

The Python service will start on **http://localhost:5003**

### 2. Set Up Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional - see Environment Variables section)
# Default PORT=5002, MongoDB URI, etc.

# Start the server
npm start
```

The backend will start on **http://localhost:5002**

### 3. Set Up React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 🎯 One-Command Start (Recommended)

```bash
chmod +x start-all.sh
./start-all.sh
```

## ⚙️ Environment Variables

### Backend (`.env`)
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/f1app
PYTHON_API_URL=http://localhost:5003/api/v1
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5002
```

## 📡 API Endpoints

### Python Data Service (Port 5003)
- `GET /api/v1/health` - Health check
- `GET /api/v1/standings?year=2025` - Driver standings
- `GET /api/v1/constructor-standings?year=2025` - Constructor standings
- `GET /api/v1/drivers?year=2025` - List of drivers
- `GET /api/v1/telemetry/<driver>?year=2025&event=1&session=R` - Driver telemetry
- `GET /api/v1/schedule?year=2025` - Race schedule
- `GET /api/v1/race-results/<year>/<event>` - Race results

### Node.js Backend (Port 5002)
**F1 Data (proxied from Python service):**
- `GET /api/data/standings`
- `GET /api/data/constructor-standings`
- `GET /api/data/drivers`
- `GET /api/data/telemetry/:driverAbbr`
- `GET /api/data/schedule`
- `GET /api/data/race-results/:year/:event`
- `GET /api/data/stats` - Mock data for F1 Rewind, Podium Predictor, News

**User & Chat:**
- `GET /api/user/:email` - Get user profile
- `POST /api/user` - Create/update user
- `PATCH /api/user/:email/favorite-driver` - Update favorite driver
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message

## 🛠️ Technology Stack

### Python Data Service
- Flask - Web framework
- FastF1 - F1 data library
- Flask-CORS - Cross-origin support
- Pandas - Data processing

### Node.js Backend
- Express - Web framework
- Mongoose - MongoDB ODM
- CORS - Cross-origin support

### React Frontend
- React 18 - UI library
- Vite - Build tool
- TailwindCSS - Styling
- Framer Motion - Animations
- Recharts - Data visualizations
- Lucide React - Icons

## 🐛 Troubleshooting

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

**FastF1 data not loading:**
```bash
# Clear cache and restart
rm -rf f1-data-service/cache
python python_server.py
```

### Backend Issues
**Cannot connect to Python service:**
```bash
# Check if Python service is running
curl http://localhost:5003/api/v1/health
```

**MongoDB connection failed:**
- Ensure MongoDB is running locally, or
- Use MongoDB Atlas and update `MONGO_URI` in `.env`

### Frontend Issues
**API calls failing:**
- Verify backend is running: `curl http://localhost:5002/api/health`
- Check `.env` has correct `VITE_API_URL`
- Restart frontend after .env changes

## 📂 Project Structure

```
TheGridLive/
├── f1-data-service/          # Python Flask service
│   ├── python_server.py      # Main Flask app
│   ├── requirements.txt      # Python dependencies
│   └── cache/                # FastF1 data cache (gitignored)
├── backend/                  # Node.js Express server
│   ├── server.js             # Main Express app
│   ├── models/               # MongoDB models
│   └── package.json
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── api/             # API helper (f1Api.js)
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 📝 Additional Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions with troubleshooting
- **[frontend/src/Attributions.md](./frontend/src/Attributions.md)** - License information for third-party resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **FastF1** - Python library for F1 data
- **Unsplash** - Dynamic images
- **Formula 1** - For the amazing sport!
- **shadcn/ui** - UI components (used under MIT license)

---

**Happy Racing! 🏎️💨**

For detailed setup instructions and troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)