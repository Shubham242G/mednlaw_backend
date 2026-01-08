const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  title: { type: String, required: true },
  summary: { type: String, required: true, maxlength: 500 },
  content: { type: String, default: '' },
  images: [{ type: String }],
  seoFocusKeyword: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoMetaDescription: { type: String, default: '', maxlength: 160 },
}, { timestamps: true });

// Indexes for performance
BlogSchema.index({ date: -1, _id: 1 });
BlogSchema.index({ seoFocusKeyword: 1 });

module.exports = mongoose.model('Blog', BlogSchema);
