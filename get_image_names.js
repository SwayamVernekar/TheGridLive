const mongoose = require('mongoose');
const Drivers = require('./backend/models/Drivers.js').default;
const ConstructorStandings = require('./backend/models/ConstructorStandings.js').default;

async function getData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/f1-data');

    const drivers = await Drivers.findOne({ season: 2025 });
    const constructors = await ConstructorStandings.findOne({ season: 2025 });

    if (drivers) {
      console.log('=== DRIVERS ===');
      drivers.drivers.forEach(d => {
        console.log(`driver-${d.driverId}.txt`);
      });
    }

    if (constructors) {
      console.log('=== TEAMS ===');
      constructors.standings.forEach(c => {
        console.log(`team-${c.constructorId}.txt`);
        console.log(`car-${c.constructorId}.txt`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getData();
