import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import DriverStandings from '../models/DriverStandings.js';
import ConstructorStandings from '../models/ConstructorStandings.js';
import Drivers from '../models/Drivers.js';
import Schedule from '../models/Schedule.js';
import RaceResults from '../models/RaceResults.js';
import Telemetry from '../models/Telemetry.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';
const CSV_DIR = path.join(process.cwd(), '..', 'f1-data-service', 'f1data', 'outputs_2025');

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function uploadEvents() {
  try {
    console.log('\n📅 Uploading Events/Schedule...');
    const eventsPath = path.join(CSV_DIR, 'events.csv');
    if (!fs.existsSync(eventsPath)) {
      console.log('⚠️  events.csv not found, skipping');
      return;
    }

    const events = await readCSV(eventsPath);

    const races = events.map(event => ({
      round: parseInt(event.RoundNumber) || 0,
      raceName: event.EventName || '',
      circuitId: (event.Location || '').toLowerCase().replace(/\s+/g, '_'),
      circuitName: event.Location || '',
      locality: event.Location || '',
      country: event.Country || '',
      date: event.EventDate || '',
      time: event.Session1Date ? event.Session1Date.split('T')[1] : '',
      season: 2025,
      status: new Date(event.EventDate) > new Date() ? 'upcoming' : 'completed',
      url: ''
    }));

    const now = new Date();
    const nextRace = races.find(race => new Date(race.date) > now);

    const scheduleDoc = new Schedule({
      season: 2025,
      races: races,
      nextRace: nextRace,
      totalRaces: races.length
    });

    await Schedule.findOneAndUpdate({ season: 2025 }, scheduleDoc, { upsert: true });
    console.log(`✅ Uploaded ${races.length} events`);
  } catch (error) {
    console.error('❌ Error uploading events:', error);
  }
}

async function uploadDrivers() {
  try {
    console.log('\n👥 Uploading Drivers...');
    const driversPath = path.join(CSV_DIR, 'drivers.csv');
    if (!fs.existsSync(driversPath)) {
      console.log('⚠️  drivers.csv not found, skipping');
      return;
    }

    const driversData = await readCSV(driversPath);

    const drivers = driversData.map(driver => ({
      id: (driver.Abbreviation || '').toLowerCase(),
      driverId: (driver.Abbreviation || '').toLowerCase(),
      code: driver.Abbreviation || '',
      number: driver.DriverNumber || '',
      givenName: driver.FirstName || '',
      familyName: driver.LastName || '',
      fullName: driver.FullName || `${driver.FirstName} ${driver.LastName}`,
      dateOfBirth: '',
      nationality: driver.CountryCode || '',
      team: driver.TeamName || '',
      teamId: (driver.TeamName || '').toLowerCase().replace(/\s+/g, '_'),
      teamColor: driver.TeamColor ? `#${driver.TeamColor}` : '#cccccc',
      points: parseInt(driver.Points) || 0,
      wins: 0,
      position: parseInt(driver.Position) || 0,
      driverImage: `https://source.unsplash.com/400x400/?f1,driver,portrait,racer,${driver.LastName}`
    }));

    const driversDoc = new Drivers({
      season: 2025,
      drivers: drivers,
      count: drivers.length
    });

    await Drivers.findOneAndUpdate({ season: 2025 }, driversDoc, { upsert: true });
    console.log(`✅ Uploaded ${drivers.length} drivers`);
  } catch (error) {
    console.error('❌ Error uploading drivers:', error);
  }
}

