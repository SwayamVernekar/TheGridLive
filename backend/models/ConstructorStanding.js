import mongoose from 'mongoose';

const ConstructorStandingSchema = new mongoose.Schema({
  position: Number,
  points: Number,
  wins: Number,
  constructorId: String,
  name: String,
  nationality: String,
  teamColor: String,
  logo: String,
  year: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'constructor_standings' });

export default mongoose.model('ConstructorStanding', ConstructorStandingSchema);
