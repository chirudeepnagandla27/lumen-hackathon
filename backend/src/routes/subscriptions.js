const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All subscription routes require authentication
router.use(authenticateToken);

// User subscription routes
router.get('/', subscriptionController.getUserSubscriptions);
router.get('/:subscriptionId', subscriptionController.getSubscriptionById);
router.post('/', subscriptionController.createSubscription);
router.put('/:subscriptionId', subscriptionController.updateSubscription);
router.put('/:subscriptionId/cancel', subscriptionController.cancelSubscription);
router.put('/:subscriptionId/renew', subscriptionController.renewSubscription);

module.exports = router;
