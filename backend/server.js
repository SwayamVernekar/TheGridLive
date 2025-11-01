// F1 Web Application Backend - Comprehensive Revamp
// Integrates Ergast API, News API, and optional Python/FastF1 for live telemetry
// Run: npm install && node server-new.js

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Telemetry from './models/Telemetry.js';
import ChatRoom from './models/ChatRoom.js';
import User from './models/User.js';
import DriverStandings from './models/DriverStandings.js';
import ConstructorStandings from './models/ConstructorStandings.js';
import Drivers from './models/Drivers.js';
import Schedule from './models/Schedule.js';
import RaceResults from './models/RaceResults.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// ============================================
// External API Configuration
// ============================================
const ERGAST_API_URL = 'https://ergast.com/api/f1';
const FASTF1_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1'; // FastF1 Python service
const CURRENT_YEAR = 2025; // Update to 2025 when season starts
const NEWS_API_KEY = process.env.NEWS_API_KEY || ''; // User provides this
const NEWS_API_URL = 'https://newsapi.org/v2';

// ============================================
// Cache System (5 minutes TTL)
// ============================================
const cache = {
  drivers: { data: null, timestamp: 0 },
  teams: { data: null, timestamp: 0 },
  driverStandings: { data: null, timestamp: 0 },
  constructorStandings: { data: null, timestamp: 0 },
  schedule: { data: null, timestamp: 0 },
  news: { data: null, timestamp: 0 },
  raceResults: {}
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 5; // Temporarily set to 5 for testing
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const requestCounts = new Map(); // Track requests per IP

// Rate limiting middleware
function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Get or initialize request count for this IP
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }

  const requests = requestCounts.get(clientIP);

  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  requestCounts.set(clientIP, validRequests);

  // Check if under limit
  if (validRequests.length >= RATE_LIMIT_REQUESTS) {
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${RATE_LIMIT_REQUESTS} requests per hour.`,
      retryAfter: Math.ceil((validRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }

  // Add current request timestamp
  validRequests.push(now);
  requestCounts.set(clientIP, validRequests);

  next();
}

// Apply rate limiting to all API routes
app.use('/api/', rateLimit);

function isCacheValid(cacheEntry) {
  return cacheEntry.data && (Date.now() - cacheEntry.timestamp < CACHE_DURATION);
}

function updateCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

// ============================================
// Team Color & Logo Mapping
// ============================================
const teamData = {
  'red_bull': { color: '0600ef', logo: 'https://upload.wikimedia.org/wikipedia/en/7/79/Red_Bull_Racing_logo.svg' },
  'mercedes': { color: '00d2be', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg' },
  'ferrari': { color: 'dc0000', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Scuderia_Ferrari_Logo.svg' },
  'mclaren': { color: 'ff8700', logo: 'https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg' },
  'aston_martin': { color: '006f62', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Aston_Martin_Aramco_Cognizant_F1.svg' },
  'alpine': { color: '0090ff', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg' },
  'williams': { color: '005aff', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Williams_Grand_Prix_Engineering_logo.svg' },
  'alphatauri': { color: '2b4562', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Scuderia_AlphaTauri_logo.svg' },
  'alfa': { color: '900000', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Alfa_Romeo_F1_Team_Orlen_logo.svg' },
  'haas': { color: 'ffffff', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Haas_F1_Team_Logo.svg/1200px-Haas_F1_Team_Logo.svg.png' },
  'sauber': { color: '00e701', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Alfa_Romeo_F1_Team_Orlen_logo.svg' },
  'rb': { color: '6692ff', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Scuderia_AlphaTauri_logo.svg' }
};

function getTeamColor(constructorId) {
  const normalized = constructorId.toLowerCase().replace(/\s+/g, '_');
  return teamData[normalized]?.color || 'cccccc';
}

function getTeamLogo(constructorId) {
  const normalized = constructorId.toLowerCase().replace(/\s+/g, '_');
  return teamData[normalized]?.logo || `https://source.unsplash.com/200x200/?f1,logo,${constructorId}`;
}

