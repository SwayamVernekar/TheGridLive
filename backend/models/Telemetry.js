import mongoose from 'mongoose';

const TelemetrySchema = new mongoose.Schema({
  driver: { type: String, required: true },
  session: { type: String, required: true },
  year: { type: Number, required: true },
  event: { type: String, required: true },
  data: {
    speed: [Number],
    throttle: [Number],
    brake: [Number],
    gear: [Number],
    rpm: [Number],
    distance: [Number],
    time: [Number]
  },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
TelemetrySchema.index({ driver: 1, session: 1, year: 1, event: 1 });

export default mongoose.model('Telemetry', TelemetrySchema);
