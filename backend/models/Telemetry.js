import mongoose from 'mongoose';
import mongoose from 'mongoose';

const TelemetrySchema = new mongoose.Schema({
  season: { type: Number, required: true },
  raceName: { type: String, required: true },
  sessionType: { type: String, required: true },
  driver: { type: String, required: true },
  driverId: { type: String, required: true },
  laps: [{
    lapNumber: { type: Number, required: true },
    lapTime: { type: String },
    sector1Time: { type: String },
    sector2Time: { type: String },
    sector3Time: { type: String },
    speedI1: { type: Number },
    speedI2: { type: Number },
    speedFL: { type: Number },
    speedST: { type: Number },
    compound: { type: String },
    tyreLife: { type: Number },
    freshTyre: { type: Boolean },
    position: { type: Number },
    time: { type: String }
  }],
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
TelemetrySchema.index({ season: 1, raceName: 1, sessionType: 1, driver: 1 });

export default mongoose.model('Telemetry', TelemetrySchema);
