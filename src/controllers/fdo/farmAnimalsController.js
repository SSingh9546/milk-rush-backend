const farmAnimalService = require('../../services/fdo/farmAnimalService');

const registerFarmAnimal = async (req, res) => {
    try {
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;
        const result = await farmAnimalService.registerAnimal(req.body, fdoAssignedFarmId);
        
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
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        if (!farm_id) {
            return res.status(400).json({
                success: false,
                message: 'farm_id is required'
            });
        }
        
        const animals = await farmAnimalService.getAnimalsByFarmId(farm_id, fdoAssignedFarmId);
        
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
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        if (!animal_id) {
            return res.status(400).json({
                success: false,
                message: 'animal_id is required'
            });
        }
        
        const animalDetails = await farmAnimalService.getAnimalDetailsByAnimalId(animal_id, fdoAssignedFarmId);
        
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

const getCalfDetailsByCalfId = async (req, res) => {
    try {
        const { calf_id } = req.params;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        if (!calf_id) {
            return res.status(400).json({
                success: false,
                message: "Calf ID is required"
            });
        }

        const calfDetails = await farmAnimalService.getCalfDetailsByCalfId(calf_id, fdoAssignedFarmId);

        if (!calfDetails) {
            return res.status(404).json({
                success: false,
                message: "Calf not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: calfDetails
        });

    } catch (error) {
        console.error('Error in getCalfDetails:', error);
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch calf details'
        });
    }
};

const updateCalfDetails = async (req, res) => {
    try {
        const { calf_id } = req.params;
        const updateData = req.body;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        if (!calf_id) {
            return res.status(400).json({
                success: false,
                message: "Calf ID is required"
            });
        }

        if (!updateData) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
        }

        const updatedCalf = await farmAnimalService.updateCalfById(calf_id, updateData, fdoAssignedFarmId);

        if (!updatedCalf) {
            return res.status(404).json({
                success: false,
                message: "Calf not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Calf details updated successfully",
            data: updatedCalf
        });

    } catch (error) {
        console.error('Error in updateCalfDetails:', error);
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update calf details'
        });
    }
};

module.exports = {
    registerFarmAnimal,
    getAllFarmAnimalsByFarmId,
    getAnimalDetailsByAnimalId,
    getCalfDetailsByCalfId,
    updateCalfDetails 
};