import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DriverStandings from '../models/DriverStandings.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1app';

async function checkDriverData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the latest driver standings for 2025
    const latestStandings = await DriverStandings.findOne({ season: 2025 })
      .sort({ round: -1 })
      .limit(1);

    if (!latestStandings) {
      console.log('❌ No driver standings found for 2025');
      return;
    }

    console.log('\n📊 Latest Driver Standings Info:');
    console.log('Season:', latestStandings.season);
    console.log('Round:', latestStandings.round);
    console.log('Last Race:', latestStandings.lastRace);
    console.log('Total Drivers:', latestStandings.standings.length);

    console.log('\n🏎️  Top 3 Drivers:');
    latestStandings.standings.slice(0, 3).forEach((driver, index) => {
      console.log(`\n${index + 1}. ${driver.fullName} (${driver.driverCode})`);
      console.log(`   Position: P${driver.position}`);
      console.log(`   Points: ${driver.points}`);
      console.log(`   Wins: ${driver.wins}`);
      console.log(`   Podiums: ${driver.podiums}`);
      console.log(`   Team: ${driver.constructorName}`);
      console.log(`   Driver ID: ${driver.driverId}`);
      console.log(`   Driver Number: ${driver.driverNumber}`);
    });

    // Check if wins and podiums fields exist
    console.log('\n🔍 Field Analysis:');
    const firstDriver = latestStandings.standings[0];
    console.log('Available fields:', Object.keys(firstDriver));
    console.log('Has wins field:', 'wins' in firstDriver);
    console.log('Has podiums field:', 'podiums' in firstDriver);
    console.log('Wins value:', firstDriver.wins);
    console.log('Podiums value:', firstDriver.podiums);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDriverData();
