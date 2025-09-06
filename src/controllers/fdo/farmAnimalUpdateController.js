const farmAnimalUpdateService = require('../../services/fdo/farmAnimalUpdateService');

const updateAnimalProfileInfo = async (req, res) => {
   try {
        const { animal_id } = req.params;
        const updateData = req.body;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        const result = await farmAnimalUpdateService.updateAnimalProfileInfo(animal_id, updateData, fdoAssignedFarmId);

        res.status(200).json({
            success: true,
            message: 'Farm animal profile info updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in updateFarmAnimal:', error);
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update farm animal details'
        });
    }
};

const updateAnimalReproductiveInfo = async (req, res) => {
   try {
        const { animal_id } = req.params;
        const updateData = req.body;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        const result = await farmAnimalUpdateService.updateAnimalReproductiveInfo(animal_id, updateData, fdoAssignedFarmId);

        res.status(200).json({
            success: true,
            message: 'Farm animal reproductive info updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in updateFarmAnimal:', error);
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update'
        });
    }
};



module.exports = {
    updateAnimalProfileInfo,
    updateAnimalReproductiveInfo 
};