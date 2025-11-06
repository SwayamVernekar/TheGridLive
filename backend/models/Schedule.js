import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  round: Number,
  raceName: String,
  circuitId: String,
  circuitName: String,
  locality: String,
  country: String,
  date: String,
  time: String,
  url: String,
  year: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'schedule' });

export default mongoose.model('Schedule', ScheduleSchema);
