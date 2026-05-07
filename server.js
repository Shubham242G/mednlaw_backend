require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

console.log('🚀 Starting server...');

// Middleware
app.use(cors({
  origin: [
    'https://mednlaw-admin-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.mednlaw.com',
    'https://mednlaw.com',
    'https;//mednlaw.in',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

console.log('✅ Middleware configured');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Test route - MOVED TO TOP
app.get('/', (req, res) => {
  console.log('📍 Root route hit');
  res.json({ message: 'MednLaw API is running' });
});

// Routes - Add console logs
console.log('📡 Loading routes...');

try {
  console.log('Loading auth routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
  
  console.log('Loading blogs routes...');
  app.use('/api/blogs', require('./routes/blogs'));
  console.log('✅ Blogs routes loaded');
  
  console.log('Loading testimonials routes...');
  app.use('/api/testimonials', require('./routes/testimonials'));
  console.log('✅ Testimonials routes loaded');

  console.log('Loading faq routes...');
  app.use('/api/faq', require('./routes/faq'));
  console.log('✅ FAQ routes loaded');
  
  console.log('Loading news routes...');
  app.use('/api/news', require('./routes/news'));
  console.log('✅ News routes loaded');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// Add this debug route BEFORE the 404 handler
// Add this DEBUG route to see all registered routes (SAFE VERSION)
app.get('/debug-routes', (req, res) => {
  const routesList = [];
  
  if (!app._router || !app._router.stack) {
    return res.json({ error: 'Cannot access router stack' });
  }
  
  // Collect all registered routes
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      // Routes registered directly on app
      routesList.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Routes registered with app.use()
      let basePath = '';
      if (layer.regexp) {
        const source = layer.regexp.source;
        basePath = source
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\?/g, '')
          .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
      }
      
      layer.handle.stack.forEach((subLayer) => {
        if (subLayer.route) {
          const fullPath = (basePath + subLayer.route.path).replace(/\/\//g, '/');
          routesList.push({
            path: fullPath,
            methods: Object.keys(subLayer.route.methods)
          });
        }
      });
    }
  });
  
  res.json({ 
    totalRoutes: routesList.length,
    routes: routesList,
    serverTime: new Date().toISOString()
  });
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Test the server at: http://localhost:${PORT}`);
});