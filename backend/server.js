// F1 Web Application Backend - FastF1 + MongoDB Only
// No Ergast API - Uses Python FastF1 service with MongoDB fallback
// Run: npm install && node server.js

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Import MongoDB Models
import Driver from './models/Driver.js';
import DriverStanding from './models/DriverStanding.js';
import ConstructorStanding from './models/ConstructorStanding.js';
import Team from './models/Team.js';
import Schedule from './models/Schedule.js';
import RaceResult from './models/RaceResult.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// ============================================
// External API Configuration
// ============================================
const FASTF1_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1';
const CURRENT_YEAR = 2025;
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2';

// ============================================
// MongoDB Connection
// ============================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1app';
let isMongoConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    isMongoConnected = true;
  })
  .catch(err => {
    console.log('⚠️  MongoDB not connected:', err.message);
    console.log('    Falling back to FastF1 API only');
    isMongoConnected = false;
  });

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
  'red_bull': { color: '3671C6', logo: 'https://upload.wikimedia.org/wikipedia/en/7/79/Red_Bull_Racing_logo.svg' },
  'mercedes': { color: '27F4D2', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg' },
  'ferrari': { color: 'E8002D', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Scuderia_Ferrari_Logo.svg' },
  'mclaren': { color: 'FF8000', logo: 'https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg' },
  'aston_martin': { color: '229971', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Aston_Martin_Aramco_Cognizant_F1.svg' },
  'alpine': { color: '0090ff', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg' },
  'williams': { color: '64C4FF', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Williams_Grand_Prix_Engineering_logo.svg' },
  'rb': { color: '6692ff', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Scuderia_AlphaTauri_logo.svg' },
  'kick_sauber': { color: '52E252', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Alfa_Romeo_F1_Team_Orlen_logo.svg' },
  'haas': { color: 'B6BABD', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Haas_F1_Team_Logo.svg/1200px-Haas_F1_Team_Logo.svg.png' }
};

function getTeamColor(constructorId) {
  const normalized = constructorId?.toLowerCase().replace(/\s+/g, '_') || '';
  return teamData[normalized]?.color || 'CCCCCC';
}

function getTeamLogo(constructorId) {
  const normalized = constructorId?.toLowerCase().replace(/\s+/g, '_') || '';
  return teamData[normalized]?.logo || `https://via.placeholder.com/200x200?text=${constructorId}`;
}

function getDriverImage(driverCode, driverSurname) {
  const code = driverCode || driverSurname?.substring(0, 3).toUpperCase() || 'DRV';
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${code}/${driverSurname?.toLowerCase()}.png`;
}

// ============================================
// FastF1 API Helper Functions
// ============================================
async function fetchFromFastF1(endpoint) {
  const url = `${FASTF1_API_URL}/${endpoint}`;
  console.log(`  [FastF1] Fetching: ${url}`);
  
  try {
    const response = await fetch(url, { timeout: 10000 });
    
    if (!response.ok) {
      throw new Error(`FastF1 API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`  [FastF1] Success`);
    return data;
  } catch (error) {
    console.error(`  [FastF1] Error: ${error.message}`);
    throw error;
  }
}

// ============================================
// MongoDB Fallback Functions
// ============================================
async function getDriverStandingsFromMongo(year) {
  if (!isMongoConnected) return null;
  try {
    const standings = await DriverStanding.find({ year }).sort({ position: 1 });
    if (standings && standings.length > 0) {
      console.log(`  [MongoDB] Found ${standings.length} driver standings for ${year}`);
      return standings;
    }
    return null;
  } catch (error) {
    console.error(`  [MongoDB] Error fetching driver standings:`, error.message);
    return null;
  }
}

async function saveDriverStandingsToMongo(standings, year) {
  if (!isMongoConnected) return;
  try {
    // Clear old data for this year
    await DriverStanding.deleteMany({ year });
    // Insert new data
    await DriverStanding.insertMany(standings.map(s => ({ ...s, year })));
    console.log(`  [MongoDB] Saved ${standings.length} driver standings for ${year}`);
  } catch (error) {
    console.error(`  [MongoDB] Error saving driver standings:`, error.message);
  }
}

async function getConstructorStandingsFromMongo(year) {
  if (!isMongoConnected) return null;
  try {
    const standings = await ConstructorStanding.find({ year }).sort({ position: 1 });
    if (standings && standings.length > 0) {
      console.log(`  [MongoDB] Found ${standings.length} constructor standings for ${year}`);
      return standings;
    }
    return null;
  } catch (error) {
    console.error(`  [MongoDB] Error fetching constructor standings:`, error.message);
    return null;
  }
}

async function getDriversFromMongo(year) {
  if (!isMongoConnected) return null;
  try {
    const drivers = await Driver.find({ year });
    if (drivers && drivers.length > 0) {
      console.log(`  [MongoDB] Found ${drivers.length} drivers for ${year}`);
      return drivers;
    }
    return null;
  } catch (error) {
    console.error(`  [MongoDB] Error fetching drivers:`, error.message);
    return null;
  }
}

async function getTeamsFromMongo(year) {
  if (!isMongoConnected) return null;
  try {
    const teams = await Team.find({ year });
    if (teams && teams.length > 0) {
      console.log(`  [MongoDB] Found ${teams.length} teams for ${year}`);
      return teams;
    }
    return null;
  } catch (error) {
    console.error(`  [MongoDB] Error fetching teams:`, error.message);
    return null;
  }
}

async function getScheduleFromMongo(year) {
  if (!isMongoConnected) return null;
  try {
    const schedule = await Schedule.find({ year }).sort({ round: 1 });
    if (schedule && schedule.length > 0) {
      console.log(`  [MongoDB] Found ${schedule.length} races in schedule for ${year}`);
      return schedule;
    }
    return null;
  } catch (error) {
    console.error(`  [MongoDB] Error fetching schedule:`, error.message);
    return null;
  }
}

// ============================================
// Mock/Fallback Data
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
    quote: 'If you no longer go for a gap that exists, you are no longer a racing driver.'
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
    quote: 'Once something is a passion, the motivation is there.'
  },
  {
    id: 'hamilton',
    name: 'Lewis Hamilton',
    era: 'The Modern Era',
    championships: 7,
    wins: 103,
    poles: 104,
    podiums: 197,
    teamColor: '27F4D2',
    nationality: 'British',
    quote: 'Still I rise.'
  }
];

// ============================================
// API Routes
// ============================================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    let fastf1Status = 'unknown';
    try {
      await fetch(`${FASTF1_API_URL}/health`, { timeout: 3000 });
      fastf1Status = 'connected';
    } catch {
      fastf1Status = 'unavailable';
    }

    res.json({
      status: 'healthy',
      backend: 'running',
      fastf1Api: fastf1Status,
      mongodb: isMongoConnected ? 'connected' : 'disconnected',
      cache: Object.keys(cache).reduce((acc, key) => {
        if (key !== 'raceResults') {
          acc[key] = isCacheValid(cache[key]) ? 'valid' : 'expired';
        }
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      error: error.message
    });
  }
});

// Get Driver Standings
app.get('/api/data/standings/drivers', async (req, res) => {
  const year = parseInt(req.query.year) || CURRENT_YEAR;
  console.log(`\n[API] Driver Standings requested for year ${year}`);
  
  try {
    // Check cache
    if (isCacheValid(cache.driverStandings)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.driverStandings.data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`standings?year=${year}`);
      
      if (data && data.standings && data.standings.length > 0) {
        const standings = data.standings.map(entry => ({
          position: entry.position,
          points: entry.points,
          wins: entry.wins || 0,
          driverId: entry.driver?.toLowerCase().replace(/\s+/g, '_') || '',
          driverCode: entry.abbreviation || entry.driver?.substring(0, 3).toUpperCase() || '',
          driverNumber: entry.number || '',
          givenName: entry.firstName || '',
          familyName: entry.lastName || '',
          fullName: entry.fullName || `${entry.firstName} ${entry.lastName}`,
          nationality: entry.nationality || '',
          constructorId: entry.team?.toLowerCase().replace(/\s+/g, '_') || '',
          constructorName: entry.team || '',
          teamColor: `#${getTeamColor(entry.team)}`,
          driverImage: getDriverImage(entry.abbreviation, entry.lastName)
        }));

        const result = { standings, year, lastUpdate: new Date().toISOString(), source: 'fastf1' };
        updateCache('driverStandings', result);
        
        // Save to MongoDB for future fallback
        await saveDriverStandingsToMongo(standings, year);
        
        return res.json(result);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    console.log(`  [Source] Trying MongoDB...`);
    const mongoStandings = await getDriverStandingsFromMongo(year);
    if (mongoStandings) {
      const result = { 
        standings: mongoStandings, 
        year, 
        lastUpdate: new Date().toISOString(), 
        source: 'mongodb' 
      };
      updateCache('driverStandings', result);
      return res.json(result);
    }

    // No data available
    console.log(`  [Source] No data available`);
    res.json({ 
      standings: [], 
      year, 
      message: 'No standings data available yet',
      source: 'none'
    });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch driver standings', message: error.message });
  }
});

// Get Constructor Standings
app.get('/api/data/standings/constructors', async (req, res) => {
  const year = parseInt(req.query.year) || CURRENT_YEAR;
  console.log(`\n[API] Constructor Standings requested for year ${year}`);
  
  try {
    // Check cache
    if (isCacheValid(cache.constructorStandings)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.constructorStandings.data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`constructor-standings?year=${year}`);
      
      if (data && data.standings && data.standings.length > 0) {
        const standings = data.standings.map(entry => ({
          position: entry.position,
          points: entry.points,
          wins: entry.wins || 0,
          constructorId: entry.team?.toLowerCase().replace(/\s+/g, '_') || '',
          name: entry.team || '',
          nationality: entry.nationality || '',
          teamColor: `#${getTeamColor(entry.team)}`,
          logo: getTeamLogo(entry.team)
        }));

        const result = { standings, year, lastUpdate: new Date().toISOString(), source: 'fastf1' };
        updateCache('constructorStandings', result);
        return res.json(result);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    console.log(`  [Source] Trying MongoDB...`);
    const mongoStandings = await getConstructorStandingsFromMongo(year);
    if (mongoStandings) {
      const result = { 
        standings: mongoStandings, 
        year, 
        lastUpdate: new Date().toISOString(), 
        source: 'mongodb' 
      };
      updateCache('constructorStandings', result);
      return res.json(result);
    }

    // No data available
    res.json({ standings: [], year, message: 'No constructor standings available yet', source: 'none' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch constructor standings', message: error.message });
  }
});

// Get All Drivers
app.get('/api/data/drivers', async (req, res) => {
  const year = parseInt(req.query.year) || CURRENT_YEAR;
  console.log(`\n[API] Drivers requested for year ${year}`);
  
  try {
    // Check cache
    if (isCacheValid(cache.drivers)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.drivers.data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`drivers?year=${year}`);
      
      if (data && data.drivers && data.drivers.length > 0) {
        const drivers = data.drivers.map(driver => ({
          id: driver.driverId || driver.abbreviation,
          driverId: driver.driverId || driver.abbreviation,
          code: driver.abbreviation,
          number: driver.number,
          givenName: driver.firstName,
          familyName: driver.lastName,
          fullName: driver.fullName || `${driver.firstName} ${driver.lastName}`,
          nationality: driver.nationality,
          team: driver.team,
          teamId: driver.team?.toLowerCase().replace(/\s+/g, '_'),
          teamColor: `#${getTeamColor(driver.team)}`,
          driverImage: getDriverImage(driver.abbreviation, driver.lastName)
        }));

        const result = { drivers, year, count: drivers.length, lastUpdate: new Date().toISOString(), source: 'fastf1' };
        updateCache('drivers', result);
        return res.json(result);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    console.log(`  [Source] Trying MongoDB...`);
    const mongoDrivers = await getDriversFromMongo(year);
    if (mongoDrivers) {
      const result = { 
        drivers: mongoDrivers, 
        year, 
        count: mongoDrivers.length, 
        lastUpdate: new Date().toISOString(), 
        source: 'mongodb' 
      };
      updateCache('drivers', result);
      return res.json(result);
    }

    // No data available
    res.json({ drivers: [], year, count: 0, message: 'No driver data available yet', source: 'none' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch drivers', message: error.message });
  }
});

// Get All Teams
app.get('/api/data/teams', async (req, res) => {
  const year = parseInt(req.query.year) || CURRENT_YEAR;
  console.log(`\n[API] Teams requested for year ${year}`);
  
  try {
    // Check cache
    if (isCacheValid(cache.teams)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.teams.data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`teams?year=${year}`);
      
      if (data && data.teams && data.teams.length > 0) {
        const teams = data.teams.map(team => ({
          id: team.teamId || team.name?.toLowerCase().replace(/\s+/g, '_'),
          constructorId: team.teamId || team.name?.toLowerCase().replace(/\s+/g, '_'),
          name: team.name,
          nationality: team.nationality,
          teamColor: `#${getTeamColor(team.name)}`,
          teamLogo: getTeamLogo(team.name)
        }));

        const result = { teams, year, count: teams.length, lastUpdate: new Date().toISOString(), source: 'fastf1' };
        updateCache('teams', result);
        return res.json(result);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    console.log(`  [Source] Trying MongoDB...`);
    const mongoTeams = await getTeamsFromMongo(year);
    if (mongoTeams) {
      const result = { 
        teams: mongoTeams, 
        year, 
        count: mongoTeams.length, 
        lastUpdate: new Date().toISOString(), 
        source: 'mongodb' 
      };
      updateCache('teams', result);
      return res.json(result);
    }

    // No data available
    res.json({ teams: [], year, count: 0, message: 'No team data available yet', source: 'none' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams', message: error.message });
  }
});

// Get Race Schedule
app.get('/api/data/schedule', async (req, res) => {
  const year = parseInt(req.query.year) || CURRENT_YEAR;
  console.log(`\n[API] Schedule requested for year ${year}`);
  
  try {
    // Check cache
    if (isCacheValid(cache.schedule)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.schedule.data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`schedule?year=${year}`);
      
      if (data && data.schedule && data.schedule.length > 0) {
        const now = new Date();
        const races = data.schedule.map(race => ({
          round: race.round,
          raceName: race.eventName || race.raceName,
          circuitId: race.circuitId || race.location?.toLowerCase().replace(/\s+/g, '_'),
          circuitName: race.circuitName || race.officialEventName,
          locality: race.location,
          country: race.country,
          date: race.eventDate || race.date,
          time: race.eventTime || race.time,
          season: year,
          status: new Date(race.eventDate || race.date) > now ? 'upcoming' : 'completed'
        }));

        const nextRace = races.find(race => race.status === 'upcoming');
        const result = { 
          races, 
          nextRace, 
          year, 
          totalRaces: races.length, 
          lastUpdate: new Date().toISOString(), 
          source: 'fastf1' 
        };
        updateCache('schedule', result);
        return res.json(result);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    console.log(`  [Source] Trying MongoDB...`);
    const mongoSchedule = await getScheduleFromMongo(year);
    if (mongoSchedule) {
      const now = new Date();
      const races = mongoSchedule.map(race => ({
        ...race.toObject(),
        status: new Date(race.date) > now ? 'upcoming' : 'completed'
      }));
      const nextRace = races.find(race => race.status === 'upcoming');
      
      const result = { 
        races, 
        nextRace, 
        year, 
        totalRaces: races.length, 
        lastUpdate: new Date().toISOString(), 
        source: 'mongodb' 
      };
      updateCache('schedule', result);
      return res.json(result);
    }

    // No data available
    res.json({ races: [], year, totalRaces: 0, message: 'No schedule data available yet', source: 'none' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch schedule', message: error.message });
  }
});

// Get Race Results
app.get('/api/data/race-results/:year/:round', async (req, res) => {
  const { year, round } = req.params;
  const cacheKey = `${year}_${round}`;
  console.log(`\n[API] Race results requested for ${year} Round ${round}`);
  
  try {
    // Check cache
    if (cache.raceResults[cacheKey] && isCacheValid(cache.raceResults[cacheKey])) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.raceResults[cacheKey].data);
    }

    // Try FastF1 API
    try {
      console.log(`  [Source] Trying FastF1 API...`);
      const data = await fetchFromFastF1(`race-results?year=${year}&round=${round}`);
      
      if (data && data.results) {
        cache.raceResults[cacheKey] = { data, timestamp: Date.now() };
        return res.json(data);
      }
    } catch (fastf1Error) {
      console.log(`  [FastF1] Failed: ${fastf1Error.message}`);
    }

    // Try MongoDB fallback
    if (isMongoConnected) {
      console.log(`  [Source] Trying MongoDB...`);
      const results = await RaceResult.find({ year: parseInt(year), round: parseInt(round) }).sort({ position: 1 });
      if (results && results.length > 0) {
        const response = {
          results,
          year: parseInt(year),
          round: parseInt(round),
          lastUpdate: new Date().toISOString(),
          source: 'mongodb'
        };
        cache.raceResults[cacheKey] = { data: response, timestamp: Date.now() };
        return res.json(response);
      }
    }

    // No data available
    res.json({ results: [], year, round, message: 'Race results not available yet', source: 'none' });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch race results', message: error.message });
  }
});

// Get F1 News
app.get('/api/data/news', async (req, res) => {
  console.log(`\n[API] News requested`);
  
  try {
    // Check cache
    if (isCacheValid(cache.news)) {
      console.log(`  [Cache] Hit`);
      return res.json(cache.news.data);
    }

    // Try News API if key is provided
    if (NEWS_API_KEY) {
      try {
        console.log(`  [Source] Trying News API...`);
        const response = await fetch(
          `${NEWS_API_URL}/everything?q=formula%201%20OR%20f1&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`
        );
        
        if (response.ok) {
          const newsData = await response.json();
          const articles = newsData.articles.map((article, index) => ({
            id: index + 1,
            title: article.title,
            description: article.description || article.content,
            category: 'Race',
            date: article.publishedAt.split('T')[0],
            image: article.urlToImage || 'https://via.placeholder.com/800x400?text=F1+News',
            source: article.source.name,
            url: article.url,
            author: article.author
          }));

          const result = { articles, count: articles.length, lastUpdate: new Date().toISOString(), source: 'newsapi' };
          updateCache('news', result);
          return res.json(result);
        }
      } catch (newsError) {
        console.log(`  [News API] Failed: ${newsError.message}`);
      }
    }

    // Return mock news
    console.log(`  [Source] Using mock data`);
    const mockNews = [
      {
        id: 1,
        title: 'F1 2025 Season Underway',
        description: 'The 2025 Formula 1 season has begun with thrilling action.',
        category: 'Race',
        date: new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/800x400?text=F1+2025',
        source: 'Mock News',
        url: '#'
      },
      {
        id: 2,
        title: 'Technical Innovations in 2025',
        description: 'Teams unveil cutting-edge aerodynamic packages.',
        category: 'Technical',
        date: new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/800x400?text=F1+Tech',
        source: 'Mock News',
        url: '#'
      }
    ];

    const result = { articles: mockNews, count: mockNews.length, lastUpdate: new Date().toISOString(), source: 'mock' };
    updateCache('news', result);
    res.json(result);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news', message: error.message });
  }
});

// Get Stats (Historical data)
app.get('/api/data/stats', async (req, res) => {
  try {
    res.json({
      legendaryDrivers,
      timestamp: new Date().toISOString(),
      source: 'backend'
    });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: 'Failed to load stats', message: error.message });
  }
});

// Get Telemetry (requires FastF1 Python service)
app.get('/api/data/telemetry/:driver', async (req, res) => {
  try {
    const { driver } = req.params;
    const { year, event, session } = req.query;
    
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year);
    if (event) queryParams.append('event', event);
    if (session) queryParams.append('session', session);
    
    const url = `${FASTF1_API_URL}/telemetry/${driver}?${queryParams.toString()}`;
    const response = await fetch(url, { timeout: 30000 });
    
    if (!response.ok) {
      throw new Error('Python service unavailable');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[API] Telemetry error:', error.message);
    res.status(503).json({ 
      error: 'Telemetry service unavailable', 
      message: 'Live telemetry requires Python FastF1 service running on port 5003',
      detail: error.message 
    });
  }
});

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  favoriteDriver: String,
  favoriteTeam: String,
  preferences: Object,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// User Profile Routes
app.get('/api/user/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
});

app.post('/api/user/profile', async (req, res) => {
  try {
    const { email, favoriteDriver, favoriteTeam, preferences } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      user.favoriteDriver = favoriteDriver || user.favoriteDriver;
      user.favoriteTeam = favoriteTeam || user.favoriteTeam;
      user.preferences = preferences || user.preferences;
      await user.save();
    } else {
      user = new User({ email, favoriteDriver, favoriteTeam, preferences });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile', message: error.message });
  }
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log('\n🏎️  F1 Web Application Backend - FastF1 + MongoDB Edition');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 FastF1 API: ${FASTF1_API_URL}`);
  console.log(`📰 News API: ${NEWS_API_KEY ? 'Configured' : 'Using mock data'}`);
  console.log(`🗄️  MongoDB: ${isMongoConnected ? 'Connected' : 'Disconnected (will use FastF1 only)'}`);
  console.log(`⚡ Cache Duration: ${CACHE_DURATION / 1000}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
  console.log('   GET  /api/data/telemetry/:driver');
  console.log('\n💡 Data Source Priority:');
  console.log('   1. Cache (5 min TTL)');
  console.log('   2. FastF1 Python API (port 5003)');
  console.log('   3. MongoDB Fallback');
  console.log('\n⚠️  Start Python FastF1 service: cd f1-data-service && python3 python_server.py');
  console.log('⚠️  Start MongoDB: mongod (or use MongoDB Atlas)\n');
});
