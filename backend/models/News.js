import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: { type: String, enum: ['Race', 'Driver', 'Team', 'Technical', 'Regulations', 'General'], default: 'General' },
  image: { type: String },
  tags: [{ type: String }],
  author: { type: String, required: true },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
NewsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Index for efficient queries
NewsSchema.index({ published: 1, publishedAt: -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });

export default mongoose.model('News', NewsSchema);