async function uploadDriverStandings() {
  try {
    console.log('\n🏎️  Uploading Driver Standings...');
    const standingsDir = path.join(CSV_DIR, 'standings');
    if (!fs.existsSync(standingsDir)) {
      console.log('⚠️  standings directory not found, skipping');
      return;
    }

    const files = fs.readdirSync(standingsDir).filter(f => f.includes('driver_standings'));
    if (files.length === 0) {
      console.log('⚠️  No driver standings files found, skipping');
      return;
    }

    // Use the latest standings file
    const latestFile = files.sort().pop();
    const standingsPath = path.join(standingsDir, latestFile);

    const standingsData = await readCSV(standingsPath);

    const driverStandings = standingsData.map((entry, index) => ({
      position: parseInt(entry.Position) || index + 1,
      points: parseFloat(entry.Points) || 0,
      wins: parseInt(entry.Wins) || 0,
      driverId: (entry.Driver || '').toLowerCase().replace(/\s+/g, '_'),
      driverCode: entry.Driver || '',
      driverNumber: entry.DriverNumber || '',
      givenName: entry.FirstName || '',
      familyName: entry.LastName || '',
      fullName: entry.FullName || `${entry.FirstName} ${entry.LastName}`,
      dateOfBirth: '',
      nationality: '',
      constructorId: (entry.Team || '').toLowerCase().replace(/\s+/g, '_'),
      constructorName: entry.Team || '',
      teamColor: entry.TeamColor ? `#${entry.TeamColor}` : '#cccccc',
      driverImage: `https://source.unsplash.com/400x400/?f1,driver,portrait,racer,${entry.LastName}`
    }));

    // Extract race info from filename
    const raceMatch = latestFile.match(/(.+)_driver_standings\.csv/);
    const lastRace = raceMatch ? raceMatch[1].replace(/_/g, ' ') : 'Unknown';

    const standingsDoc = new DriverStandings({
      season: 2025,
      lastRace: lastRace,
      round: 0, // Would need to calculate from schedule
      standings: driverStandings
    });

    await DriverStandings.findOneAndUpdate({ season: 2025 }, standingsDoc, { upsert: true });
    console.log(`✅ Uploaded driver standings for ${lastRace}`);
  } catch (error) {
    console.error('❌ Error uploading driver standings:', error);
  }
}

async function uploadConstructorStandings() {
  try {
    console.log('\n🏁 Uploading Constructor Standings...');
    const standingsDir = path.join(CSV_DIR, 'standings');
    if (!fs.existsSync(standingsDir)) {
      console.log('⚠️  standings directory not found, skipping');
      return;
    }

    const files = fs.readdirSync(standingsDir).filter(f => f.includes('constructor_standings'));
    if (files.length === 0) {
      console.log('⚠️  No constructor standings files found, skipping');
      return;
    }

    // Use the latest standings file
    const latestFile = files.sort().pop();
    const standingsPath = path.join(standingsDir, latestFile);

    const standingsData = await readCSV(standingsPath);

    const constructorStandings = standingsData.map((entry, index) => ({
      position: parseInt(entry.Position) || index + 1,
      points: parseFloat(entry.Points) || 0,
      wins: parseInt(entry.Wins) || 0,
      constructorId: (entry.Team || '').toLowerCase().replace(/\s+/g, '_'),
      name: entry.Team || '',
      nationality: '',
      teamColor: entry.TeamColor ? `#${entry.TeamColor}` : '#cccccc',
      teamLogo: `https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/1200px-F1.svg.png`,
      carImage: `https://source.unsplash.com/800x400/?f1,${entry.Team},car,2025`
    }));

    const standingsDoc = new ConstructorStandings({
      season: 2025,
      standings: constructorStandings
    });

    await ConstructorStandings.findOneAndUpdate({ season: 2025 }, standingsDoc, { upsert: true, new: true });
    console.log(`✅ Uploaded constructor standings`);
  } catch (error) {
    console.error('❌ Error uploading constructor standings:', error);
  }
}

async function uploadRaceResults() {
  try {
    console.log('\n🏁 Uploading Race Results...');
    const lapsDir = path.join(CSV_DIR, 'laps');
    if (!fs.existsSync(lapsDir)) {
      console.log('⚠️  laps directory not found, skipping');
      return;
    }

    const files = fs.readdirSync(lapsDir).filter(f => f.includes('_Race_laps.csv'));
    let resultsLoaded = 0;

    for (const file of files) {
      try {
        const filePath = path.join(lapsDir, file);
        const lapsData = await readCSV(filePath);

        if (lapsData.length === 0) continue;

        // Extract race info from filename
        const raceMatch = file.match(/(.+)_Race_laps\.csv/);
        const raceName = raceMatch ? raceMatch[1].replace(/_/g, ' ') : 'Unknown';

        // Group by driver and get final positions
        const driverResults = {};
        lapsData.forEach(lap => {
          const driver = lap.Driver;
          if (!driverResults[driver]) {
            driverResults[driver] = {
              driver: driver,
              team: lap.Team || '',
              position: parseInt(lap.Position) || 0,
              points: 0, // Would need to calculate based on position
              grid: 0,
              laps: parseInt(lap.LapNumber) || 0,
              status: 'Finished',
              time: lap.LapTime || '',
              fastestLap: null
            };
          }
          // Update max laps
          driverResults[driver].laps = Math.max(driverResults[driver].laps, parseInt(lap.LapNumber) || 0);
        });

        const results = Object.values(driverResults).map((result, index) => ({
          position: result.position || index + 1,
          points: result.points,
          driverId: (result.driver || '').toLowerCase().replace(/\s+/g, '_'),
          driverName: result.driver || '',
          constructorId: (result.team || '').toLowerCase().replace(/\s+/g, '_'),
          constructorName: result.team || '',
          grid: result.grid,
          laps: result.laps,
          status: result.status,
          time: result.time,
          fastestLap: result.fastestLap
        }));

        // Get round from schedule
        const schedule = await Schedule.findOne({ season: 2025 });
        const raceInfo = schedule?.races.find(r => r.raceName === raceName);
        const round = raceInfo?.round || 0;

        const raceResultsDoc = new RaceResults({
          season: 2025,
          round: round,
          raceName: raceName,
          circuitName: raceInfo?.circuitName || '',
          date: raceInfo?.date || '',
          results: results
        });

        await RaceResults.findOneAndUpdate({ season: 2025, round: round }, raceResultsDoc, { upsert: true, new: true });
        resultsLoaded++;
        console.log(`  ✅ Uploaded results for ${raceName}`);

      } catch (fileError) {
        console.log(`  ⚠️  Error processing ${file}: ${fileError.message}`);
      }
    }

    console.log(`✅ Uploaded race results for ${resultsLoaded} races`);
  } catch (error) {
    console.error('❌ Error uploading race results:', error);
  }
}

