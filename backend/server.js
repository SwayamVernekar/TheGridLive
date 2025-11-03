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
import News from './models/News.js';
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
const CURRENT_YEAR = 2025; // Update to 2025 when season starts
const NEWS_API_KEY = process.env.NEWS_API_KEY || ''; // User provides this
const NEWS_API_URL = 'https://newsapi.org/v2';
const FASTF1_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1';

// ============================================
// Ergast API Helper Function
// ============================================
async function fetchFromErgast(endpoint) {
  try {
    const url = `${ERGAST_API_URL}/${endpoint}.json`;
    console.log(`📡 Fetching from Ergast: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ergast API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.MRData;
  } catch (error) {
    console.error('Ergast API fetch error:', error);
    throw error;
  }
}

// ============================================
// MongoDB Configuration (Primary Data Source)
// ============================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';
let mongoConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    mongoConnected = true;
  })
  .catch(err => {
    console.log('⚠️  MongoDB optional - running without database:', err.message);
    mongoConnected = false;
  });

// Helper function to check MongoDB connectivity
function isMongoConnected() {
  return mongoConnected && mongoose.connection.readyState === 1;
}

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
const RATE_LIMIT_REQUESTS = 100; // Increased for development/testing
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
// MongoDB Helper Functions
// ============================================
async function getFromMongoDB(Model, query = {}, sort = {}, limit = null) {
  try {
    let mongoQuery = Model.find(query);
    if (sort) mongoQuery = mongoQuery.sort(sort);
    if (limit) mongoQuery = mongoQuery.limit(limit);
    return await mongoQuery;
  } catch (error) {
    console.error('MongoDB query error:', error);
    throw error;
  }
}



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

// Welcome Endpoint with Logging
app.get('/api/welcome', (req, res) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  res.json({ message: 'Welcome to the F1 API Service!' });
});

// Get Current Season Driver Standings (MongoDB)
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
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the most recent standings for the year
    console.log('Fetching data from MongoDB...');
    const standingsData = await getFromMongoDB(DriverStandings, { season: parseInt(year) }, { round: -1 }, 1);
    console.log('✓ Received response from MongoDB');

    if (!standingsData || standingsData.length === 0) {
      console.log('⚠ No standings available for year:', year);
      return res.json({ standings: [], year, message: 'No standings available yet' });
    }

    const latestStandings = standingsData[0];
    console.log('Latest standings round:', latestStandings.round);
    console.log('Number of drivers in standings:', latestStandings.standings.length);
    console.log('Processing driver standings...');

    const driverStandings = latestStandings.standings.map((entry, index) => {
      if (index === 0) {
        console.log('Sample entry (first driver):', JSON.stringify(entry, null, 2));
      }
      return {
        position: entry.position,
        points: entry.points,
        wins: entry.wins,
        driverId: entry.driverId,
        driverCode: entry.driverCode,
        driverNumber: entry.driverNumber,
        givenName: entry.givenName,
        familyName: entry.familyName,
        fullName: entry.fullName,
        dateOfBirth: entry.dateOfBirth,
        nationality: entry.nationality,
        constructorId: entry.constructorId,
        constructorName: entry.constructorName,
        teamColor: getTeamColor(entry.constructorId),
        driverImage: getDriverImage(entry.driverCode, entry.familyName)
      };
    });

    console.log('✓ Processed', driverStandings.length, 'driver entries');
    console.log('Sample processed driver:', JSON.stringify(driverStandings[0], null, 2));

    const result = {
      standings: driverStandings,
      year: parseInt(year),
      round: latestStandings.round,
      lastRace: latestStandings.lastRace,
      lastUpdate: latestStandings.lastUpdate || new Date().toISOString()
    };
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

    // FALLBACK: Return mock data when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
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
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get Current Season Constructor Standings (MongoDB)
app.get('/api/data/standings/constructors', async (req, res) => {
  console.log('\n========== CONSTRUCTOR STANDINGS REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const year = req.query.year || CURRENT_YEAR;
  console.log('Year for standings:', year);

  try {
    const cacheKey = `constructorStandings_${year}`;

    // Check cache
    console.log('Checking cache for key:', cacheKey);
    if (isCacheValid(cache.constructorStandings)) {
      console.log('✓ Cache hit! Returning cached data');
      return res.json(cache.constructorStandings.data);
    }
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the most recent standings for the year
    console.log('Fetching data from MongoDB...');
    const standingsData = await getFromMongoDB(ConstructorStandings, { season: parseInt(year) }, { lastUpdate: -1 }, 1);
    console.log('✓ Received response from MongoDB');

    if (!standingsData || standingsData.length === 0) {
      console.log('⚠ No standings available for year:', year);
      return res.json({ standings: [], year, message: 'No standings available yet' });
    }

    const latestStandings = standingsData[0];
    console.log('Latest standings lastUpdate:', latestStandings.lastUpdate);
    console.log('Number of constructors in standings:', latestStandings.standings.length);
    console.log('Processing constructor standings...');

    const constructorStandings = latestStandings.standings.map((entry, index) => {
      if (index === 0) {
        console.log('Sample entry (first constructor):', JSON.stringify(entry, null, 2));
      }
      return {
        position: entry.position,
        points: entry.points,
        wins: entry.wins,
        constructorId: entry.constructorId,
        name: entry.name,
        nationality: entry.nationality,
        teamColor: entry.teamColor,
        teamLogo: getTeamLogo(entry.constructorId),
        carImage: getCarImage(entry.constructorId, year)
      };
    });

    console.log('✓ Processed', constructorStandings.length, 'constructor entries');
    console.log('Sample processed constructor:', JSON.stringify(constructorStandings[0], null, 2));

    const result = {
      standings: constructorStandings,
      year: parseInt(year),
      lastUpdate: latestStandings.lastUpdate || new Date().toISOString()
    };
    console.log('Final result structure:', Object.keys(result));
    console.log('Updating cache...');
    updateCache('constructorStandings', result);
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(result).length, 'bytes');
    res.json(result);
    console.log('✓ Response sent successfully');
    console.log('========== CONSTRUCTOR STANDINGS REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ CONSTRUCTOR STANDINGS ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Constructor standings error:', error);

    // FALLBACK: Return mock data when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
    const mockStandings = [
      { position: 1, points: 860, wins: 7, constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', teamColor: '#3671C6', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/7/79/Red_Bull_Racing_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,red_bull,car,2025' },
      { position: 2, points: 549, wins: 19, constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', teamColor: '#27F4D2', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,mercedes,car,2025' },
      { position: 3, points: 315, wins: 2, constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', teamColor: '#E8002D', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Scuderia_Ferrari_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,ferrari,car,2025' },
      { position: 4, points: 291, wins: 2, constructorId: 'mclaren', name: 'McLaren', nationality: 'British', teamColor: '#FF8000', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,mclaren,car,2025' },
      { position: 5, points: 262, wins: 0, constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', teamColor: '#229971', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Aston_Martin_Aramco_Cognizant_F1.svg', carImage: 'https://source.unsplash.com/800x400/?f1,aston_martin,car,2025' },
      { position: 6, points: 223, wins: 2, constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', teamColor: '#0090FF', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alpine,car,2025' },
      { position: 7, points: 192, wins: 0, constructorId: 'williams', name: 'Williams', nationality: 'British', teamColor: '#005AFF', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Williams_Grand_Prix_Engineering_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,williams,car,2025' },
      { position: 8, points: 152, wins: 0, constructorId: 'alphatauri', name: 'AlphaTauri', nationality: 'Italian', teamColor: '#2B4562', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Scuderia_AlphaTauri_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alphatauri,car,2025' },
      { position: 9, points: 86, wins: 0, constructorId: 'alfa', name: 'Alfa Romeo', nationality: 'Swiss', teamColor: '#C92D4B', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Alfa_Romeo_F1_Team_Orlen_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alfa,car,2025' },
      { position: 10, points: 73, wins: 0, constructorId: 'haas', name: 'Haas F1 Team', nationality: 'American', teamColor: '#B6BABD', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Haas_F1_Team_Logo.svg/1200px-Haas_F1_Team_Logo.svg.png', carImage: 'https://source.unsplash.com/800x400/?f1,haas,car,2025' }
    ];

    const fallbackResult = {
      standings: mockStandings,
      year: parseInt(year),
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get All Drivers for Current Season (MongoDB)
app.get('/api/data/drivers', async (req, res) => {
  console.log('\n========== DRIVERS REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const year = req.query.year || CURRENT_YEAR;
  console.log('Year for drivers:', year);

  try {
    // Check cache
    console.log('Checking cache for drivers...');
    if (isCacheValid(cache.drivers)) {
      console.log('✓ Cache hit! Returning cached data');
      return res.json(cache.drivers.data);
    }
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the most recent drivers data for the year
    console.log('Fetching drivers from MongoDB...');
    const driversData = await getFromMongoDB(Drivers, { season: parseInt(year) }, { lastUpdate: -1 }, 1);
    console.log('✓ Received response from MongoDB');

    if (!driversData || driversData.length === 0) {
      console.log('⚠ No drivers available for year:', year);
      return res.json({ drivers: [], year, message: 'No drivers available yet' });
    }

    const latestDrivers = driversData[0];
    console.log('Latest drivers lastUpdate:', latestDrivers.lastUpdate);
    console.log('Number of drivers:', latestDrivers.drivers.length);
    console.log('Processing drivers...');

    const drivers = latestDrivers.drivers.map((driver, index) => {
      if (index === 0) {
        console.log('Sample driver entry:', JSON.stringify(driver, null, 2));
      }
      return {
        id: driver.driverId,
        driverId: driver.driverId,
        code: driver.driverCode,
        number: driver.driverNumber,
        givenName: driver.givenName,
        familyName: driver.familyName,
        fullName: driver.fullName,
        dateOfBirth: driver.dateOfBirth,
        nationality: driver.nationality,
        team: driver.constructorName,
        teamId: driver.constructorId,
        teamColor: getTeamColor(driver.constructorId),
        points: driver.points,
        wins: driver.wins,
        position: driver.position,
        driverImage: getDriverImage(driver.driverCode, driver.familyName),
        url: driver.url
      };
    });

    console.log('✓ Processed', drivers.length, 'drivers');
    console.log('Sample processed driver:', JSON.stringify(drivers[0], null, 2));

    const result = {
      drivers,
      year: parseInt(year),
      count: drivers.length,
      lastUpdate: latestDrivers.lastUpdate || new Date().toISOString()
    };
    console.log('Final result structure:', Object.keys(result));
    console.log('Updating cache...');
    updateCache('drivers', result);
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(result).length, 'bytes');
    res.json(result);
    console.log('✓ Response sent successfully');
    console.log('========== DRIVERS REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ DRIVERS ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Drivers error:', error);

    // FALLBACK: Return mock data when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
    const mockDrivers = [
      { id: 'max_verstappen', driverId: 'max_verstappen', code: 'VER', number: '1', givenName: 'Max', familyName: 'Verstappen', fullName: 'Max Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch', team: 'Red Bull Racing', teamId: 'red_bull', teamColor: '#3671C6', points: 549, wins: 19, position: 1, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png', url: 'https://en.wikipedia.org/wiki/Max_Verstappen' },
      { id: 'lando_norris', driverId: 'lando_norris', code: 'NOR', number: '4', givenName: 'Lando', familyName: 'Norris', fullName: 'Lando Norris', dateOfBirth: '1999-11-13', nationality: 'British', team: 'McLaren', teamId: 'mclaren', teamColor: '#FF8000', points: 860, wins: 7, position: 2, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png', url: 'https://en.wikipedia.org/wiki/Lando_Norris' },
      { id: 'charles_leclerc', driverId: 'charles_leclerc', code: 'LEC', number: '16', givenName: 'Charles', familyName: 'Leclerc', fullName: 'Charles Leclerc', dateOfBirth: '1997-10-16', nationality: 'Monegasque', team: 'Ferrari', teamId: 'ferrari', teamColor: '#E8002D', points: 315, wins: 2, position: 3, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png', url: 'https://en.wikipedia.org/wiki/Charles_Leclerc' },
      { id: 'oscar_piastri', driverId: 'oscar_piastri', code: 'PIA', number: '81', givenName: 'Oscar', familyName: 'Piastri', fullName: 'Oscar Piastri', dateOfBirth: '2001-04-06', nationality: 'Australian', team: 'McLaren', teamId: 'mclaren', teamColor: '#FF8000', points: 291, wins: 2, position: 4, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png', url: 'https://en.wikipedia.org/wiki/Oscar_Piastri' },
      { id: 'carlos_sainz', driverId: 'carlos_sainz', code: 'SAI', number: '55', givenName: 'Carlos', familyName: 'Sainz', fullName: 'Carlos Sainz', dateOfBirth: '1994-01-01', nationality: 'Spanish', team: 'Ferrari', teamId: 'ferrari', teamColor: '#E8002D', points: 262, wins: 0, position: 5, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png', url: 'https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.' },
      { id: 'lewis_hamilton', driverId: 'lewis_hamilton', code: 'HAM', number: '44', givenName: 'Lewis', familyName: 'Hamilton', fullName: 'Lewis Hamilton', dateOfBirth: '1985-01-07', nationality: 'British', team: 'Mercedes', teamId: 'mercedes', teamColor: '#27F4D2', points: 223, wins: 2, position: 6, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png', url: 'https://en.wikipedia.org/wiki/Lewis_Hamilton' },
      { id: 'george_russell', driverId: 'george_russell', code: 'RUS', number: '63', givenName: 'George', familyName: 'Russell', fullName: 'George Russell', dateOfBirth: '1998-02-15', nationality: 'British', team: 'Mercedes', teamId: 'mercedes', teamColor: '#27F4D2', points: 192, wins: 0, position: 7, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png', url: 'https://en.wikipedia.org/wiki/George_Russell_(racing_driver)' },
      { id: 'sergio_perez', driverId: 'sergio_perez', code: 'PER', number: '11', givenName: 'Sergio', familyName: 'Pérez', fullName: 'Sergio Pérez', dateOfBirth: '1990-01-26', nationality: 'Mexican', team: 'Red Bull Racing', teamId: 'red_bull', teamColor: '#3671C6', points: 152, wins: 0, position: 8, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png', url: 'https://en.wikipedia.org/wiki/Sergio_Pérez' },
      { id: 'fernando_alonso', driverId: 'fernando_alonso', code: 'ALO', number: '14', givenName: 'Fernando', familyName: 'Alonso', fullName: 'Fernando Alonso', dateOfBirth: '1981-07-29', nationality: 'Spanish', team: 'Aston Martin', teamId: 'aston_martin', teamColor: '#229971', points: 86, wins: 0, position: 9, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png', url: 'https://en.wikipedia.org/wiki/Fernando_Alonso' },
      { id: 'nico_hulkenberg', driverId: 'nico_hulkenberg', code: 'HUL', number: '27', givenName: 'Nico', familyName: 'Hülkenberg', fullName: 'Nico Hülkenberg', dateOfBirth: '1987-08-19', nationality: 'German', team: 'Haas F1 Team', teamId: 'haas', teamColor: '#B6BABD', points: 73, wins: 0, position: 10, driverImage: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png', url: 'https://en.wikipedia.org/wiki/Nico_Hülkenberg' }
    ];

    const fallbackResult = {
      drivers: mockDrivers,
      year: parseInt(year),
      count: mockDrivers.length,
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get All Teams/Constructors for Current Season (MongoDB)
app.get('/api/data/teams', async (req, res) => {
  console.log('\n========== TEAMS REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const year = req.query.year || CURRENT_YEAR;
  console.log('Year for teams:', year);

  try {
    // Check cache
    console.log('Checking cache for teams...');
    if (isCacheValid(cache.teams)) {
      console.log('✓ Cache hit! Returning cached data');
      return res.json(cache.teams.data);
    }
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the most recent constructor standings for the year
    console.log('Fetching constructor standings from MongoDB...');
    const standingsData = await getFromMongoDB(ConstructorStandings, { season: parseInt(year) }, { lastUpdate: -1 }, 1);
    console.log('✓ Received response from MongoDB');

    if (!standingsData || standingsData.length === 0) {
      console.log('⚠ No constructor standings available for year:', year);
      return res.json({ teams: [], year, message: 'No teams available yet' });
    }

    const latestStandings = standingsData[0];
    console.log('Latest standings lastUpdate:', latestStandings.lastUpdate);
    console.log('Number of constructors in standings:', latestStandings.standings.length);
    console.log('Processing constructor standings...');

    const teams = latestStandings.standings.map((entry, index) => {
      if (index === 0) {
        console.log('Sample entry (first constructor):', JSON.stringify(entry, null, 2));
      }
      return {
        id: entry.constructorId,
        constructorId: entry.constructorId,
        name: entry.name,
        nationality: entry.nationality,
        teamColor: getTeamColor(entry.constructorId),
        teamLogo: getTeamLogo(entry.constructorId),
        carImage: getCarImage(entry.constructorId, year),
        points: entry.points,
        wins: entry.wins,
        position: entry.position,
        url: `https://en.wikipedia.org/wiki/${entry.name.replace(/\s+/g, '_')}`
      };
    });

    console.log('✓ Processed', teams.length, 'constructor entries');
    console.log('Sample processed constructor:', JSON.stringify(teams[0], null, 2));

    const result = {
      teams,
      year: parseInt(year),
      count: teams.length,
      lastUpdate: latestStandings.lastUpdate || new Date().toISOString()
    };
    console.log('Final result structure:', Object.keys(result));
    console.log('Updating cache...');
    updateCache('teams', result);
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(result).length, 'bytes');
    res.json(result);
    console.log('✓ Response sent successfully');
    console.log('========== TEAMS REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ TEAMS ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Teams error:', error);

    // FALLBACK: Return mock data when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
    const mockTeams = [
      { id: 'red_bull', constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', teamColor: '#3671C6', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/7/79/Red_Bull_Racing_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,red_bull,car,2025', points: 860, wins: 7, position: 1, url: 'https://en.wikipedia.org/wiki/Red_Bull_Racing' },
      { id: 'mercedes', constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', teamColor: '#27F4D2', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,mercedes,car,2025', points: 549, wins: 19, position: 2, url: 'https://en.wikipedia.org/wiki/Mercedes-Benz_in_Formula_One' },
      { id: 'ferrari', constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', teamColor: '#E8002D', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Scuderia_Ferrari_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,ferrari,car,2025', points: 315, wins: 2, position: 3, url: 'https://en.wikipedia.org/wiki/Scuderia_Ferrari' },
      { id: 'mclaren', constructorId: 'mclaren', name: 'McLaren', nationality: 'British', teamColor: '#FF8000', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,mclaren,car,2025', points: 291, wins: 2, position: 4, url: 'https://en.wikipedia.org/wiki/McLaren' },
      { id: 'aston_martin', constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', teamColor: '#229971', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Aston_Martin_Aramco_Cognizant_F1.svg', carImage: 'https://source.unsplash.com/800x400/?f1,aston_martin,car,2025', points: 262, wins: 0, position: 5, url: 'https://en.wikipedia.org/wiki/Aston_Martin_in_Formula_One' },
      { id: 'alpine', constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', teamColor: '#0090FF', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alpine,car,2025', points: 223, wins: 2, position: 6, url: 'https://en.wikipedia.org/wiki/Alpine_F1_Team' },
      { id: 'williams', constructorId: 'williams', name: 'Williams', nationality: 'British', teamColor: '#005AFF', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Williams_Grand_Prix_Engineering_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,williams,car,2025', points: 192, wins: 0, position: 7, url: 'https://en.wikipedia.org/wiki/Williams_Grand_Prix_Engineering' },
      { id: 'alphatauri', constructorId: 'alphatauri', name: 'AlphaTauri', nationality: 'Italian', teamColor: '#2B4562', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Scuderia_AlphaTauri_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alphatauri,car,2025', points: 152, wins: 0, position: 8, url: 'https://en.wikipedia.org/wiki/Scuderia_AlphaTauri' },
      { id: 'alfa', constructorId: 'alfa', name: 'Alfa Romeo', nationality: 'Swiss', teamColor: '#C92D4B', teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Alfa_Romeo_F1_Team_Orlen_logo.svg', carImage: 'https://source.unsplash.com/800x400/?f1,alfa,car,2025', points: 86, wins: 0, position: 9, url: 'https://en.wikipedia.org/wiki/Alfa_Romeo_in_Formula_One' },
      { id: 'haas', constructorId: 'haas', name: 'Haas F1 Team', nationality: 'American', teamColor: '#B6BABD', teamLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Haas_F1_Team_Logo.svg/1200px-Haas_F1_Team_Logo.svg.png', carImage: 'https://source.unsplash.com/800x400/?f1,haas,car,2025', points: 73, wins: 0, position: 10, url: 'https://en.wikipedia.org/wiki/Haas_F1_Team' }
    ];

    const fallbackResult = {
      teams: mockTeams,
      year: parseInt(year),
      count: mockTeams.length,
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get Race Schedule (MongoDB)
app.get('/api/data/schedule', async (req, res) => {
  console.log('\n========== SCHEDULE REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const year = req.query.year || CURRENT_YEAR;
  console.log('Year for schedule:', year);

  try {
    // Check cache
    console.log('Checking cache for schedule...');
    if (isCacheValid(cache.schedule)) {
      console.log('✓ Cache hit! Returning cached data');
      return res.json(cache.schedule.data);
    }
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the schedule for the year
    console.log('Fetching schedule from MongoDB...');
    const scheduleData = await getFromMongoDB(Schedule, { season: parseInt(year) }, { lastUpdate: -1 }, 1);
    console.log('✓ Received response from MongoDB');

    if (!scheduleData || scheduleData.length === 0) {
      console.log('⚠ No schedule available for year:', year);
      return res.json({ races: [], year, message: 'No schedule available yet' });
    }

    const scheduleDoc = scheduleData[0];
    console.log('Schedule lastUpdate:', scheduleDoc.lastUpdate);
    console.log('Number of races in schedule:', scheduleDoc.races.length);
    console.log('Processing schedule...');

    const schedule = scheduleDoc.races.map((race, index) => {
      if (index === 0) {
        console.log('Sample race entry:', JSON.stringify(race, null, 2));
      }
      return {
        round: race.round,
        raceName: race.raceName,
        circuitId: race.circuitId,
        circuitName: race.circuitName,
        locality: race.locality,
        country: race.country,
        date: race.date,
        time: race.time,
        season: race.season,
        url: race.url,
        // Determine if race is upcoming, current, or completed
        status: new Date(race.date) > new Date() ? 'upcoming' : 'completed'
      };
    });

    // Find next race
    const now = new Date();
    const nextRace = schedule.find(race => new Date(race.date) > now);

    console.log('✓ Processed', schedule.length, 'races');
    console.log('Next race:', nextRace ? nextRace.raceName : 'None');

    const result = {
      races: schedule,
      nextRace,
      year: parseInt(year),
      totalRaces: schedule.length,
      lastUpdate: scheduleDoc.lastUpdate || new Date().toISOString()
    };
    console.log('Final result structure:', Object.keys(result));
    console.log('Updating cache...');
    updateCache('schedule', result);
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(result).length, 'bytes');
    res.json(result);
    console.log('✓ Response sent successfully');
    console.log('========== SCHEDULE REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ SCHEDULE ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Schedule error:', error);

    // FALLBACK: Return mock schedule when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
    const mockSchedule = [
      { round: 1, raceName: 'Bahrain Grand Prix', circuitId: 'bahrain', circuitName: 'Bahrain International Circuit', locality: 'Sakhir', country: 'Bahrain', date: '2025-03-02', time: '15:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Bahrain_Grand_Prix', status: 'upcoming' },
      { round: 2, raceName: 'Saudi Arabian Grand Prix', circuitId: 'jeddah', circuitName: 'Jeddah Corniche Circuit', locality: 'Jeddah', country: 'Saudi Arabia', date: '2025-03-09', time: '17:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Saudi_Arabian_Grand_Prix', status: 'upcoming' },
      { round: 3, raceName: 'Australian Grand Prix', circuitId: 'albert_park', circuitName: 'Albert Park Grand Prix Circuit', locality: 'Melbourne', country: 'Australia', date: '2025-03-23', time: '04:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Australian_Grand_Prix', status: 'upcoming' },
      { round: 4, raceName: 'Japanese Grand Prix', circuitId: 'suzuka', circuitName: 'Suzuka Circuit', locality: 'Suzuka', country: 'Japan', date: '2025-04-06', time: '05:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Japanese_Grand_Prix', status: 'upcoming' },
      { round: 5, raceName: 'Chinese Grand Prix', circuitId: 'shanghai', circuitName: 'Shanghai International Circuit', locality: 'Shanghai', country: 'China', date: '2025-04-13', time: '07:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Chinese_Grand_Prix', status: 'upcoming' },
      { round: 6, raceName: 'Miami Grand Prix', circuitId: 'miami', circuitName: 'Miami International Autodrome', locality: 'Miami', country: 'USA', date: '2025-05-04', time: '20:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Miami_Grand_Prix', status: 'upcoming' },
      { round: 7, raceName: 'Emilia Romagna Grand Prix', circuitId: 'imola', circuitName: 'Autodromo Enzo e Dino Ferrari', locality: 'Imola', country: 'Italy', date: '2025-05-18', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Emilia_Romagna_Grand_Prix', status: 'upcoming' },
      { round: 8, raceName: 'Monaco Grand Prix', circuitId: 'monaco', circuitName: 'Circuit de Monaco', locality: 'Monte-Carlo', country: 'Monaco', date: '2025-05-25', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Monaco_Grand_Prix', status: 'upcoming' },
      { round: 9, raceName: 'Spanish Grand Prix', circuitId: 'catalunya', circuitName: 'Circuit de Barcelona-Catalunya', locality: 'Montmeló', country: 'Spain', date: '2025-06-01', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Spanish_Grand_Prix', status: 'upcoming' },
      { round: 10, raceName: 'Canadian Grand Prix', circuitId: 'villeneuve', circuitName: 'Circuit Gilles Villeneuve', locality: 'Montreal', country: 'Canada', date: '2025-06-15', time: '18:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Canadian_Grand_Prix', status: 'upcoming' },
      { round: 11, raceName: 'Austrian Grand Prix', circuitId: 'red_bull_ring', circuitName: 'Red Bull Ring', locality: 'Spielberg', country: 'Austria', date: '2025-06-29', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Austrian_Grand_Prix', status: 'upcoming' },
      { round: 12, raceName: 'British Grand Prix', circuitId: 'silverstone', circuitName: 'Silverstone Circuit', locality: 'Silverstone', country: 'UK', date: '2025-07-06', time: '14:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_British_Grand_Prix', status: 'upcoming' },
      { round: 13, raceName: 'Hungarian Grand Prix', circuitId: 'hungaroring', circuitName: 'Hungaroring', locality: 'Budapest', country: 'Hungary', date: '2025-07-20', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Hungarian_Grand_Prix', status: 'upcoming' },
      { round: 14, raceName: 'Belgian Grand Prix', circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', locality: 'Stavelot', country: 'Belgium', date: '2025-07-27', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Belgian_Grand_Prix', status: 'upcoming' },
      { round: 15, raceName: 'Dutch Grand Prix', circuitId: 'zandvoort', circuitName: 'Circuit Zandvoort', locality: 'Zandvoort', country: 'Netherlands', date: '2025-08-31', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Dutch_Grand_Prix', status: 'upcoming' },
      { round: 16, raceName: 'Italian Grand Prix', circuitId: 'monza', circuitName: 'Autodromo Nazionale di Monza', locality: 'Monza', country: 'Italy', date: '2025-09-07', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Italian_Grand_Prix', status: 'upcoming' },
      { round: 17, raceName: 'Azerbaijan Grand Prix', circuitId: 'baku', circuitName: 'Baku City Circuit', locality: 'Baku', country: 'Azerbaijan', date: '2025-09-21', time: '11:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Azerbaijan_Grand_Prix', status: 'upcoming' },
      { round: 18, raceName: 'Singapore Grand Prix', circuitId: 'marina_bay', circuitName: 'Marina Bay Street Circuit', locality: 'Marina Bay', country: 'Singapore', date: '2025-10-05', time: '12:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Singapore_Grand_Prix', status: 'upcoming' },
      { round: 19, raceName: 'United States Grand Prix', circuitId: 'americas', circuitName: 'Circuit of the Americas', locality: 'Austin', country: 'USA', date: '2025-10-19', time: '19:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_United_States_Grand_Prix', status: 'upcoming' },
      { round: 20, raceName: 'Mexico City Grand Prix', circuitId: 'rodriguez', circuitName: 'Autódromo Hermanos Rodríguez', locality: 'Mexico City', country: 'Mexico', date: '2025-10-26', time: '20:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Mexico_City_Grand_Prix', status: 'upcoming' },
      { round: 21, raceName: 'Brazilian Grand Prix', circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', locality: 'São Paulo', country: 'Brazil', date: '2025-11-09', time: '17:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Brazilian_Grand_Prix', status: 'upcoming' },
      { round: 22, raceName: 'Las Vegas Grand Prix', circuitId: 'las_vegas', circuitName: 'Las Vegas Strip Circuit', locality: 'Las Vegas', country: 'USA', date: '2025-11-22', time: '06:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Las_Vegas_Grand_Prix', status: 'upcoming' },
      { round: 23, raceName: 'Qatar Grand Prix', circuitId: 'losail', circuitName: 'Lusail International Circuit', locality: 'Lusail', country: 'Qatar', date: '2025-11-30', time: '14:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Qatar_Grand_Prix', status: 'upcoming' },
      { round: 24, raceName: 'Abu Dhabi Grand Prix', circuitId: 'yas_marina', circuitName: 'Yas Marina Circuit', locality: 'Abu Dhabi', country: 'UAE', date: '2025-12-07', time: '13:00:00Z', season: 2025, url: 'https://en.wikipedia.org/wiki/2025_Abu_Dhabi_Grand_Prix', status: 'upcoming' }
    ];

    // Find next race from mock data
    const now = new Date();
    const nextRace = mockSchedule.find(race => new Date(race.date) > now);

    const fallbackResult = {
      races: mockSchedule,
      nextRace,
      year: parseInt(year),
      totalRaces: mockSchedule.length,
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get Race Results (MongoDB)
app.get('/api/data/race-results/:year/:round', async (req, res) => {
  console.log('\n========== RACE RESULTS REQUEST RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request Query:', req.query);

  const { year, round } = req.params;
  console.log('Year for race results:', year);
  console.log('Round for race results:', round);

  try {
    const cacheKey = `${year}_${round}`;

    // Check cache
    console.log('Checking cache for key:', cacheKey);
    if (cache.raceResults[cacheKey]) {
      const cached = cache.raceResults[cacheKey];
      if (isCacheValid(cached)) {
        console.log('✓ Cache hit! Returning cached data');
        return res.json(cached.data);
      }
    }
    console.log('✗ Cache miss or expired. Fetching from MongoDB...');

    // Fetch from MongoDB - get the race results for the specific year and round
    console.log('Fetching race results from MongoDB...');
    const raceData = await getFromMongoDB(RaceResults, { season: parseInt(year), round: parseInt(round) }, {}, 1);
    console.log('✓ Received response from MongoDB');

    if (!raceData || raceData.length === 0) {
      console.log('⚠ No race results available for year:', year, 'round:', round);
      return res.json({ error: 'Race results not found', year, round, message: 'No race results available yet' });
    }

    const race = raceData[0];
    console.log('Race name:', race.raceName);
    console.log('Circuit name:', race.circuitName);
    console.log('Number of results:', race.results.length);
    console.log('Processing race results...');

    const response = {
      raceName: race.raceName,
      circuitName: race.circuitName,
      date: race.date,
      season: race.season,
      round: race.round,
      results: race.results,
      lastUpdate: race.lastUpdate || new Date().toISOString()
    };

    console.log('✓ Processed race results');
    console.log('Final result structure:', Object.keys(response));
    console.log('Updating cache...');
    cache.raceResults[cacheKey] = { data: response, timestamp: Date.now() };
    console.log('✓ Cache updated');

    console.log('Sending response to frontend...');
    console.log('Response size:', JSON.stringify(response).length, 'bytes');
    res.json(response);
    console.log('✓ Response sent successfully');
    console.log('========== RACE RESULTS REQUEST COMPLETE ==========\n');
  } catch (error) {
    console.error('\n❌ RACE RESULTS ERROR ❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Race results error:', error);

    // FALLBACK: Return mock data when MongoDB is unavailable
    console.log('⚠️ MongoDB unavailable - returning fallback data');
    const mockResults = [
      { position: 1, points: 25, driverId: 'max_verstappen', driverName: 'Max Verstappen', constructorId: 'red_bull', constructorName: 'Red Bull Racing', grid: 1, laps: 58, status: 'Finished', time: '1:24:08.761', fastestLap: { rank: 2, lap: 44, time: '1:11.742', avgSpeed: '207.235' } },
      { position: 2, points: 18, driverId: 'lando_norris', driverName: 'Lando Norris', constructorId: 'mclaren', constructorName: 'McLaren', grid: 3, laps: 58, status: 'Finished', time: '+22.457', fastestLap: { rank: 1, lap: 50, time: '1:11.632', avgSpeed: '207.573' } },
      { position: 3, points: 15, driverId: 'charles_leclerc', driverName: 'Charles Leclerc', constructorId: 'ferrari', constructorName: 'Ferrari', grid: 2, laps: 58, status: 'Finished', time: '+32.310', fastestLap: null },
      { position: 4, points: 12, driverId: 'oscar_piastri', driverName: 'Oscar Piastri', constructorId: 'mclaren', constructorName: 'McLaren', grid: 4, laps: 58, status: 'Finished', time: '+35.888', fastestLap: null },
      { position: 5, points: 10, driverId: 'carlos_sainz', driverName: 'Carlos Sainz', constructorId: 'ferrari', constructorName: 'Ferrari', grid: 5, laps: 58, status: 'Finished', time: '+47.391', fastestLap: null }
    ];

    const fallbackResult = {
      raceName: 'Bahrain Grand Prix',
      circuitName: 'Bahrain International Circuit',
      date: '2025-03-02',
      season: parseInt(year),
      round: parseInt(round),
      results: mockResults,
      lastUpdate: new Date().toISOString(),
      isMockData: true,
      error: 'MongoDB unavailable - using fallback data'
    };

    return res.json(fallbackResult); // Add return to prevent further execution
  }
});

// Get F1 News (Database + News API fallback)
app.get('/api/data/news', async (req, res) => {
  try {
    if (isCacheValid(cache.news)) {
      return res.json(cache.news.data);
    }

    // First try to get news from database
    const dbNews = await News.find({ published: true }).sort({ publishedAt: -1 }).limit(20);
    if (dbNews.length > 0) {
      const articles = dbNews.map((news, index) => ({
        id: news._id.toString(),
        title: news.title,
        content: news.content,
        summary: news.summary,
        category: news.category,
        date: news.publishedAt.toISOString().split('T')[0],
        image: news.image,
        source: 'F1 Grid Live',
        url: `#/news/${news._id}`,
        author: news.author,
        tags: news.tags
      }));

      const result = { articles, count: articles.length, lastUpdate: new Date().toISOString(), source: 'database' };
      updateCache('news', result);
      return res.json(result);
    }

    // Fallback to News API if no database news
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
  console.log(`📊 FastF1 API: ${process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1'}`);
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
