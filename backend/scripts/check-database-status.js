import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Telemetry from '../models/Telemetry.js';
import DriverStandings from '../models/DriverStandings.js';
import ConstructorStandings from '../models/ConstructorStandings.js';
import Drivers from '../models/Drivers.js';
import Schedule from '../models/Schedule.js';
import RaceResults from '../models/RaceResults.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1_telemetry';

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const telemetryCount = await Telemetry.countDocuments({ season: 2025 });
    const driverStandingsCount = await DriverStandings.countDocuments({ season: 2025 });
    const constructorStandingsCount = await ConstructorStandings.countDocuments({ season: 2025 });
    const driversCount = await Drivers.countDocuments({ season: 2025 });
    const scheduleCount = await Schedule.countDocuments({ season: 2025 });
    const raceResultsCount = await RaceResults.countDocuments({ season: 2025 });

    console.log('\n📊 Database Status for 2025:');
    console.log('Telemetry records:', telemetryCount);
    console.log('Driver standings:', driverStandingsCount);
    console.log('Constructor standings:', constructorStandingsCount);
    console.log('Drivers collections:', driversCount);
    console.log('Schedules:', scheduleCount);
    console.log('Race results:', raceResultsCount);

    // Check for old data
    const oldTelemetryCount = await Telemetry.countDocuments({ season: { $ne: 2025 } });
    const oldDriverStandingsCount = await DriverStandings.countDocuments({ season: { $ne: 2025 } });
    const oldConstructorStandingsCount = await ConstructorStandings.countDocuments({ season: { $ne: 2025 } });
    const oldDriversCount = await Drivers.countDocuments({ season: { $ne: 2025 } });
    const oldScheduleCount = await Schedule.countDocuments({ season: { $ne: 2025 } });
    const oldRaceResultsCount = await RaceResults.countDocuments({ season: { $ne: 2025 } });

    console.log('\n🗑️  Old data (non-2025):');
    console.log('Old telemetry records:', oldTelemetryCount);
    console.log('Old driver standings:', oldDriverStandingsCount);
    console.log('Old constructor standings:', oldConstructorStandingsCount);
    console.log('Old drivers collections:', oldDriversCount);
    console.log('Old schedules:', oldScheduleCount);
    console.log('Old race results:', oldRaceResultsCount);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
