const express = require('express');
const router = express.Router();
const { authenticateFdoToken } = require('../../../middleware/validateFdoToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const FdoDataController = require('../../../controllers/fdo/fdoDataController');
const farmDetailsController = require('../../../controllers/fdo/farmDetailsController');
const farmAnimalsController = require('../../../controllers/fdo/farmAnimalsController');
const stateDistrictController = require('../../../controllers/fdo/stateDistrictController');
const animalRulesController = require('../../../controllers/fdo/animalRulesController');
const animalBreedController = require('../../../controllers/fdo/animalBreedController');

// All fdo data routes
router.post('/upload-fdo-data', upload.single('file'), FdoDataController.uploadFdoCsv);
router.get('/specific-fdo-data', authenticateFdoToken, FdoDataController.getFdoData);
router.get('/all-fdo-data', FdoDataController.getAllFdoData);

// Farm Details routes
router.post('/register-farm', authenticateFdoToken, farmDetailsController.registerFarmDetails);
router.get('/farm-details-by-farm-id/:farmId', authenticateFdoToken, farmDetailsController.getFarmDetailsByFarmId);

// Animal routes
router.post('/register-farm-animal', authenticateFdoToken, farmAnimalsController.registerFarmAnimal);
router.get('/all-animals-by-farmId/:farm_id', authenticateFdoToken, farmAnimalsController.getAllFarmAnimalsByFarmId);
router.get('/specific-animal-details-by-animalId/:animal_id', authenticateFdoToken, farmAnimalsController.getAnimalDetailsByAnimalId);

// Animal Calf routes
router.get('/specific-calf-details-by-calfId/:calf_id', authenticateFdoToken, farmAnimalsController.getCalfDetailsByCalfId);
router.put('/update-calf-details-by-calfId/:calf_id', authenticateFdoToken, farmAnimalsController.updateCalfDetails);

// Animal Rules route
router.post('/animal-rule/match', animalRulesController.matchAnimalRule);
router.get('/get-animal-rules', animalRulesController.fetchAllRules);

// State and District routes
router.get('/states', stateDistrictController.getAllStates);
router.get('/districts/:stateId', stateDistrictController.getDistrictsByStateId);

// Animal Breeds route
router.post('/get-animal-breeds', animalBreedController.fetchBreeds);

module.exports = router;