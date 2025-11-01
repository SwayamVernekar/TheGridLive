import mongoose from 'mongoose';

const DriverStandingsSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  lastRace: { type: String, required: true },
  round: { type: Number, required: true },
  standings: [{
    position: { type: Number, required: true },
    points: { type: Number, required: true },
    wins: { type: Number, default: 0 },
    driverId: { type: String, required: true },
    driverCode: { type: String, required: true },
    driverNumber: { type: String, required: true },
    givenName: { type: String, required: true },
    familyName: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String },
    nationality: { type: String },
    constructorId: { type: String, required: true },
    constructorName: { type: String, required: true },
    teamColor: { type: String, required: true },
    driverImage: { type: String }
  }],
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
DriverStandingsSchema.index({ season: 1, round: -1 });

export default mongoose.model('DriverStandings', DriverStandingsSchema);
