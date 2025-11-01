import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  races: [{
    round: { type: Number, required: true },
    raceName: { type: String, required: true },
    circuitId: { type: String, required: true },
    circuitName: { type: String, required: true },
    locality: { type: String },
    country: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    season: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
    url: { type: String }
  }],
  nextRace: {
    round: { type: Number },
    raceName: { type: String },
    circuitId: { type: String },
    circuitName: { type: String },
    locality: { type: String },
    country: { type: String },
    date: { type: String },
    time: { type: String },
    season: { type: Number },
    status: { type: String },
    url: { type: String }
  },
  totalRaces: { type: Number, required: true },
  lastUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
ScheduleSchema.index({ season: 1 });

export default mongoose.model('Schedule', ScheduleSchema);
