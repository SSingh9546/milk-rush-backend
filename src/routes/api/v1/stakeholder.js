const express = require('express');
const router = express.Router();
const dashboardController = require('../../../controllers/stakeholder/dashboardController');
const animalListController = require('../../../controllers/stakeholder/animalListController');
const farmListController = require('../../../controllers/stakeholder/farmListController');

// All Dashboard routes
router.post('/get-all-dashboard-data-by-filters', dashboardController.getDashboardCounts);

// animal-list-with-filters
router.post('/get-animal-list-by-filters', animalListController.getAnimalListWithFilters);

// animal-list-with-filters
router.post('/get-farm-list-by-filters', farmListController.getfarmListWithFilters);

router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Stakeholder routes working'
    });
});

module.exports = router;