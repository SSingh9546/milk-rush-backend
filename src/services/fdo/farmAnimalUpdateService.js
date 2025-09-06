const FarmAnimals = require('../../models/fdo/FarmAnimals');

const farmAnimalUpdateService = {
   updateFarmAnimal: async (animal_id, updateData, fdoAssignedFarmId) => {
        // Validate animal_id
        if (!animal_id) {
            const error = new Error('Animal ID is required');
            error.statusCode = 400;
            throw error;
        }
        // Simple required field validation
        const requiredFields = ['farm_id', 'animal_name', 'bcs', 'livestock_status'];
        for (const field of requiredFields) {
            if (updateData[field] === undefined || updateData[field] === "") {
            const error = new Error(`${field} is required`);
            error.statusCode = 400;
            throw error;
            }
        }

        // Check if animal exists
        const existingAnimal = await FarmAnimals.findByPk(animal_id);
        if (!existingAnimal) {
            const error = new Error('Animal not found');
            error.statusCode = 404;
            throw error;
        }

        if (
            !updateData.farm_id ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === updateData.farm_id)
        ) {
            const error = new Error('Given Farm Id is not assigned to this FDO');
            error.statusCode = 400;
            throw error;
        }

        const assignedFarm = fdoAssignedFarmId.find(farm => farm.farm_id === updateData.farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            const error = new Error('Farm is not registered');
            error.statusCode = 400;
            throw error;
        }

        // Validate farm_id if provided (for validation only, not update)
        if (updateData.farm_id && updateData.farm_id !== existingAnimal.farm_id) {
            const error = new Error('Given Farm ID is not associated with this animal');
            error.statusCode = 403;
            throw error;
        }

        // Prepare update fields
        const updateFields = {};
        if (updateData.animal_name) updateFields.animal_name = updateData.animal_name;
        if (updateData.bcs !== undefined) updateFields.bcs = updateData.bcs;
        if (updateData.livestock_status) updateFields.livestock_status = updateData.livestock_status;

        // Update the animal
        const [updatedRowsCount] = await FarmAnimals.update(updateFields, {
            where: { id: animal_id }
        });

        if (updatedRowsCount === 0) {
            const error = new Error('No changes made to animal data');
            error.statusCode = 400;
            throw error;
        }

        // Fetch updated animal data
        const updatedAnimal = await FarmAnimals.findByPk(animal_id);
        return updatedAnimal;
    }
};

module.exports = farmAnimalUpdateService;