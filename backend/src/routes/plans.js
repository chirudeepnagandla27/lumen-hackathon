const express = require('express');
const planController = require('../controllers/planController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, planController.getAllPlans);
router.get('/popular', planController.getPopularPlans);
router.get('/:planId', optionalAuth, planController.getPlanById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, planController.createPlan);
router.put('/:planId', authenticateToken, requireAdmin, planController.updatePlan);
router.delete('/:planId', authenticateToken, requireAdmin, planController.deletePlan);

module.exports = router;
