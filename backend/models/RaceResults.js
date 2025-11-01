import mongoose from 'mongoose';

const RaceResultsSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  round: { type: Number, required: true },
  raceName: { type: String, required: true },
  circuitName: { type: String, required: true },
  date: { type: String, required: true },
  results: [{
    position: { type: Number, required: true },
    points: { type: Number, required: true },
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    constructorId: { type: String, required: true },
    constructorName: { type: String, required: true },
    grid: { type: Number, required: true },
    laps: { type: Number, required: true },
    status: { type: String, required: true },
    time: { type: String },
    fastestLap: {
      rank: { type: Number },
      lap: { type: Number },
      time: { type: String },
      avgSpeed: { type: String }
    }
  }],
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
RaceResultsSchema.index({ season: 1, round: 1 });

export default mongoose.model('RaceResults', RaceResultsSchema);
