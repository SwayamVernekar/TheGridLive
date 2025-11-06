import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  constructorId: { type: String, required: true },
  name: String,
  nationality: String,
  teamColor: String,
  logo: String,
  url: String,
  year: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'teams' });

export default mongoose.model('Team', TeamSchema);
