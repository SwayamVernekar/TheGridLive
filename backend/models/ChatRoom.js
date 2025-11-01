import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  participants: [{ type: String }], // Array of user IDs
  messages: [MessageSchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

// Index for efficient message queries
ChatRoomSchema.index({ 'messages.timestamp': -1 });

export default mongoose.model('ChatRoom', ChatRoomSchema);