function getCarImage(constructorId, year = CURRENT_YEAR) {
  const normalized = constructorId.toLowerCase().replace(/\s+/g, '_');
  return `https://source.unsplash.com/800x400/?f1,${constructorId},car,${year}`;
}

function getDriverImage(driverCode, driverSurname) {
  return `https://source.unsplash.com/400x400/?f1,driver,portrait,racer,${driverSurname}`;
}

// ============================================
// Ergast API Helper Functions
// ============================================
async function fetchFromErgast(endpoint) {
  try {
    const response = await fetch(`${ERGAST_API_URL}/${endpoint}.json`);
    if (!response.ok) {
      throw new Error(`Ergast API error: ${response.status}`);
    }
    const data = await response.json();
    return data.MRData;
  } catch (error) {
    console.error('Ergast fetch error:', error);
    throw error;
  }
}

// ============================================
// FastF1 API Helper Functions
// ============================================
async function fetchFromFastF1(endpoint) {
  const url = `${FASTF1_API_URL}/${endpoint}`;
  console.log('  [fetchFromFastF1] Starting fetch...');
  console.log('  [fetchFromFastF1] Full URL:', url);

  try {
    console.log('  [fetchFromFastF1] Sending HTTP request...');
    const response = await fetch(url);
    console.log('  [fetchFromFastF1] Response received');
    console.log('  [fetchFromFastF1] Status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`FastF1 API error: ${response.status} ${response.statusText}`);
    }

    console.log('  [fetchFromFastF1] Parsing JSON...');
    const data = await response.json();
    console.log('  [fetchFromFastF1] JSON parsed successfully');
    console.log('  [fetchFromFastF1] Response keys:', Object.keys(data));

    return data;
  } catch (error) {
    console.error('  [fetchFromFastF1] ❌ ERROR ❌');
    console.error('  [fetchFromFastF1] Error type:', error.constructor.name);
    console.error('  [fetchFromFastF1] Error message:', error.message);
    if (error.cause) {
      console.error('  [fetchFromFastF1] Error cause:', error.cause);
    }
    console.error('FastF1 fetch error:', error);
    throw error;
  }
}

// ============================================
// MongoDB Connection
// ============================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB optional - running without database:', err.message));

// ============================================
// Mock Data for Historical Pages (F1 Rewind)
// ============================================
const legendaryDrivers = [
  {
    id: 'senna',
    name: 'Ayrton Senna',
    era: 'The Turbo Era / Early 90s',
    championships: 3,
    wins: 41,
    poles: 65,
    podiums: 80,
    teamColor: '005BA9',
    nationality: 'Brazilian',
    quote: 'If you no longer go for a gap that exists, you are no longer a racing driver.',
    definingMoment: {
      title: '1991 Brazilian Grand Prix Victory',
      description: 'Senna delivered one of the greatest drives in F1 history, fighting a failing gearbox in torrential rain to win by over 2.9 seconds.',
      position: 1,
      year: 1991
    },
    rivalries: [
      {
        rival: 'Alain Prost',
        battles: 'Suzuka \'89 & \'90',
        description: 'The most intense and personal rivalry in F1 history, culminating in two controversial championship-deciding collisions.'
      }
    ]
  },
  {
    id: 'schumacher',
    name: 'Michael Schumacher',
    era: 'The Ferrari Dynasty',
    championships: 7,
    wins: 91,
    poles: 68,
    podiums: 155,
    teamColor: 'DC0000',
    nationality: 'German',
    quote: 'Once something is a passion, the motivation is there.',
    definingMoment: {
      title: '1996 Spanish Grand Prix Masterclass',
      description: 'Schumacher drove through torrential rain to win by over 45 seconds, showcasing his unparalleled wet-weather mastery.',
      position: 1,
      year: 1996
    },
    rivalries: [
      {
        rival: 'Damon Hill',
        battles: 'Adelaide \'94',
        description: 'A championship battle that ended controversially with a collision in the final race.'
      }
    ]
  },
  {
    id: 'fangio',
    name: 'Juan Manuel Fangio',
    era: 'The 1950s Golden Age',
    championships: 5,
    wins: 24,
    poles: 29,
    podiums: 35,
    teamColor: '006F62',
    nationality: 'Argentine',
    quote: 'You must always strive to be the best, but you must never believe that you are.',
    definingMoment: {
      title: '1957 German Grand Prix',
      description: 'One of the greatest drives ever, coming from 48 seconds behind to win at the Nürburgring.',
      position: 1,
      year: 1957
    },
    rivalries: []
  },
  {
    id: 'prost',
    name: 'Alain Prost',
    era: 'The Professor Era',
    championships: 4,
    wins: 51,
    poles: 33,
    podiums: 106,
    teamColor: 'FFDF00',
    nationality: 'French',
    quote: 'A German will never win the Formula 1 championship. Never!',
    definingMoment: {
      title: '1986 Australian Grand Prix',
      description: 'Won his second title by finishing second, demonstrating strategic brilliance over raw speed.',
      position: 2,
      year: 1986
    },
    rivalries: [
      {
        rival: 'Ayrton Senna',
        battles: 'Throughout late 80s/early 90s',
        description: 'Cerebral vs emotional - the ultimate clash of styles.'
      }
    ]
  }
];

