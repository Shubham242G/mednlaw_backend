const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true, maxlength: 1000 },
  imageUrl: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
}, { timestamps: true });

TestimonialSchema.index({ date: -1 });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
