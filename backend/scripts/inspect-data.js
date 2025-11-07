import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DriverStandings from '../models/DriverStandings.js';
import Drivers from '../models/Drivers.js';

dotenv.config();

async function inspectData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Check driver standings
    console.log('📊 DRIVER STANDINGS:');
    const driverStandings = await DriverStandings.findOne().lean();
    if (driverStandings) {
      console.log('Found document with keys:', Object.keys(driverStandings));
      if (driverStandings.standings && Array.isArray(driverStandings.standings)) {
        console.log(`   - Contains ${driverStandings.standings.length} driver standings`);
        console.log('   - Top 3 drivers:');
        driverStandings.standings.slice(0, 3).forEach(d => {
          console.log(`      ${d.position}. ${d.driverName} (${d.team}) - ${d.points} pts`);
        });
      }
    }

    console.log('\n📊 DRIVERS:');
    const drivers = await Drivers.findOne().lean();
    if (drivers) {
      console.log('Found document with keys:', Object.keys(drivers));
      if (drivers.drivers && Array.isArray(drivers.drivers)) {
        console.log(`   - Contains ${drivers.drivers.length} drivers`);
        console.log('   - Sample drivers:');
        drivers.drivers.slice(0, 3).forEach(d => {
          console.log(`      ${d.name} - ${d.team} (${d.number})`);
        });
      }
    }

    console.log('\n📊 TELEMETRY:');
    const telemetryCount = await mongoose.connection.db.collection('telemetries').countDocuments();
    const sampleTelemetry = await mongoose.connection.db.collection('telemetries').findOne();
    console.log(`Total telemetry records: ${telemetryCount}`);
    if (sampleTelemetry) {
      console.log('Sample record:', {
        driver: sampleTelemetry.driver,
        round: sampleTelemetry.round,
        session: sampleTelemetry.session,
        lapCount: sampleTelemetry.laps?.length || 0
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

inspectData();
