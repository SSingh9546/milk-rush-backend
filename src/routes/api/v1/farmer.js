const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateFarmerToken } = require('../../../middleware/validateFarmerToken');
const farmerController = require('../../../controllers/farmer/farmerDataController');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-farmer-data', upload.single('file'), farmerController.uploadFarmers);

router.get('/get-farmer-data', authenticateFarmerToken, farmerController.fetchFarmerData);

router.get('/get-farmer-dashboard-data', authenticateFarmerToken, farmerController.getFarmerDashboardData);

router.get('/get-farmer-farm-details', authenticateFarmerToken, farmerController.getFarmerFarmDetails);

module.exports = router;