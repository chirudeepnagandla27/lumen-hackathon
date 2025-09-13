const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');

// GET /api/network/data - Get network data
router.get('/data', networkController.getNetworkData);

// GET /api/network/stats - Get network statistics
router.get('/stats', networkController.getNetworkStats);

// POST /api/network/analyze - Analyze network performance
router.post('/analyze', networkController.analyzeNetwork);

module.exports = router;


