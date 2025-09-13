const express = require('express');
const router = express.Router();

// Sample network stats
router.get('/stats', (req, res) => {
  const stats = {
    totalTowers: 50,
    activeTowers: 45,
    averageSignal: 87,
    averageLatency: 120,
    uptime: '99.9%',
    lastUpdated: new Date()
  };
  res.json({ success: true, stats });
});

// NEW: /data route
router.get('/data', (req, res) => {
  const data = [
    { towerId: 'T1', location: 'CA', status: 'active', signal: 88, latency: 110 },
    { towerId: 'T2', location: 'TX', status: 'inactive', signal: 70, latency: 250 },
    { towerId: 'T3', location: 'NY', status: 'active', signal: 90, latency: 95 },
    // add more dummy tower data here
  ];
  res.json({ success: true, data });
});

module.exports = router;
