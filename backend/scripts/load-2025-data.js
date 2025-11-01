import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import DriverStandings from '../models/DriverStandings.js';
import ConstructorStandings from '../models/ConstructorStandings.js';
import Drivers from '../models/Drivers.js';
import Schedule from '../models/Schedule.js';
import RaceResults from '../models/RaceResults.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';
const FASTF1_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5003/api/v1';

// Data freshness threshold (24 hours in milliseconds)
const DATA_FRESHNESS_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to check if data is fresh
function isDataFresh(lastUpdate) {
  if (!lastUpdate) return false;
  const now = new Date();
  const lastUpdateTime = new Date(lastUpdate);
  return (now - lastUpdateTime) < DATA_FRESHNESS_THRESHOLD;
}

async function fetchFromFastF1(endpoint) {
  const url = `${FASTF1_API_URL}/${endpoint}`;
  console.log(`📡 Fetching from FastF1: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FastF1 API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Data received from FastF1');
    return data;
  } catch (error) {
    console.error('❌ FastF1 fetch error:', error);
    throw error;
  }
}

async function loadDriverStandings() {
  try {
    console.log('\n🏎️  Loading 2025 Driver Standings...');

    // Check if data is already fresh in database
    const existingData = await DriverStandings.findOne({ season: 2025 }).sort({ lastUpdate: -1 });
    if (existingData && isDataFresh(existingData.lastUpdate)) {
      console.log('✅ Driver standings data is fresh (less than 24 hours old), skipping fetch');
      return;
    }

    const data = await fetchFromFastF1('standings?year=2025');

    if (!data.standings || data.standings.length === 0) {
      console.log('⚠️  No driver standings available for 2025');
      return;
    }

    const driverStandings = data.standings.map((entry, index) => ({
      position: entry.position,
      points: entry.points,
      wins: 0, // FastF1 doesn't provide this in standings
      driverId: entry.driver ? entry.driver.toLowerCase().replace(/\s+/g, '_') : '',
      driverCode: entry.driver,
      driverNumber: entry.driverNumber || '',
      givenName: entry.firstName || '',
      familyName: entry.lastName || '',
      fullName: entry.fullName || `${entry.firstName} ${entry.lastName}`,
      dateOfBirth: '',
      nationality: '',
      constructorId: entry.team ? entry.team.toLowerCase().replace(/\s+/g, '_') : '',
      constructorName: entry.team || '',
      teamColor: entry.teamColor ? `#${entry.teamColor}` : '#cccccc',
      driverImage: `https://source.unsplash.com/400x400/?f1,driver,portrait,racer,${entry.lastName}`
    }));

    const standingsDoc = new DriverStandings({
      season: 2025,
      lastRace: data.lastRace || 'Unknown',
      round: data.round || 0,
      standings: driverStandings
    });

    await standingsDoc.save();
    console.log(`✅ Saved ${driverStandings.length} driver standings for 2025`);

  } catch (error) {
    console.error('❌ Error loading driver standings:', error);
  }
}

async function loadConstructorStandings() {
  try {
    console.log('\n🏁 Loading 2025 Constructor Standings...');

    // Check if data is already fresh in database
    const existingData = await ConstructorStandings.findOne({ season: 2025 }).sort({ lastUpdate: -1 });
    if (existingData && isDataFresh(existingData.lastUpdate)) {
      console.log('✅ Constructor standings data is fresh (less than 24 hours old), skipping fetch');
      return;
    }

    const data = await fetchFromFastF1('constructor-standings?year=2025');

    if (!data.standings || data.standings.length === 0) {
      console.log('⚠️  No constructor standings available for 2025');
      return;
    }

    const constructorStandings = data.standings.map((entry, index) => ({
      position: entry.position,
      points: entry.points,
      wins: 0,
      constructorId: entry.team ? entry.team.toLowerCase().replace(/\s+/g, '_') : '',
      name: entry.team || '',
      nationality: '',
      teamColor: entry.teamColor ? `#${entry.teamColor}` : '#cccccc',
      teamLogo: `https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/1200px-F1.svg.png`,
      carImage: `https://source.unsplash.com/800x400/?f1,${entry.team},car,2025`
    }));

    const standingsDoc = new ConstructorStandings({
      season: 2025,
      standings: constructorStandings
    });

    await standingsDoc.save();
    console.log(`✅ Saved ${constructorStandings.length} constructor standings for 2025`);

  } catch (error) {
    console.error('❌ Error loading constructor standings:', error);
  }
}

async function loadDrivers() {
  try {
    console.log('\n👥 Loading 2025 Drivers...');

    // Check if data is already fresh in database
    const existingData = await Drivers.findOne({ season: 2025 }).sort({ lastUpdate: -1 });
    if (existingData && isDataFresh(existingData.lastUpdate)) {
      console.log('✅ Drivers data is fresh (less than 24 hours old), skipping fetch');
      return;
    }

    const data = await fetchFromFastF1('drivers?year=2025');

    if (!data.drivers || data.drivers.length === 0) {
      console.log('⚠️  No drivers available for 2025');
      return;
    }

    const drivers = data.drivers.map(driver => ({
      id: driver.abbreviation ? driver.abbreviation.toLowerCase() : '',
      driverId: driver.abbreviation ? driver.abbreviation.toLowerCase() : '',
      code: driver.abbreviation || '',
      number: driver.driverNumber || '',
      givenName: driver.firstName || '',
      familyName: driver.lastName || '',
      fullName: driver.fullName || `${driver.firstName} ${driver.lastName}`,
      dateOfBirth: '',
      nationality: driver.countryCode || '',
      team: driver.team || '',
      teamId: driver.team ? driver.team.toLowerCase().replace(/\s+/g, '_') : '',
      teamColor: driver.teamColor ? `#${driver.teamColor}` : '#cccccc',
      points: 0,
      wins: 0,
      position: 0,
      driverImage: `https://source.unsplash.com/400x400/?f1,driver,portrait,racer,${driver.lastName}`
    }));

    const driversDoc = new Drivers({
      season: 2025,
      drivers: drivers,
      count: drivers.length
    });

    await driversDoc.save();
    console.log(`✅ Saved ${drivers.length} drivers for 2025`);

  } catch (error) {
    console.error('❌ Error loading drivers:', error);
  }
}

