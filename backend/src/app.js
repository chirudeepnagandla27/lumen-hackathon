const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const subscriptionRoutes = require('./routes/subscriptions');
const analyticsRoutes = require('./routes/analytics');
const networkRoutes = require('./routes/networkRoutes'); // NEW

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // frontend port
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for correct IP addresses
app.set('trust proxy', true);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'subscription-management-api'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/network', networkRoutes); // NEW

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Subscription Management API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API endpoints:`);
  console.log(`   • Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   • Plans: http://localhost:${PORT}/api/plans`);
  console.log(`   • Subscriptions: http://localhost:${PORT}/api/subscriptions`);
  console.log(`   • Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`   • Network Stats: http://localhost:${PORT}/api/network/stats`); // NEW
});
