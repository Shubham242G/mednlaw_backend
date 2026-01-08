const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');

// GET all blogs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .select('title summary date images seoTitle seoMetaDescription')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments();

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
    });
  } catch (err) {
    console.error('Blog fetch error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ msg: 'Blog not found' });
    res.set('Cache-Control', 'public, max-age=300');
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE blog (expects images as base64 array)
router.post('/', auth, async (req, res) => {
  try {
    const { title, summary, content, images = [], date, seoFocusKeyword, seoTitle, seoMetaDescription } = req.body;

    const blog = new Blog({
      title,
      summary,
      content,
      images, // array of base64 strings from frontend
      date: date ? new Date(date) : new Date(),
      seoFocusKeyword,
      seoTitle,
      seoMetaDescription,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error('Blog create error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// UPDATE blog (expects images as base64 array)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, summary, content, images = [], date, seoFocusKeyword, seoTitle, seoMetaDescription } = req.body;

    const existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) return res.status(404).json({ msg: 'Blog not found' });

    // ✅ REPLACE images (no append) - keeps exactly what frontend sends
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        summary,
        content,
        images: images.slice(0, 5), // ✅ Max 5, exactly from frontend
        date: date ? new Date(date) : new Date(),
        seoFocusKeyword,
        seoTitle,
        seoMetaDescription,
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Blog updated:', blog._id, 'Images count:', blog.images.length);
    res.json(blog);
  } catch (err) {
    console.error('Blog update error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog not found' });
    res.json({ msg: 'Blog deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
