const express = require('express');
const router = express.Router();
const stateDistrictController = require('../../../controllers/global/stateDistrictController');
const farmListController = require('../../../controllers/global/farmListController');

// State and District routes
router.get('/states', stateDistrictController.getAllStates);
router.get('/districts/:stateId', stateDistrictController.getDistrictsByStateId);

// Farm-list-for-filter routes
router.get('/get-farm-list-for-filter', farmListController.getAllFarms);

router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Global routes working'
    });
});

module.exports = router;