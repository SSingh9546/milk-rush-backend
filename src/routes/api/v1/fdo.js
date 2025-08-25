const express = require('express');
const router = express.Router();
const { authenticateFdoToken } = require('../../../middleware/validateFdoToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const FdoDataController = require('../../../controllers/fdo/fdoDataController');
const farmDetailsController = require('../../../controllers/fdo/farmDetailsController');
const stateDistrictController = require('../../../controllers/fdo/stateDistrictController');

// All fdo data routes
router.post('/upload-fdo-data', upload.single('file'), FdoDataController.uploadFdoCsv);
router.get('/specific-fdo-data', authenticateFdoToken, FdoDataController.getFdoData);
router.get('/all-fdo-data', FdoDataController.getAllFdoData);

// Farm Details routes
router.post('/register-farm', authenticateFdoToken, farmDetailsController.registerFarmDetails);
router.get('/farm-details-by-farm-id/:farmId', authenticateFdoToken, farmDetailsController.getFarmDetailsByFarmId);

// State and District routes
router.get('/states', stateDistrictController.getAllStates);
router.get('/districts/:stateId', stateDistrictController.getDistrictsByStateId);

module.exports = router;