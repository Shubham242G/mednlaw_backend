const mongoose = require('mongoose');

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// PageFAQ Schema
const pageFAQSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true, index: true },
  pageType: { 
    type: String, 
    enum: ['static', 'blog', 'category'],
    default: 'static'
  },
  faqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FAQ' }],
  isActive: { type: Boolean, default: true }
});

// Create models
const FAQ = mongoose.model('FAQ', faqSchema);
const PageFAQ = mongoose.model('PageFAQ', pageFAQSchema);

// Export models
module.exports = { FAQ, PageFAQ };