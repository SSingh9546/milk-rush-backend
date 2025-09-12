const express = require('express');
const router = express.Router();
const dashboardController = require('../../../controllers/stakeholder/dashboardController');

// All Dashboard routes
router.post('/get-all-dashboard-data-by-filters', dashboardController.getDashboardCounts);

router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Stakeholder routes working'
    });
});

module.exports = router;