# Backend Refactoring Complete - FastF1 + MongoDB Only

## ✅ Changes Made

### 1. **Removed Ergast API Completely**
   - Deleted `fetchFromErgast()` function
   - Removed all Ergast API URLs and references
   - No more `https://ergast.com` dependencies

### 2. **Created MongoDB Models**
   - `Driver.js` - Driver information
   - `DriverStanding.js` - Driver championship standings
   - `ConstructorStanding.js` - Team championship standings
   - `Team.js` - Team/constructor data
   - `Schedule.js` - Race schedule
   - `RaceResult.js` - Race results

### 3. **Implemented Multi-Tier Data Source Strategy**
   
   **Priority Order:**
   1. **Memory Cache** (5 min TTL) - Fastest
   2. **FastF1 Python API** (port 5003) - Live data
   3. **MongoDB Fallback** - Historical/backup data
   
   All endpoints now try FastF1 first, then fall back to MongoDB if FastF1 is unavailable.

### 4. **Updated All Endpoints**
   
   All API endpoints now follow this pattern:
   ```javascript
   1. Check cache → return if valid
   2. Try FastF1 API → save to MongoDB if successful
   3. Try MongoDB → return if data exists
   4. Return empty response with message
   ```

## 📁 File Structure

```
backend/
├── models/
│   ├── Driver.js
│   ├── DriverStanding.js
│   ├── ConstructorStanding.js
│   ├── Team.js
│   ├── Schedule.js
│   └── RaceResult.js
├── server.js (NEW - FastF1 + MongoDB)
├── server-ergast-backup.js (OLD - with Ergast)
└── package.json
```

## 🚀 Running the Application

### 1. Start MongoDB (Choose one):
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env file
```

### 2. Start Python FastF1 Service:
```bash
cd f1-data-service
python3 python_server.py
```

### 3. Start Node.js Backend:
```bash
cd backend
node server.js
```

## 🔧 Environment Variables

Create/Update `.env` file in `backend/` directory:

```env
PORT=5002
PYTHON_API_URL=http://localhost:5003/api/v1
MONGO_URI=mongodb://localhost:27017/f1app
NEWS_API_KEY=your_news_api_key_here
```

## 📊 API Endpoints

All endpoints remain the same:

- `GET /api/health` - Health check
- `GET /api/data/standings/drivers?year=2024` - Driver standings
- `GET /api/data/standings/constructors?year=2024` - Constructor standings
- `GET /api/data/drivers?year=2024` - All drivers
- `GET /api/data/teams?year=2024` - All teams
- `GET /api/data/schedule?year=2024` - Race schedule
- `GET /api/data/race-results/:year/:round` - Race results
- `GET /api/data/news` - F1 news
- `GET /api/data/stats` - Historical stats
- `GET /api/data/telemetry/:driver` - Live telemetry

## 🔍 Testing

Test all endpoints:
```bash
# Health check
curl http://localhost:5002/api/health | jq .

# Driver standings
curl "http://localhost:5002/api/data/standings/drivers?year=2024" | jq .

# News
curl http://localhost:5002/api/data/news | jq .
```

## 💾 Populating MongoDB

To populate MongoDB with data when FastF1 is running:

1. Start FastF1 service
2. Start backend
3. Call each endpoint once - data will be cached to MongoDB
4. Future requests will use MongoDB if FastF1 is down

**Or use MongoDB Compass** to import CSV files manually:
- Connect to: `mongodb://localhost:27017/f1app`
- Import CSVs into respective collections

## ⚡ Benefits

1. **No External API Dependencies** - Works offline after initial data load
2. **Faster Response Times** - Cache + local DB
3. **More Reliable** - Multiple fallback layers
4. **Better Control** - Own your data
5. **Real-time Capable** - FastF1 provides live telemetry

## 🐛 Troubleshooting

### FastF1 API unavailable
- Start Python service: `cd f1-data-service && python3 python_server.py`
- Check port 5003 is not in use: `lsof -i:5003`

### MongoDB not connected
- Start MongoDB: `mongod`
- Check connection string in `.env`
- Backend will work without MongoDB using FastF1 only

### No data returned
- Ensure at least one data source is available (FastF1 or MongoDB)
- Check logs in backend terminal for errors
- Import data manually using MongoDB Compass

## 📝 Notes

- **Backup created**: `server-ergast-backup.js` contains the old Ergast version
- **CURRENT_YEAR**: Set to 2025 in server.js (update as needed)
- **Cache duration**: 5 minutes (adjustable via `CACHE_DURATION`)
- **MongoDB**: Optional but recommended for reliability

## Next Steps

1. ✅ Start MongoDB
2. ✅ Start Python FastF1 service
3. ✅ Test all endpoints
4. 📥 Import historical data to MongoDB (if needed)
5. 🔄 Keep services running for frontend to consume
