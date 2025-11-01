import mongoose from 'mongoose';

const DriversSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  drivers: [{
    id: { type: String, required: true },
    driverId: { type: String, required: true },
    code: { type: String, required: true },
    number: { type: String },
    givenName: { type: String, required: true },
    familyName: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String },
    nationality: { type: String },
    team: { type: String, required: true },
    teamId: { type: String, required: true },
    teamColor: { type: String, required: true },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    position: { type: Number },
    driverImage: { type: String }
  }],
  count: { type: Number, required: true },
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
DriversSchema.index({ season: 1 });

export default mongoose.model('Drivers', DriversSchema);
