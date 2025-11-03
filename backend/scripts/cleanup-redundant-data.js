import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DriverStandings from '../models/DriverStandings.js';
import ConstructorStandings from '../models/ConstructorStandings.js';
import Drivers from '../models/Drivers.js';
import Schedule from '../models/Schedule.js';
import RaceResults from '../models/RaceResults.js';
import Telemetry from '../models/Telemetry.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function cleanupDriverStandings() {
  try {
    console.log('\n🏎️  Cleaning up Driver Standings...');

    // Find all driver standings for 2025
    const allStandings = await DriverStandings.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allStandings.length <= 1) {
      console.log('✅ No redundant driver standings found');
      return;
    }

    // Keep only the most recent one
    const toDelete = allStandings.slice(1);
    const deleteIds = toDelete.map(doc => doc._id);

    const result = await DriverStandings.deleteMany({ _id: { $in: deleteIds } });
    console.log(`✅ Removed ${result.deletedCount} redundant driver standings`);

  } catch (error) {
    console.error('❌ Error cleaning up driver standings:', error);
  }
}

async function cleanupConstructorStandings() {
  try {
    console.log('\n🏁 Cleaning up Constructor Standings...');

    // Find all constructor standings for 2025
    const allStandings = await ConstructorStandings.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allStandings.length <= 1) {
      console.log('✅ No redundant constructor standings found');
      return;
    }

    // Keep only the most recent one
    const toDelete = allStandings.slice(1);
    const deleteIds = toDelete.map(doc => doc._id);

    const result = await ConstructorStandings.deleteMany({ _id: { $in: deleteIds } });
    console.log(`✅ Removed ${result.deletedCount} redundant constructor standings`);

  } catch (error) {
    console.error('❌ Error cleaning up constructor standings:', error);
  }
}

async function cleanupDrivers() {
  try {
    console.log('\n👥 Cleaning up Drivers...');

    // Find all drivers for 2025
    const allDrivers = await Drivers.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allDrivers.length <= 1) {
      console.log('✅ No redundant drivers found');
      return;
    }

    // Keep only the most recent one
    const toDelete = allDrivers.slice(1);
    const deleteIds = toDelete.map(doc => doc._id);

    const result = await Drivers.deleteMany({ _id: { $in: deleteIds } });
    console.log(`✅ Removed ${result.deletedCount} redundant drivers collections`);

  } catch (error) {
    console.error('❌ Error cleaning up drivers:', error);
  }
}

async function cleanupSchedule() {
  try {
    console.log('\n📅 Cleaning up Schedule...');

    // Find all schedules for 2025
    const allSchedules = await Schedule.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allSchedules.length <= 1) {
      console.log('✅ No redundant schedules found');
      return;
    }

    // Keep only the most recent one
    const toDelete = allSchedules.slice(1);
    const deleteIds = toDelete.map(doc => doc._id);

    const result = await Schedule.deleteMany({ _id: { $in: deleteIds } });
    console.log(`✅ Removed ${result.deletedCount} redundant schedules`);

  } catch (error) {
    console.error('❌ Error cleaning up schedule:', error);
  }
}

async function cleanupRaceResults() {
  try {
    console.log('\n🏁 Cleaning up Race Results...');

    // Find all race results for 2025
    const allResults = await RaceResults.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allResults.length === 0) {
      console.log('✅ No race results found');
      return;
    }

    // Group by round and keep only the most recent for each round
    const groupedByRound = {};
    allResults.forEach(result => {
      if (!groupedByRound[result.round]) {
        groupedByRound[result.round] = [];
      }
      groupedByRound[result.round].push(result);
    });

    let totalDeleted = 0;
    for (const [round, results] of Object.entries(groupedByRound)) {
      if (results.length > 1) {
        // Sort by lastUpdate descending and keep the first (most recent)
        results.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        const toDelete = results.slice(1);
        const deleteIds = toDelete.map(doc => doc._id);

        const result = await RaceResults.deleteMany({ _id: { $in: deleteIds } });
        totalDeleted += result.deletedCount;
      }
    }

    console.log(`✅ Removed ${totalDeleted} redundant race results`);

  } catch (error) {
    console.error('❌ Error cleaning up race results:', error);
  }
}

async function cleanupTelemetry() {
  try {
    console.log('\n📊 Cleaning up Telemetry Data...');

    // Find all telemetry for 2025
    const allTelemetry = await Telemetry.find({ season: 2025 }).sort({ lastUpdate: -1 });

    if (allTelemetry.length === 0) {
      console.log('✅ No telemetry data found');
      return;
    }

    // Group by raceName, sessionType, and driver, keep only the most recent for each combination
    const grouped = {};
    allTelemetry.forEach(telemetry => {
      const key = `${telemetry.raceName}_${telemetry.sessionType}_${telemetry.driver}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(telemetry);
    });

    let totalDeleted = 0;
    for (const [key, telemetries] of Object.entries(grouped)) {
      if (telemetries.length > 1) {
        // Sort by lastUpdate descending and keep the first (most recent)
        telemetries.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        const toDelete = telemetries.slice(1);
        const deleteIds = toDelete.map(doc => doc._id);

        const result = await Telemetry.deleteMany({ _id: { $in: deleteIds } });
        totalDeleted += result.deletedCount;
      }
    }

    console.log(`✅ Removed ${totalDeleted} redundant telemetry records`);

  } catch (error) {
    console.error('❌ Error cleaning up telemetry:', error);
  }
}

async function removeOldData() {
  try {
    console.log('\n🗑️  Removing old data (non-2025 seasons)...');

    const collections = [
      { model: DriverStandings, name: 'Driver Standings' },
      { model: ConstructorStandings, name: 'Constructor Standings' },
      { model: Drivers, name: 'Drivers' },
      { model: Schedule, name: 'Schedule' },
      { model: RaceResults, name: 'Race Results' },
      { model: Telemetry, name: 'Telemetry' }
    ];

    let totalDeleted = 0;

    for (const { model, name } of collections) {
      try {
        const result = await model.deleteMany({ season: { $ne: 2025 } });
        if (result.deletedCount > 0) {
          console.log(`  ✅ Removed ${result.deletedCount} old ${name.toLowerCase()} records`);
          totalDeleted += result.deletedCount;
        }
      } catch (error) {
        console.log(`  ⚠️  Error removing old ${name.toLowerCase()}: ${error.message}`);
      }
    }

    if (totalDeleted === 0) {
      console.log('✅ No old data found to remove');
    }

  } catch (error) {
    console.error('❌ Error removing old data:', error);
  }
}

async function main() {
  console.log('🧹 Starting Database Cleanup Script');
  console.log('=====================================');

  await connectDB();

  try {
    // Clean up redundant data within 2025 season
    await cleanupDriverStandings();
    await cleanupConstructorStandings();
    await cleanupDrivers();
    await cleanupSchedule();
    await cleanupRaceResults();
    await cleanupTelemetry();

    // Remove old data from other seasons
    await removeOldData();

    console.log('\n🎉 Database Cleanup Complete!');
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
