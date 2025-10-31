// F1 Web Application Backend - Node.js/Express
// Proxies requests to Python FastF1 Data Service
// Run: npm install && node server.js

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (for user data, favorites, etc.)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1app';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Python Data Service URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1';

// ============================================
// Mock Data for Historical/Non-Live Features
// ============================================
const mockDrivers = [
  { id: 1, name: 'Max Verstappen', number: 1, team: 'Red Bull', teamId: 1, teamColor: '0600ef', points: 450, wins: 14, podiums: 20, poles: 5, fastestLaps: 8, championships: 2, nationality: 'Dutch', nickname: 'Mad Max', famousQuote: 'I push until the last lap.', careerYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
  { id: 2, name: 'Lewis Hamilton', number: 44, team: 'Mercedes', teamId: 2, teamColor: '00d2be', points: 380, wins: 11, podiums: 18, poles: 6, fastestLaps: 5, championships: 7, nationality: 'British', nickname: 'Ham', famousQuote: 'Still we rise.', careerYears: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
  { id: 3, name: 'Charles Leclerc', number: 16, team: 'Ferrari', teamId: 3, teamColor: 'dc0000', points: 320, wins: 5, podiums: 10, poles: 3, fastestLaps: 4, championships: 0, nationality: 'Monegasque', nickname: 'Charles', famousQuote: 'Racing is life.', careerYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
  { id: 4, name: 'Lando Norris', number: 4, team: 'McLaren', teamId: 4, teamColor: 'ff8700', points: 280, wins: 1, podiums: 8, poles: 1, fastestLaps: 2, championships: 0, nationality: 'British', nickname: 'Lando', famousQuote: 'Keep pushing!', careerYears: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
  { id: 5, name: 'Carlos Sainz', number: 55, team: 'Ferrari', teamId: 3, teamColor: 'dc0000', points: 250, wins: 3, podiums: 12, poles: 2, fastestLaps: 3, championships: 0, nationality: 'Spanish', nickname: 'Smooth Operator', famousQuote: 'Vamos!', careerYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
];

const mockTeams = [
  { id: 1, name: 'Red Bull Racing', points: 850, wins: 20, color: '0600ef', base: 'United Kingdom', teamPrincipal: 'Christian Horner', engineSupplier: 'Red Bull Powertrains', firstSeason: 2005, championships: 5, drivers: [1, 2] },
  { id: 2, name: 'Mercedes AMG', points: 700, wins: 15, color: '00d2be', base: 'United Kingdom', teamPrincipal: 'Toto Wolff', engineSupplier: 'Mercedes', firstSeason: 2010, championships: 8, drivers: [3, 4] },
  { id: 3, name: 'Ferrari', points: 570, wins: 8, color: 'dc0000', base: 'Italy', teamPrincipal: 'Fred Vasseur', engineSupplier: 'Ferrari', firstSeason: 1950, championships: 16, drivers: [5, 6] },
  { id: 4, name: 'McLaren', points: 480, wins: 2, color: 'ff8700', base: 'United Kingdom', teamPrincipal: 'Andrea Stella', engineSupplier: 'Mercedes', firstSeason: 1966, championships: 8, drivers: [7, 8] },
];

const mockNews = [
  { id: 1, title: 'Verstappen Dominates Season Opener', description: 'Max Verstappen claims victory in spectacular fashion at the Bahrain Grand Prix.', category: 'Race', date: '2025-03-02', image: 'https://source.unsplash.com/800x400/?f1,racing,bahrain' },
  { id: 2, title: 'Mercedes Unveils Revolutionary Upgrades', description: 'Mercedes introduces game-changing aerodynamic package for the W16.', category: 'Technical', date: '2025-04-15', image: 'https://source.unsplash.com/800x400/?f1,mercedes,car' },
  { id: 3, title: 'Hamilton Breaks Podium Record', description: 'Lewis Hamilton secures his 200th career podium finish.', category: 'Driver', date: '2025-05-20', image: 'https://source.unsplash.com/800x400/?f1,hamilton,podium' },
  { id: 4, title: 'Ferrari Returns to Glory', description: 'Scuderia Ferrari clinches first constructor championship in over a decade.', category: 'Team', date: '2025-10-15', image: 'https://source.unsplash.com/800x400/?f1,ferrari,celebration' },
];

const legendaryDrivers = [
  { id: 'senna', name: 'Ayrton Senna', era: 'The Turbo Era / Early 90s', championships: 3, wins: 41, poles: 65, podiums: 80, teamColor: '005BA9', nationality: 'Brazilian', quote: 'If you go for a gap that exists, you are no longer a racing driver.' },
  { id: 'schumacher', name: 'Michael Schumacher', era: 'The Ferrari Dynasty', championships: 7, wins: 91, poles: 68, podiums: 155, teamColor: 'DC0000', nationality: 'German', quote: 'I have always passed the ball, but today I kept it.' },
  { id: 'fangio', name: 'Juan Manuel Fangio', era: 'The 1950s Golden Age', championships: 5, wins: 24, poles: 29, podiums: 35, teamColor: '006F62', nationality: 'Argentine', quote: 'You must always strive to be the best, but you must never believe that you are.' },
  { id: 'prost', name: 'Alain Prost', era: 'The Professor Era', championships: 4, wins: 51, poles: 33, podiums: 106, teamColor: 'FFDF00', nationality: 'French', quote: 'A German player will not be a world champion.' },
];

// Helper function to fetch from Python service
async function fetchFromPythonService(endpoint, res) {
  try {
    const response = await fetch(`${PYTHON_API_URL}${endpoint}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error || 'Failed to fetch data from F1 service',
        message: errorData.message || 'An error occurred'
      });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error(`Error fetching from Python service (${endpoint}):`, error.message);
    return res.status(500).json({
      error: 'Service unavailable',
      message: 'Unable to connect to F1 data service. Please ensure the Python service is running on port 5003.'
    });
  }
}

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', status: 'Node.js backend is running' });
});

// Check Python service health
app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    const data = await response.json();
    res.json({
      backend: 'healthy',
      pythonService: data.status,
      pythonServiceVersion: data.version
    });
  } catch (error) {
    res.status(503).json({
      backend: 'healthy',
      pythonService: 'unavailable',
      error: 'Python service is not responding'
    });
  }
});

// ============================================
// Stats Endpoint (Mock Data for Historical Pages)
// ============================================

// Get comprehensive stats (drivers, teams, news, legendaryDrivers)
app.get('/api/data/stats', async (req, res) => {
  try {
    res.json({
      drivers: mockDrivers,
      teams: mockTeams,
      news: mockNews,
      legendaryDrivers: legendaryDrivers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error serving stats:', error);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

// ============================================
// F1 Data Endpoints (Proxy to Python Service)
// ============================================

// Get driver standings
app.get('/api/data/standings', async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  await fetchFromPythonService(`/standings?year=${year}`, res);
});

// Get constructor standings
app.get('/api/data/constructor-standings', async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  await fetchFromPythonService(`/constructor-standings?year=${year}`, res);
});

// Get drivers list
app.get('/api/data/drivers', async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  await fetchFromPythonService(`/drivers?year=${year}`, res);
});

// Get driver telemetry
app.get('/api/data/telemetry/:driverAbbr', async (req, res) => {
  const { driverAbbr } = req.params;
  const { year, event, session } = req.query;
  
  let endpoint = `/telemetry/${driverAbbr}`;
  const params = new URLSearchParams();
  
  if (year) params.append('year', year);
  if (event) params.append('event', event);
  if (session) params.append('session', session);
  
  const queryString = params.toString();
  if (queryString) endpoint += `?${queryString}`;
  
  await fetchFromPythonService(endpoint, res);
});

// Get race schedule
app.get('/api/data/schedule', async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  await fetchFromPythonService(`/schedule?year=${year}`, res);
});

// Get race results
app.get('/api/data/race-results/:year/:event', async (req, res) => {
  const { year, event } = req.params;
  await fetchFromPythonService(`/race-results/${year}/${event}`, res);
});

// ============================================
// User Data Endpoints (MongoDB)
// ============================================

// User schema for favorites, preferences, etc.
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  favoriteDriver: String,
  favoriteTeam: String,
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Get user profile
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user profile
app.post('/api/user', async (req, res) => {
  try {
    const { email, name, favoriteDriver, favoriteTeam, preferences } = req.body;
    
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.favoriteDriver = favoriteDriver !== undefined ? favoriteDriver : user.favoriteDriver;
      user.favoriteTeam = favoriteTeam !== undefined ? favoriteTeam : user.favoriteTeam;
      user.preferences = { ...user.preferences, ...preferences };
      await user.save();
    } else {
      // Create new user
      user = new User({ email, name, favoriteDriver, favoriteTeam, preferences });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update favorite driver
app.patch('/api/user/:email/favorite-driver', async (req, res) => {
  try {
    const { favoriteDriver } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { favoriteDriver },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`\n🏎️  F1 Backend Server running on port ${PORT}`);
  console.log(`📊 Proxying F1 data requests to: ${PYTHON_API_URL}`);
  console.log(`🗄️  MongoDB: ${MONGO_URI}\n`);
});
