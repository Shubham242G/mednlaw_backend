// routes/faq.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { FAQ, PageFAQ } = require('../models/FAQ');


// TEST ROUTE - Add this FIRST
router.get('/test', (req, res) => {
  res.json({ message: 'FAQ routes are working!', timestamp: new Date() });
});
// ========== PUBLIC ROUTES ==========
router.get('/page/:pageUrl', async (req, res) => {
  try {
    const { pageUrl } = req.params;
    const pageFAQ = await PageFAQ.findOne({ 
      pageUrl: decodeURIComponent(pageUrl),
      isActive: true 
    }).populate({
      path: 'faqs',
      match: { isActive: true },
      options: { sort: { order: 1 } }
    });
    
    res.json({ faqs: pageFAQ?.faqs || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// GET all FAQs
router.get('/admin/faqs', auth, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json({ faqs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE FAQ
router.post('/admin/faqs', auth, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE FAQ
router.put('/admin/faqs/:id', auth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE FAQ
router.delete('/admin/faqs/:id', auth, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all page-faq assignments
router.get('/admin/page-faqs', auth, async (req, res) => {
  try {
    const pageFAQs = await PageFAQ.find()
      .populate('faqs')
      .sort({ pageUrl: 1 });
    res.json({ pageFAQs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE/UPDATE page-faq assignment
router.post('/admin/page-faqs', auth, async (req, res) => {
  try {
    const { pageUrl, pageType, faqs } = req.body;
    
    let pageFAQ = await PageFAQ.findOne({ pageUrl });
    if (pageFAQ) {
      pageFAQ.faqs = faqs;
      pageFAQ.pageType = pageType;
      await pageFAQ.save();
    } else {
      pageFAQ = new PageFAQ({ pageUrl, pageType, faqs });
      await pageFAQ.save();
    }
    
    res.json(pageFAQ);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE page-faq assignment
router.delete('/admin/page-faqs/:id', auth, async (req, res) => {
  try {
    await PageFAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page FAQ assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;