const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true, maxlength: 300 },
  content: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['Medical', 'Legal', 'Healthcare', 'Law Updates', 'General', 'Research'],
    default: 'General'
  },
  author: { type: String, required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  seoFocusKeyword: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoMetaDescription: { type: String, default: '', maxlength: 160 },
}, { timestamps: true });

// Indexes for performance
NewsSchema.index({ date: -1, _id: 1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ featured: 1 });
NewsSchema.index({ tags: 1 });

module.exports = mongoose.model('News', NewsSchema);
