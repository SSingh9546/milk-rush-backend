const farmAnimalUpdateService = require('../../services/fdo/farmAnimalUpdateService');

const updateAnimalProfile = async (req, res) => {
   try {
        const { animal_id } = req.params;
        const updateData = req.body;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        const result = await farmAnimalUpdateService.updateFarmAnimal(animal_id, updateData, fdoAssignedFarmId);

        res.status(200).json({
            success: true,
            message: 'Farm animal updated successfully',
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

module.exports = {
    updateAnimalProfile 
};