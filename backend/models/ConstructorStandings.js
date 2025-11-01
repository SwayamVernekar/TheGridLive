import mongoose from 'mongoose';

const ConstructorStandingsSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  standings: [{
    position: { type: Number, required: true },
    points: { type: Number, required: true },
    wins: { type: Number, default: 0 },
    constructorId: { type: String, required: true },
    name: { type: String, required: true },
    nationality: { type: String },
    teamColor: { type: String, required: true },
    teamLogo: { type: String },
    carImage: { type: String }
  }],
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
ConstructorStandingsSchema.index({ season: 1 });

export default mongoose.model('ConstructorStandings', ConstructorStandingsSchema);
