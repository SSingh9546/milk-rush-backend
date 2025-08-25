const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateFarmerToken } = require('../../../middleware/validateFarmerToken');
const { uploadFarmers, fetchFarmerData } = require('../../../controllers/farmer/farmerDataController');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-farmer-data', upload.single('file'), uploadFarmers);

router.get('/get-farmer-data', authenticateFarmerToken, fetchFarmerData);

module.exports = router;