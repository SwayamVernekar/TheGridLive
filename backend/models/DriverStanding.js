import mongoose from 'mongoose';

const DriverStandingSchema = new mongoose.Schema({
  position: Number,
  points: Number,
  wins: Number,
  driverId: String,
  driverCode: String,
  driverNumber: String,
  givenName: String,
  familyName: String,
  fullName: String,
  dateOfBirth: String,
  nationality: String,
  constructorId: String,
  constructorName: String,
  teamColor: String,
  driverImage: String,
  year: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'driver_standings' });

export default mongoose.model('DriverStanding', DriverStandingSchema);
