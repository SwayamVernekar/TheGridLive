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
const CSV_DIR = path.join(process.cwd(), '..', 'f1data', 'outputs_2025');

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

    const scheduleData = {
      season: 2025,
      races: races,
      nextRace: nextRace,
      totalRaces: races.length
    };

    await Schedule.findOneAndUpdate({ season: 2025 }, scheduleData, { upsert: true, new: true });
    console.log(`✅ Uploaded ${races.length} events`);
  } catch (error) {
    console.error('❌ Error uploading events:', error);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toISOString();
}

async function uploadDrivers() {
  try {
    console.log('\n👥 Uploading Drivers...');
    const driversPath = path.join(CSV_DIR, 'drivers.csv');
    if (!fs.existsSync(driversPath)) {
      console.log('⚠️  drivers.csv not found, skipping');
      return;
    }

    const csvDriversData = await readCSV(driversPath);

    const drivers = csvDriversData.map(driver => ({
      id: (driver.Abbreviation || '').toLowerCase(),
      driverId: (driver.Abbreviation || '').toLowerCase(),
      code: driver.Abbreviation || '',
      number: driver.DriverNumber || '',
      givenName: driver.FirstName || '',
      familyName: driver.LastName || '',
      fullName: `${driver.FirstName} ${driver.LastName}`,
      dateOfBirth: driver.DateOfBirth || '',
      nationality: driver.Nationality || driver.CountryCode || '',
      team: driver.TeamName || '',
      teamId: (driver.TeamName || '').toLowerCase().replace(/\s+/g, '_'),
      teamColor: driver.TeamColor ? `#${driver.TeamColor}` : '#cccccc',
      points: parseFloat(driver.Points) || 0,
      wins: parseInt(driver.Wins) || 0,
      position: parseInt(driver.Position) || 0,
      driverImage: `/images/drivers/${(driver.Abbreviation || '').toLowerCase()}.png`,
      helmet: `/images/helmets/${(driver.Abbreviation || '').toLowerCase()}.png`,
      countryFlag: `/images/flags/${(driver.CountryCode || '').toLowerCase()}.png`
    }));

    const driversData = {
      season: 2025,
      drivers: drivers,
      count: drivers.length
    };

    await Drivers.findOneAndUpdate({ season: 2025 }, driversData, { upsert: true, new: true });
    console.log(`✅ Uploaded ${drivers.length} drivers`);
  } catch (error) {
    console.error('❌ Error uploading drivers:', error);
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

    // Load teams.csv for team color mapping
    const teamsPath = path.join(CSV_DIR, 'teams.csv');
    let teamColors = {};
    if (fs.existsSync(teamsPath)) {
      const teamsData = await readCSV(teamsPath);
      teamColors = teamsData.reduce((acc, team) => {
        acc[team.Team] = team.TeamColor;
        return acc;
      }, {});
      console.log('✅ Loaded team colors from teams.csv');
    } else {
      console.log('⚠️  teams.csv not found, using default colors');
    }

    // Get schedule to map race names to rounds and dates
    const schedule = await Schedule.findOne({ season: 2025 });
    if (!schedule) {
      console.log('⚠️  Schedule not found, cannot map rounds. Skipping constructor standings upload.');
      return;
    }

    // Find the latest race by date that has standings
    let latestRace = null;
    let latestDate = new Date(0);

    console.log('🔍 Finding latest race with constructor standings...');
    console.log('   Available CSV files:', files.length);
    console.log('   Schedule races:', schedule.races.length);

    for (const file of files) {
      const raceMatch = file.match(/(.+)_constructor_standings\.csv/);
      if (!raceMatch) {
        console.log(`   ⚠️  Skipping ${file} - no match`);
        continue;
      }

      const raceName = raceMatch[1].replace(/_/g, ' ');
      console.log(`   📄 Processing: ${file} -> "${raceName}"`);

      const raceInfo = schedule.races.find(r => r.raceName === raceName);
      if (!raceInfo) {
        console.log(`   ❌ No race info found for "${raceName}"`);
        continue;
      }

      console.log(`   ✅ Found race info: Round ${raceInfo.round}, Date: ${raceInfo.date}`);

      const raceDate = new Date(raceInfo.date);
      console.log(`   📅 Parsed date: ${raceDate.toISOString()}`);

      if (raceDate > latestDate) {
        latestDate = raceDate;
        latestRace = { file, raceName, round: raceInfo.round, date: formatDate(raceInfo.date) };
        console.log(`   🏆 New latest race: ${raceName} (${raceDate.toISOString()})`);
      } else {
        console.log(`   ⏭️  Not newer than current latest`);
      }
    }

    if (!latestRace) {
      console.log('⚠️  No valid race found for constructor standings, skipping');
      return;
    }

    const standingsPath = path.join(standingsDir, latestRace.file);
    const csvConstructorStandingsData = await readCSV(standingsPath);

    // Team nationality mapping
    const teamNationalities = {
      'McLaren': 'British',
      'Red Bull Racing': 'Austrian',
      'Mercedes': 'German',
      'Williams': 'British',
      'Aston Martin': 'British',
      'Kick Sauber': 'Swiss',
      'Ferrari': 'Italian',
      'Alpine': 'French',
      'Racing Bulls': 'Italian',
      'Haas F1 Team': 'American'
    };

    const constructorStandings = csvConstructorStandingsData.map((entry, index) => {
      const teamName = entry.TeamName || entry.Team || '';
      const constructorId = teamName.toLowerCase().replace(/\s+/g, '_');
      const teamColor = teamColors[teamName] ? `#${teamColors[teamName]}` : '#cccccc';

      return {
        position: parseInt(entry.Position) || index + 1,
        points: parseFloat(entry.CumulativePoints) || 0,
        wins: 0, // Wins data not available in CSV, set to 0
        constructorId: constructorId,
        name: teamName,
        nationality: teamNationalities[teamName] || '',
        teamColor: teamColor,
        teamLogo: `/images/constructors/${constructorId}.png`,
        carImage: `/images/cars/${constructorId}.png`
      };
    });

    const standingsData = {
      season: 2025,
      round: latestRace.round,
      lastRace: latestRace.raceName,
      date: latestRace.date,
      standings: constructorStandings,
      lastUpdate: new Date()
    };

    await ConstructorStandings.findOneAndUpdate({ season: 2025 }, standingsData, { upsert: true, new: true });
    console.log(`✅ Uploaded latest constructor standings for ${latestRace.raceName} (Round ${latestRace.round})`);
    console.log(`   📊 ${constructorStandings.length} constructors processed`);
  } catch (error) {
    console.error('❌ Error uploading constructor standings:', error);
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

    // Get schedule to map race names to rounds and dates
    const schedule = await Schedule.findOne({ season: 2025 });
    if (!schedule) {
      console.log('⚠️  Schedule not found, cannot map rounds. Skipping driver standings upload.');
      return;
    }

    // Find the latest race by date that has standings
    let latestRace = null;
    let latestDate = new Date(0);

    console.log('🔍 Finding latest race with driver standings...');
    console.log('   Available CSV files:', files.length);
    console.log('   Schedule races:', schedule.races.length);

    for (const file of files) {
      const raceMatch = file.match(/(.+)_driver_standings\.csv/);
      if (!raceMatch) {
        console.log(`   ⚠️  Skipping ${file} - no match`);
        continue;
      }

      const raceName = raceMatch[1].replace(/_/g, ' ');
      console.log(`   📄 Processing: ${file} -> "${raceName}"`);

      const raceInfo = schedule.races.find(r => r.raceName === raceName);
      if (!raceInfo) {
        console.log(`   ❌ No race info found for "${raceName}"`);
        continue;
      }

      console.log(`   ✅ Found race info: Round ${raceInfo.round}, Date: ${raceInfo.date}`);

      const raceDate = new Date(raceInfo.date);
      console.log(`   📅 Parsed date: ${raceDate.toISOString()}`);

      if (raceDate > latestDate) {
        latestDate = raceDate;
        latestRace = { file, raceName, round: raceInfo.round, date: formatDate(raceInfo.date) };
        console.log(`   🏆 New latest race: ${raceName} (${raceDate.toISOString()})`);
      } else {
        console.log(`   ⏭️  Not newer than current latest`);
      }
    }

    if (!latestRace) {
      console.log('⚠️  No valid race found for driver standings, skipping');
      return;
    }

    const standingsPath = path.join(standingsDir, latestRace.file);
    const csvStandingsData = await readCSV(standingsPath);

    const driverStandings = csvStandingsData.map((entry, index) => {
      // Handle FullName from standings CSV (e.g., "Lando Norris")
      const fullName = entry.FullName || entry.Driver || '';
      const nameParts = fullName.split(' ');
      const givenName = nameParts[0] || '';
      const familyName = nameParts.slice(1).join(' ') || '';

      return {
        position: parseInt(entry.Position) || index + 1,
        points: parseFloat(entry.CumulativePoints || entry.Points) || 0,
        wins: parseInt(entry.Wins) || 0,
        driverId: (entry.Driver || fullName).toLowerCase().replace(/\s+/g, '_'),
        driverCode: entry.Driver || '',
        driverNumber: entry.DriverNumber || '',
        givenName: givenName,
        familyName: familyName,
        fullName: fullName,
        dateOfBirth: entry.DateOfBirth || '',
        nationality: entry.Nationality || '',
        constructorId: (entry.TeamName || entry.Team || '').toLowerCase().replace(/\s+/g, '_'),
        constructorName: entry.TeamName || entry.Team || '',
        teamColor: entry.TeamColor ? `#${entry.TeamColor}` : '#cccccc',
        driverImage: `/images/drivers/${(entry.Driver || fullName).toLowerCase().replace(/\s+/g, '_')}.png`,
        helmet: `/images/helmets/${(entry.Driver || fullName).toLowerCase().replace(/\s+/g, '_')}.png`,
        countryFlag: `/images/flags/${(entry.CountryCode || '').toLowerCase()}.png`,
        teamLogo: `/images/constructors/${(entry.TeamName || entry.Team || '').toLowerCase().replace(/\s+/g, '_')}.png`
      };
    });

    const standingsData = {
      season: 2025,
      lastRace: latestRace.raceName,
      round: latestRace.round,
      date: latestRace.date,
      standings: driverStandings
    };

    await DriverStandings.findOneAndUpdate({ season: 2025 }, standingsData, { upsert: true, new: true });
    console.log(`✅ Uploaded latest driver standings for ${latestRace.raceName} (Round ${latestRace.round})`);
  } catch (error) {
    console.error('❌ Error uploading driver standings:', error);
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
          points: calculatePoints(result.position),  // Add a helper function to calculate points
          driverId: (result.driver || '').toLowerCase().replace(/\s+/g, '_'),
          driverName: result.driver || '',
          constructorId: (result.team || '').toLowerCase().replace(/\s+/g, '_'),
          constructorName: result.team || '',
          grid: parseInt(result.grid) || 0,
          laps: result.laps,
          status: result.status || 'Finished',
          time: result.time,
          fastestLap: {
            time: result.fastestLapTime || '',
            lap: parseInt(result.fastestLapNumber) || 0
          }
        }));

        // Get round from schedule
        const schedule = await Schedule.findOne({ season: 2025 });
        const raceInfo = schedule?.races.find(r => r.raceName === raceName);
        const round = raceInfo?.round || 0;

        const raceResultsData = {
          season: 2025,
          round: round,
          raceName: raceName,
          circuitName: raceInfo?.circuitName || '',
          date: raceInfo?.date || '',
          results: results
        };

        await RaceResults.findOneAndUpdate({ season: 2025, round: round }, raceResultsData, { upsert: true, new: true });
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
          const telemetryData = {
            season: 2025,
            raceName: raceName,
            sessionType: sessionType,
            driver: driver,
            driverId: driver.toLowerCase().replace(/\s+/g, '_'),
            laps: laps
          };

          await Telemetry.findOneAndUpdate(
            { season: 2025, raceName: raceName, sessionType: sessionType, driver: driver },
            telemetryData,
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

// Add helper function to calculate points
function calculatePoints(position) {
  const pointsSystem = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  };
  return pointsSystem[position] || 0;
}
