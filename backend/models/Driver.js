import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  driverCode: String,
  driverNumber: String,
  givenName: String,
  familyName: String,
  fullName: String,
  dateOfBirth: String,
  nationality: String,
  permanentNumber: String,
  url: String,
  imageUrl: String,
  year: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'drivers' });

export default mongoose.model('Driver', DriverSchema);