async function loadSchedule() {
  try {
    console.log('\n📅 Loading 2025 Race Schedule...');

    // Check if data is already fresh in database
    const existingData = await Schedule.findOne({ season: 2025 }).sort({ lastUpdate: -1 });
    if (existingData && isDataFresh(existingData.lastUpdate)) {
      console.log('✅ Schedule data is fresh (less than 24 hours old), skipping fetch');
      return;
    }

    const data = await fetchFromFastF1('schedule?year=2025');

    if (!data.events || data.events.length === 0) {
      console.log('⚠️  No schedule available for 2025');
      return;
    }

    const races = data.events.map(event => ({
      round: event.round,
      raceName: event.eventName || '',
      circuitId: event.location ? event.location.toLowerCase().replace(/\s+/g, '_') : '',
      circuitName: event.location || '',
      locality: event.location || '',
      country: event.country || '',
      date: event.eventDate || '',
      time: event.session1 ? event.session1.split('T')[1] : '',
      season: 2025,
      status: new Date(event.eventDate) > new Date() ? 'upcoming' : 'completed',
      url: ''
    }));

    // Find next race
    const now = new Date();
    const nextRace = races.find(race => new Date(race.date) > now);

    const scheduleDoc = new Schedule({
      season: 2025,
      races: races,
      nextRace: nextRace,
      totalRaces: races.length
    });

    await scheduleDoc.save();
    console.log(`✅ Saved ${races.length} races in 2025 schedule`);

  } catch (error) {
    console.error('❌ Error loading schedule:', error);
  }
}

async function loadRaceResults() {
  try {
    console.log('\n🏁 Loading 2025 Race Results...');

    // Get schedule first to know which races to load
    const scheduleData = await fetchFromFastF1('schedule?year=2025');

    if (!scheduleData.events || scheduleData.events.length === 0) {
      console.log('⚠️  No schedule available for loading race results');
      return;
    }

    const now = new Date();
    let resultsLoaded = 0;

    for (const event of scheduleData.events) {
      // Only load results for completed races
      if (new Date(event.eventDate) >= now) {
        continue;
      }

      try {
        console.log(`  Loading results for ${event.eventName} (Round ${event.round})`);

        // Check if race results already exist and are fresh
        const existingResults = await RaceResults.findOne({
          season: 2025,
          round: event.round
        }).sort({ lastUpdate: -1 });

        if (existingResults && isDataFresh(existingResults.lastUpdate)) {
          console.log(`  ✅ Results for ${event.eventName} are fresh, skipping`);
          continue;
        }

        const data = await fetchFromFastF1(`race-results/2025/${event.round}`);

        if (!data.results || data.results.length === 0) {
          console.log(`  ⚠️  No results for ${event.eventName}`);
          continue;
        }

        const results = data.results.map(result => ({
          position: result.position,
          points: result.points,
          driverId: result.driver ? result.driver.toLowerCase().replace(/\s+/g, '_') : '',
          driverName: result.fullName || '',
          constructorId: result.team ? result.team.toLowerCase().replace(/\s+/g, '_') : '',
          constructorName: result.team || '',
          grid: result.gridPosition || 0,
          laps: 0, // Not provided by FastF1
          status: result.status || 'Finished',
          time: result.time || '',
          fastestLap: result.fastestLap ? {
            rank: result.fastestLap.rank || 0,
            lap: result.fastestLap.lap || 0,
            time: result.fastestLap.fastestLapTime || '',
            avgSpeed: ''
          } : null
        }));

        const raceResultsDoc = new RaceResults({
          season: 2025,
          round: event.round,
          raceName: event.eventName || '',
          circuitName: event.location || '',
          date: event.eventDate || '',
          results: results
        });

        await raceResultsDoc.save();
        resultsLoaded++;
        console.log(`  ✅ Saved results for ${event.eventName}`);

      } catch (raceError) {
        console.log(`  ⚠️  Could not load results for ${event.eventName}: ${raceError.message}`);
      }
    }

    console.log(`✅ Loaded race results for ${resultsLoaded} completed races in 2025`);

  } catch (error) {
    console.error('❌ Error loading race results:', error);
  }
}

async function main() {
  console.log('🚀 Starting 2025 F1 Data Load Script');
  console.log('=====================================');

  await connectDB();

  try {
    // Load new data (only if not fresh)
    await loadDriverStandings();
    await loadConstructorStandings();
    await loadDrivers();
    await loadSchedule();
    await loadRaceResults();

    console.log('\n🎉 2025 F1 Data Load Complete!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Database connection closed');
  }
}

// Run the script
main().catch(console.error);