async function uploadTelemetry() {
  try {
    console.log('\n📊 Uploading Telemetry Data...');
    const lapsDir = path.join(CSV_DIR, 'laps');
    if (!fs.existsSync(lapsDir)) {
      console.log('⚠️  laps directory not found, skipping');
      return;
    }

    const files = fs.readdirSync(lapsDir);
    let telemetryLoaded = 0;

    for (const file of files) {
      try {
        const filePath = path.join(lapsDir, file);
        const lapsData = await readCSV(filePath);

        if (lapsData.length === 0) continue;

        // Extract race info from filename
        const raceMatch = file.match(/(.+)_(.+)_laps\.csv/);
        if (!raceMatch) continue;

        const raceName = raceMatch[1].replace(/_/g, ' ');
        const sessionType = raceMatch[2];

        // Group telemetry by driver
        const driverTelemetry = {};

        lapsData.forEach(lap => {
          const driver = lap.Driver;
          if (!driverTelemetry[driver]) {
            driverTelemetry[driver] = [];
          }

          driverTelemetry[driver].push({
            lapNumber: parseInt(lap.LapNumber) || 0,
            lapTime: lap.LapTime || '',
            sector1Time: lap.Sector1Time || '',
            sector2Time: lap.Sector2Time || '',
            sector3Time: lap.Sector3Time || '',
            speedI1: parseFloat(lap.SpeedI1) || 0,
            speedI2: parseFloat(lap.SpeedI2) || 0,
            speedFL: parseFloat(lap.SpeedFL) || 0,
            speedST: parseFloat(lap.SpeedST) || 0,
            compound: lap.Compound || '',
            tyreLife: parseInt(lap.TyreLife) || 0,
            freshTyre: lap.FreshTyre === 'True',
            position: parseInt(lap.Position) || 0,
            time: lap.Time || ''
          });
        });

        // Save telemetry for each driver
        for (const [driver, laps] of Object.entries(driverTelemetry)) {
          const telemetryDoc = new Telemetry({
            season: 2025,
            raceName: raceName,
            sessionType: sessionType,
            driver: driver,
            driverId: driver.toLowerCase().replace(/\s+/g, '_'),
            laps: laps
          });

          await Telemetry.findOneAndUpdate(
            { season: 2025, raceName: raceName, sessionType: sessionType, driver: driver },
            telemetryDoc,
            { upsert: true, new: true }
          );
        }

        telemetryLoaded++;
        console.log(`  ✅ Uploaded telemetry for ${raceName} ${sessionType}`);

      } catch (fileError) {
        console.log(`  ⚠️  Error processing ${file}: ${fileError.message}`);
      }
    }

    console.log(`✅ Uploaded telemetry for ${telemetryLoaded} sessions`);
  } catch (error) {
    console.error('❌ Error uploading telemetry:', error);
  }
}

async function main() {
  console.log('🚀 Starting CSV to MongoDB Upload Script');
  console.log('==========================================');
  console.log(`CSV Directory: ${CSV_DIR}`);

  await connectDB();

  try {
    // Upload all data types
    await uploadEvents();
    await uploadDrivers();
    await uploadDriverStandings();
    await uploadConstructorStandings();
    await uploadRaceResults();
    await uploadTelemetry();

    console.log('\n🎉 CSV Upload to MongoDB Complete!');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Database connection closed');
  }
}

// Run the script
main().catch(console.error);