// ============================================
// API Routes
// ============================================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    // Test FastF1 API
    await fetch(`${FASTF1_API_URL}/health`);
    res.json({
      status: 'healthy',
      backend: 'running',
      fastf1Api: 'connected',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: Object.keys(cache).reduce((acc, key) => {
        acc[key] = isCacheValid(cache[key]) ? 'valid' : 'expired';
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      backend: 'running',
      fastf1Api: 'unavailable',
      error: error.message
    });
  }
});

// Get Current Season Driver Standings (Ergast)
app.get('/api/data/standings/drivers', async (req, res) => {
  console.log('\n========== DRIVER STANDINGS REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const year = req.query.year || CURRENT_YEAR;
  console.log('Year for standings:', year);

  try {
    const cacheKey = `driverStandings_${year}`;

    // Check cache
    console.log('Checking cache for key:', cacheKey);
    if (isCacheValid(cache.driverStandings)) {
      console.log('✓ Cache hit! Returning cached data');
      console.log('Cached data preview:', JSON.stringify(cache.driverStandings.data).substring(0, 200));
      return res.json(cache.driverStandings.data);
    }
    console.log('✗ Cache miss or expired. Fetching from Ergast...');

    // Fetch from Ergast
    console.log('Fetching data from Ergast API...');
    const data = await fetchFromErgast(`${year}/driverStandings`);
    console.log('✓ Received response from Ergast');
    const standings = data.StandingsTable.StandingsLists[0];

    if (!standings) {
      console.log('⚠ No standings available for year:', year);
      return res.json({ standings: [], year, message: 'No standings available yet' });
    }

    console.log('Number of drivers in standings:', standings.DriverStandings.length);
    console.log('Processing driver standings...');

    const driverStandings = standings.DriverStandings.map((entry, index) => {
      if (index === 0) {
        console.log('Sample entry (first driver):', JSON.stringify(entry, null, 2));
      }
      return {
        position: parseInt(entry.position),
        points: parseFloat(entry.points),
        wins: parseInt(entry.wins),
        driverId: entry.Driver.driverId,
        driverCode: entry.Driver.code,
        driverNumber: entry.Driver.permanentNumber || '',
        givenName: entry.Driver.givenName,
        familyName: entry.Driver.familyName,
        fullName: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
        dateOfBirth: entry.Driver.dateOfBirth,
        nationality: entry.Driver.nationality,
        constructorId: entry.Constructors[0].constructorId,
        constructorName: entry.Constructors[0].name,
        teamColor: getTeamColor(entry.Constructors[0].constructorId),
        driverImage: getDriverImage(entry.Driver.code, entry.Driver.familyName)
      };
    });

    console.log('✓ Processed', driverStandings.length, 'driver entries');
    console.log('Sample processed driver:', JSON.stringify(driverStandings[0], null, 2));

    const result = { standings: driverStandings, year: parseInt(year), lastUpdate: new Date().toISOString() };
    console.log('Final result structure:', Object.keys(result));
    console.log('Updating cache...');
    updateCache('driverStandings', result);
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(result).length, 'bytes');
    res.json(result);
    console.log('✓ Response sent successfully');
    console.log('========== DRIVER STANDINGS REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ DRIVER STANDINGS ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Driver standings error:', error);
    
    // FALLBACK: Return mock data when Ergast is unavailable
    console.log('⚠️ Ergast API unavailable - returning fallback data');
    const mockStandings = [
      { position: 1, points: 549, wins: 19, driverId: 'max_verstappen', driverCode: 'VER', driverNumber: '1', givenName: 'Max', familyName: 'Verstappen', fullName: 'Max Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch', constructorId: 'red_bull', constructorName: 'Red Bull Racing', teamColor: '#3671C6', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png' },
      { position: 2, points: 860, wins: 7, driverId: 'norris', driverCode: 'NOR', driverNumber: '4', givenName: 'Lando', familyName: 'Norris', fullName: 'Lando Norris', dateOfBirth: '1999-11-13', nationality: 'British', constructorId: 'mclaren', constructorName: 'McLaren', teamColor: '#FF8000', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png' },
      { position: 3, points: 315, wins: 2, driverId: 'leclerc', driverCode: 'LEC', driverNumber: '16', givenName: 'Charles', familyName: 'Leclerc', fullName: 'Charles Leclerc', dateOfBirth: '1997-10-16', nationality: 'Monegasque', constructorId: 'ferrari', constructorName: 'Ferrari', teamColor: '#E8002D', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png' },
      { position: 4, points: 291, wins: 2, driverId: 'piastri', driverCode: 'PIA', driverNumber: '81', givenName: 'Oscar', familyName: 'Piastri', fullName: 'Oscar Piastri', dateOfBirth: '2001-04-06', nationality: 'Australian', constructorId: 'mclaren', constructorName: 'McLaren', teamColor: '#FF8000', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png' },
      { position: 5, points: 262, wins: 0, driverId: 'sainz', driverCode: 'SAI', driverNumber: '55', givenName: 'Carlos', familyName: 'Sainz', fullName: 'Carlos Sainz', dateOfBirth: '1994-09-01', nationality: 'Spanish', constructorId: 'ferrari', constructorName: 'Ferrari', teamColor: '#E8002D', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png' },
      { position: 6, points: 223, wins: 2, driverId: 'hamilton', driverCode: 'HAM', driverNumber: '44', givenName: 'Lewis', familyName: 'Hamilton', fullName: 'Lewis Hamilton', dateOfBirth: '1985-01-07', nationality: 'British', constructorId: 'mercedes', constructorName: 'Mercedes', teamColor: '#27F4D2', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png' },
      { position: 7, points: 192, wins: 0, driverId: 'russell', driverCode: 'RUS', driverNumber: '63', givenName: 'George', familyName: 'Russell', fullName: 'George Russell', dateOfBirth: '1998-02-15', nationality: 'British', constructorId: 'mercedes', constructorName: 'Mercedes', teamColor: '#27F4D2', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png' },
      { position: 8, points: 152, wins: 0, driverId: 'perez', driverCode: 'PER', driverNumber: '11', givenName: 'Sergio', familyName: 'Pérez', fullName: 'Sergio Pérez', dateOfBirth: '1990-01-26', nationality: 'Mexican', constructorId: 'red_bull', constructorName: 'Red Bull Racing', teamColor: '#3671C6', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png' },
      { position: 9, points: 86, wins: 0, driverId: 'alonso', driverCode: 'ALO', driverNumber: '14', givenName: 'Fernando', familyName: 'Alonso', fullName: 'Fernando Alonso', dateOfBirth: '1981-07-29', nationality: 'Spanish', constructorId: 'aston_martin', constructorName: 'Aston Martin', teamColor: '#229971', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png' },
      { position: 10, points: 73, wins: 0, driverId: 'hulkenberg', driverCode: 'HUL', driverNumber: '27', givenName: 'Nico', familyName: 'Hülkenberg', fullName: 'Nico Hülkenberg', dateOfBirth: '1987-08-19', nationality: 'German', constructorId: 'haas', constructorName: 'Haas F1 Team', teamColor: '#B6BABD', driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png' }
    ];
    
    const fallbackResult = { 
      standings: mockStandings, 
      year: parseInt(year), 
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'Ergast API unavailable - using fallback data'
    };
    
    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get Current Season Constructor Standings (Ergast)
app.get('/api/data/standings/constructors', async (req, res) => {
  try {
    const year = req.query.year || CURRENT_YEAR;
    
    if (isCacheValid(cache.constructorStandings)) {
      return res.json(cache.constructorStandings.data);
    }

    const data = await fetchFromErgast(`${year}/constructorStandings`);
    const standings = data.StandingsTable.StandingsLists[0];
    
    if (!standings) {
      return res.json({ standings: [], year, message: 'No standings available yet' });
    }

    const constructorStandings = standings.ConstructorStandings.map(entry => ({
      position: parseInt(entry.position),
      points: parseFloat(entry.points),
      wins: parseInt(entry.wins),
      constructorId: entry.Constructor.constructorId,
      name: entry.Constructor.name,
      nationality: entry.Constructor.nationality,
      teamColor: getTeamColor(entry.Constructor.constructorId),
      teamLogo: getTeamLogo(entry.Constructor.constructorId),
      carImage: getCarImage(entry.Constructor.constructorId, year)
    }));

    const result = { standings: constructorStandings, year: parseInt(year), lastUpdate: new Date().toISOString() };
    updateCache('constructorStandings', result);
    
    res.json(result);
  } catch (error) {
    console.error('Constructor standings error:', error);
    res.status(500).json({ error: 'Failed to fetch constructor standings', message: error.message });
  }
});

// Get All Drivers for Current Season (Ergast)
app.get('/api/data/drivers', async (req, res) => {
  try {
    const year = req.query.year || CURRENT_YEAR;
    
    if (isCacheValid(cache.drivers)) {
      return res.json(cache.drivers.data);
    }

    const data = await fetchFromErgast(`${year}/drivers`);
    const driversList = data.DriverTable.Drivers;

    // Also get current standings to enrich driver data
    const standingsData = await fetchFromErgast(`${year}/driverStandings`);
    const standings = standingsData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
    
    const drivers = driversList.map(driver => {
      const standing = standings.find(s => s.Driver.driverId === driver.driverId);
      const constructor = standing?.Constructors[0];
      
      return {
        id: driver.driverId,
        driverId: driver.driverId,
        code: driver.code,
        number: driver.permanentNumber,
        givenName: driver.givenName,
        familyName: driver.familyName,
        fullName: `${driver.givenName} ${driver.familyName}`,
        dateOfBirth: driver.dateOfBirth,
        nationality: driver.nationality,
        team: constructor?.name || 'Unknown',
        teamId: constructor?.constructorId || 'unknown',
        teamColor: constructor ? getTeamColor(constructor.constructorId) : 'cccccc',
        points: standing ? parseFloat(standing.points) : 0,
        wins: standing ? parseInt(standing.wins) : 0,
        position: standing ? parseInt(standing.position) : 999,
        driverImage: getDriverImage(driver.code, driver.familyName),
        url: driver.url
      };
    });

    const result = { drivers, year: parseInt(year), count: drivers.length, lastUpdate: new Date().toISOString() };
    updateCache('drivers', result);
    
    res.json(result);
  } catch (error) {
    console.error('Drivers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers', message: error.message });
  }
});

// Get All Teams/Constructors for Current Season (Ergast)
app.get('/api/data/teams', async (req, res) => {
  try {
    const year = req.query.year || CURRENT_YEAR;
    
    if (isCacheValid(cache.teams)) {
      return res.json(cache.teams.data);
    }

    const data = await fetchFromErgast(`${year}/constructors`);
    const constructorsList = data.ConstructorTable.Constructors;

    // Get standings to enrich team data
    const standingsData = await fetchFromErgast(`${year}/constructorStandings`);
    const standings = standingsData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

    const teams = constructorsList.map(constructor => {
      const standing = standings.find(s => s.Constructor.constructorId === constructor.constructorId);
      
      return {
        id: constructor.constructorId,
        constructorId: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        teamColor: getTeamColor(constructor.constructorId),
        teamLogo: getTeamLogo(constructor.constructorId),
        carImage: getCarImage(constructor.constructorId, year),
        points: standing ? parseFloat(standing.points) : 0,
        wins: standing ? parseInt(standing.wins) : 0,
        position: standing ? parseInt(standing.position) : 999,
        url: constructor.url
      };
    });

    const result = { teams, year: parseInt(year), count: teams.length, lastUpdate: new Date().toISOString() };
    updateCache('teams', result);
    
    res.json(result);
  } catch (error) {
    console.error('Teams fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teams', message: error.message });
  }
});

// Get Race Schedule (Ergast)
app.get('/api/data/schedule', async (req, res) => {
  try {
    const year = req.query.year || CURRENT_YEAR;
    
    if (isCacheValid(cache.schedule)) {
      return res.json(cache.schedule.data);
    }

    const data = await fetchFromErgast(`${year}`);
    const races = data.RaceTable.Races;

    const schedule = races.map(race => ({
      round: parseInt(race.round),
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      date: race.date,
      time: race.time,
      season: parseInt(race.season),
      url: race.url,
      // Determine if race is upcoming, current, or completed
      status: new Date(race.date) > new Date() ? 'upcoming' : 'completed'
    }));

    // Find next race
    const now = new Date();
    const nextRace = schedule.find(race => new Date(race.date) > now);

    const result = {
      races: schedule,
      nextRace,
      year: parseInt(year),
      totalRaces: schedule.length,
      lastUpdate: new Date().toISOString()
    };
    
    updateCache('schedule', result);
    res.json(result);
  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule', message: error.message });
  }
});

// Get Race Results (Ergast)
app.get('/api/data/race-results/:year/:round', async (req, res) => {
  try {
    const { year, round } = req.params;
    const cacheKey = `${year}_${round}`;
    
    if (cache.raceResults[cacheKey]) {
      const cached = cache.raceResults[cacheKey];
      if (isCacheValid(cached)) {
        return res.json(cached.data);
      }
    }

    const data = await fetchFromErgast(`${year}/${round}/results`);
    const race = data.RaceTable.Races[0];
    
    if (!race) {
      return res.json({ error: 'Race not found', year, round });
    }

    const results = race.Results.map(result => ({
      position: parseInt(result.position),
      points: parseFloat(result.points),
      driverId: result.Driver.driverId,
      driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
      constructorId: result.Constructor.constructorId,
      constructorName: result.Constructor.name,
      grid: parseInt(result.grid),
      laps: parseInt(result.laps),
      status: result.status,
      time: result.Time?.time || 'N/A',
      fastestLap: result.FastestLap ? {
        rank: result.FastestLap.rank,
        lap: result.FastestLap.lap,
        time: result.FastestLap.Time.time,
        avgSpeed: result.FastestLap.AverageSpeed?.speed
      } : null
    }));

    const response = {
      raceName: race.raceName,
      circuitName: race.Circuit.circuitName,
      date: race.date,
      season: race.season,
      round: race.round,
      results,
      lastUpdate: new Date().toISOString()
    };

    cache.raceResults[cacheKey] = { data: response, timestamp: Date.now() };
    res.json(response);
  } catch (error) {
    console.error('Race results error:', error);
    res.status(500).json({ error: 'Failed to fetch race results', message: error.message });
  }
});

// Get F1 News (News API)
app.get('/api/data/news', async (req, res) => {
  try {
    if (isCacheValid(cache.news)) {
      return res.json(cache.news.data);
    }

    if (!NEWS_API_KEY) {
      // Return mock news if no API key provided
      const mockNews = [
        {
          id: 1,
          title: 'Verstappen Dominates Season Finale',
          description: 'Max Verstappen claims his latest victory in spectacular fashion at the Abu Dhabi Grand Prix.',
          category: 'Race',
          date: new Date().toISOString().split('T')[0],
          image: 'https://source.unsplash.com/800x400/?f1,racing,verstappen',
          source: 'Mock News',
          url: '#'
        },
        {
          id: 2,
          title: 'Mercedes Unveils 2025 Car',
          description: 'Mercedes introduces revolutionary aerodynamic package for the upcoming season.',
          category: 'Technical',
          date: new Date().toISOString().split('T')[0],
          image: 'https://source.unsplash.com/800x400/?f1,mercedes,car',
          source: 'Mock News',
          url: '#'
        },
        {
          id: 3,
          title: 'Hamilton Extends Contract',
          description: 'Lewis Hamilton confirms multi-year extension with Mercedes-AMG Petronas.',
          category: 'Driver',
          date: new Date().toISOString().split('T')[0],
          image: 'https://source.unsplash.com/800x400/?f1,hamilton',
          source: 'Mock News',
          url: '#'
        },
        {
          id: 4,
          title: 'FIA Announces New Regulations',
          description: 'Major technical regulation changes announced for the 2026 season.',
          category: 'Regulations',
          date: new Date().toISOString().split('T')[0],
          image: 'https://source.unsplash.com/800x400/?f1,technical',
          source: 'Mock News',
          url: '#'
        }
      ];

      const result = { articles: mockNews, count: mockNews.length, lastUpdate: new Date().toISOString(), source: 'mock' };
      updateCache('news', result);
      return res.json(result);
    }

    // Fetch from News API
    const response = await fetch(
      `${NEWS_API_URL}/everything?q=formula%201%20OR%20f1&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('News API request failed');
    }

    const newsData = await response.json();
    
    const articles = newsData.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description || article.content,
      category: 'Race', // Could categorize based on keywords
      date: article.publishedAt.split('T')[0],
      image: article.urlToImage || 'https://source.unsplash.com/800x400/?formula1,racing',
      source: article.source.name,
      url: article.url,
      author: article.author
    }));

    const result = { articles, count: articles.length, lastUpdate: new Date().toISOString(), source: 'newsapi' };
    updateCache('news', result);
    res.json(result);
  } catch (error) {
    console.error('News fetch error:', error);
    
    // Fallback to mock news on error
    const mockNews = [
      {
        id: 1,
        title: 'F1 News Currently Unavailable',
        description: 'Please check back later for the latest Formula 1 news and updates.',
        category: 'System',
        date: new Date().toISOString().split('T')[0],
        image: 'https://source.unsplash.com/800x400/?formula1,racing',
        source: 'System',
        url: '#'
      }
    ];
    
    res.json({ articles: mockNews, count: 1, lastUpdate: new Date().toISOString(), source: 'fallback', error: error.message });
  }
});

// Stats Endpoint (For F1 Rewind and historical data)
app.get('/api/data/stats', async (req, res) => {
  try {
    // For F1 Rewind page - legendary drivers
    // For Podium Predictor - can use current drivers from Ergast
    // Keep some mock data for features not in Ergast
    
    res.json({
      legendaryDrivers,
      timestamp: new Date().toISOString(),
      source: 'backend'
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to load stats', message: error.message });
  }
});



// ============================================
// Telemetry Routes (MongoDB)
// ============================================

// Save telemetry data
app.post('/api/telemetry', async (req, res) => {
  try {
    const telemetryData = req.body;
    const telemetry = new Telemetry(telemetryData);
    await telemetry.save();
    res.status(201).json({ message: 'Telemetry data saved successfully', telemetry });
  } catch (error) {
    console.error('Save telemetry error:', error);
    res.status(500).json({ error: 'Failed to save telemetry data', message: error.message });
  }
});

// Get telemetry data
app.get('/api/telemetry', async (req, res) => {
  try {
    const { driver, session, year, event } = req.query;
    const query = {};
    if (driver) query.driver = driver;
    if (session) query.session = session;
    if (year) query.year = parseInt(year);
    if (event) query.event = event;

    const telemetry = await Telemetry.find(query).sort({ timestamp: -1 });
    res.json(telemetry);
  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({ error: 'Failed to fetch telemetry data', message: error.message });
  }
});

// ============================================
// Chat Room Routes (MongoDB)
// ============================================

// Get all chat rooms
app.get('/api/chat/rooms', async (req, res) => {
  try {
    const rooms = await ChatRoom.find({}).sort({ lastActivity: -1 });
    res.json(rooms);
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms', message: error.message });
  }
});

// Create a new chat room
app.post('/api/chat/rooms', async (req, res) => {
  try {
    const { name, description, type, createdBy } = req.body;
    const room = new ChatRoom({ name, description, type, createdBy });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ error: 'Failed to create chat room', message: error.message });
  }
});

// Get messages for a specific room
app.get('/api/chat/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json(room.messages);
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', message: error.message });
  }
});

// Add message to a room
app.post('/api/chat/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, username, message } = req.body;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const newMessage = { userId, username, message };
    room.messages.push(newMessage);
    room.lastActivity = new Date();
    await room.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message', message: error.message });
  }
});

// ============================================
// User Routes (MongoDB)
// ============================================

// Get user profile
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

// Create or update user profile
app.post('/api/users', async (req, res) => {
  try {
    const { email, username, favoriteDriver, favoriteTeam, preferences } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      user.username = username || user.username;
      user.favoriteDriver = favoriteDriver || user.favoriteDriver;
      user.favoriteTeam = favoriteTeam || user.favoriteTeam;
      user.preferences = preferences || user.preferences;
      user.lastSeen = new Date();
      await user.save();
    } else {
      user = new User({ email, username, favoriteDriver, favoriteTeam, preferences });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Save user error:', error);
    res.status(500).json({ error: 'Failed to save user', message: error.message });
  }
});

// Update user online status
app.put('/api/users/:email/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { isOnline, lastSeen: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status', message: error.message });
  }
});

// ============================================
// Optional: Python FastF1 Proxy (for Live telemetry)
// ============================================
app.get('/api/data/telemetry/:driver', async (req, res) => {
  try {
    const { driver } = req.params;
    const { year, event, session } = req.query;

    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year);
    if (event) queryParams.append('event', event);
    if (session) queryParams.append('session', session);

    const url = `${FASTF1_API_URL}/telemetry/${driver}?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Python service unavailable');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(503).json({
      error: 'Telemetry service unavailable',
      message: 'Live telemetry requires Python FastF1 service running on port 5003',
      detail: error.message
    });
  }
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log('\n🏎️  F1 Web Application Backend - FastF1 Edition');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 FastF1 API: ${FASTF1_API_URL}`);
  console.log(`📰 News API: ${NEWS_API_KEY ? 'Configured' : 'Using mock data (set NEWS_API_KEY)'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected (optional)'}`);
  console.log(`⚡ Cache Duration: ${CACHE_DURATION / 1000}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📡 Available Endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/data/standings/drivers');
  console.log('   GET  /api/data/standings/constructors');
  console.log('   GET  /api/data/drivers');
  console.log('   GET  /api/data/teams');
  console.log('   GET  /api/data/schedule');
  console.log('   GET  /api/data/race-results/:year/:round');
  console.log('   GET  /api/data/news');
  console.log('   GET  /api/data/stats');
  console.log('   GET  /api/data/telemetry/:driver (requires Python service)');
  console.log('\n⚠️  Make sure Python FastF1 service is running on port 5003');
  console.log('   Run: cd f1-data-service && python python_server.py');
  console.log('\n');
});
