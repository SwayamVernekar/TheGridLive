import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import DriverStandings from '../models/DriverStandings.js';
import Schedule from '../models/Schedule.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1app';
const CSV_DIR = path.join(process.cwd(), '..', 'f1data', 'outputs_2025');

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

async function calculateWinsAndPodiums() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get schedule to know which races are completed
    const schedule = await Schedule.findOne({ season: 2025 });
    if (!schedule) {
      console.log('❌ Schedule not found');
      return;
    }

    const now = new Date();
    const completedRaces = schedule.races.filter(r => new Date(r.date) < now);
    console.log(`📊 Total races: ${schedule.races.length}`);
    console.log(`✅ Completed races: ${completedRaces.length}`);
    console.log(`📅 Most recent: ${completedRaces[completedRaces.length - 1]?.raceName}\n`);

    // Read all lap files to calculate wins and podiums
    const lapsDir = path.join(CSV_DIR, 'laps');
    if (!fs.existsSync(lapsDir)) {
      console.log('❌ Laps directory not found');
      return;
    }

    const driverStats = {}; // { driverName: { wins: 0, podiums: 0 } }

    console.log('🔍 Processing lap files to calculate wins and podiums...\n');

    for (const race of completedRaces) {
      const lapFile = path.join(lapsDir, `${race.raceName}_laps.csv`);
      
      if (!fs.existsSync(lapFile)) {
        console.log(`⚠️  No lap data for ${race.raceName}`);
        continue;
      }

      const laps = await readCSV(lapFile);
      
      if (laps.length === 0) {
        console.log(`⚠️  Empty lap data for ${race.raceName}`);
        continue;
      }

      // Get the last lap for each driver to determine final positions
      const driverLastLaps = {};
      laps.forEach(lap => {
        const driver = lap.Driver;
        const lapNumber = parseInt(lap.LapNumber) || 0;
        
        if (!driverLastLaps[driver] || lapNumber > driverLastLaps[driver].lapNumber) {
          driverLastLaps[driver] = {
            lapNumber: lapNumber,
            position: parseInt(lap.Position) || 999
          };
        }
      });

      // Sort by final position to get race results
      const raceResults = Object.entries(driverLastLaps)
        .sort((a, b) => a[1].position - b[1].position)
        .slice(0, 20); // Top 20 finishers

      // Count wins (P1) and podiums (P1-P3)
      raceResults.forEach(([driver, data]) => {
        if (!driverStats[driver]) {
          driverStats[driver] = { wins: 0, podiums: 0 };
        }

        if (data.position === 1) {
          driverStats[driver].wins++;
          driverStats[driver].podiums++;
        } else if (data.position === 2 || data.position === 3) {
          driverStats[driver].podiums++;
        }
      });

      console.log(`✅ ${race.raceName}: P1 = ${raceResults[0]?.[0]}, P2 = ${raceResults[1]?.[0]}, P3 = ${raceResults[2]?.[0]}`);
    }

    console.log('\n📊 Driver Statistics Summary:\n');
    const sortedStats = Object.entries(driverStats)
      .sort((a, b) => b[1].wins - a[1].wins || b[1].podiums - a[1].podiums);
    
    sortedStats.forEach(([driver, stats]) => {
      console.log(`${driver.padEnd(20)} | Wins: ${stats.wins.toString().padStart(2)} | Podiums: ${stats.podiums.toString().padStart(2)}`);
    });

    // Now update the DriverStandings with wins and podiums
    console.log('\n🔄 Updating DriverStandings in database...\n');

    const standings = await DriverStandings.findOne({ season: 2025 }).sort({ round: -1 });
    
    if (!standings) {
      console.log('❌ No standings found for 2025');
      return;
    }

    console.log(`📍 Current standings: Round ${standings.round}, Last Race: ${standings.lastRace}`);
    
    // Update each driver's wins and podiums
    let updatedCount = 0;
    standings.standings.forEach(driver => {
      const stats = driverStats[driver.driverCode] || driverStats[driver.fullName];
      
      if (stats) {
        driver.wins = stats.wins;
        driver.podiums = stats.podiums;
        updatedCount++;
        console.log(`  ✅ ${driver.fullName}: ${stats.wins} wins, ${stats.podiums} podiums`);
      } else {
        driver.wins = 0;
        driver.podiums = 0;
        console.log(`  ⚠️  ${driver.fullName}: No race data found (setting to 0)`);
      }
    });

    // Save the updated standings
    await standings.save();
    console.log(`\n✅ Updated ${updatedCount} drivers in standings`);
    console.log('✅ DriverStandings saved to database');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

calculateWinsAndPodiums();
