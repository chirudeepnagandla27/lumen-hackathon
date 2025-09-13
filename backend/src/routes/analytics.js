const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public analytics endpoint for development
router.get('/public-dashboard', analyticsController.getPublicDashboardStats);

// All authenticated analytics routes require authentication
router.use(authenticateToken);

// Common analytics routes (role-based data)
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/usage', analyticsController.getUsageAnalytics);

// Admin only analytics routes
router.get('/plans/popular', requireAdmin, analyticsController.getPopularPlans);
router.get('/trends', requireAdmin, analyticsController.getSubscriptionTrends);
router.get('/revenue', requireAdmin, analyticsController.getRevenueAnalytics);

module.exports = router;
