const adultAnimalRegistrationService = require('../../../services/fdo/animalRegistration/adultAnimalService');

const registerFarmAnimal = async (req, res) => {
    try {
        const result = await adultAnimalRegistrationService.registerAnimal(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Animal registered successfully',
            data: result
        });
    } catch (error) {
        console.error('Animal registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to register animal'
        });
    }
};

const getAllFarmAnimalsByFarmId = async (req, res) => {
    try {
        const { farm_id } = req.params;
        
        if (!farm_id) {
            return res.status(400).json({
                success: false,
                message: 'farm_id is required'
            });
        }
        
        const animals = await adultAnimalRegistrationService.getAnimalsByFarmId(farm_id);
        
        res.status(200).json({
            success: true,
            message: 'Animals fetched successfully',
            data: animals
        });
    } catch (error) {
        console.error('Get animals error:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch animals'
        });
    }
};

const getAnimalDetailsByAnimalId = async (req, res) => {
    try {
        const { animal_id } = req.params;
        
        if (!animal_id) {
            return res.status(400).json({
                success: false,
                message: 'animal_id is required'
            });
        }
        
        const animalDetails = await adultAnimalRegistrationService.getAnimalDetailsByAnimalId(animal_id);
        
        res.status(200).json({
            success: true,
            message: 'Animal details fetched successfully',
            data: animalDetails
        });
    } catch (error) {
        console.error('Get animal details error:', error);
        
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch animal details'
        });
    }
};


module.exports = {
    registerFarmAnimal,
    getAllFarmAnimalsByFarmId,
    getAnimalDetailsByAnimalId 
};