import mongoose from 'mongoose';

const RaceResultSchema = new mongoose.Schema({
  position: Number,
  points: Number,
  driverId: String,
  driverCode: String,
  driverName: String,
  constructorId: String,
  constructorName: String,
  grid: Number,
  laps: Number,
  status: String,
  time: String,
  fastestLap: Object,
  year: { type: Number, required: true },
  round: { type: Number, required: true },
  raceName: String,
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'race_results' });

export default mongoose.model('RaceResult', RaceResultSchema);
