const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // ADD THIS
  summary: { type: String, required: true, maxlength: 500 },
  content: { type: String, default: '' },
  images: [{ type: String }],
  seoFocusKeyword: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoMetaDescription: { type: String, default: '', maxlength: 160 },
}, { timestamps: true });

// Function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Auto-generate slug before saving (for new blogs)
BlogSchema.pre('save', async function(next) {
  if (this.isModified('title') && !this.slug) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure uniqueness
    while (await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

// Indexes for performance
BlogSchema.index({ date: -1, _id: 1 });
BlogSchema.index({ seoFocusKeyword: 1 });
BlogSchema.index({ slug: 1 }); // ADD THIS

module.exports = mongoose.model('Blog', BlogSchema);