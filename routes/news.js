const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const News = require('../models/News');

// Get all news with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const featured = req.query.featured;

    // Build query
    let query = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const news = await News.find(query)
      .select('title excerpt date category author featured images tags')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await News.countDocuments(query);

    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (err) {
    console.error('News fetch error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET single news by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).lean();

    if (!news) {
      return res.status(404).json({ msg: 'News not found' });
    }

    res.set('Cache-Control', 'public, max-age=300');
    res.json(news);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'News not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create news
router.post('/', auth, async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update news
router.put('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({ msg: 'News not found' });
    }

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete news
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ msg: 'News not found' });
    }

    res.json({ msg: 'News deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
