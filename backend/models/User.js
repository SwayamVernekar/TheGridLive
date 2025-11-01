import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  favoriteDriver: String,
  favoriteTeam: String,
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', UserSchema);
