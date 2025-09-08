const { Op, fn, col, literal } = require('sequelize');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');

const getFarmDashboardCounts = async (fdoAssignedFarmId) => {
    try {
        // Extract farm_id from the assigned farm data
        const farmIds = fdoAssignedFarmId?.map(farm => farm.farm_id) || [];
        if (!farmIds.length) {
            const error = new Error('Farm is not assigned to this FDO');
            error.statusCode = 400;
            throw error;
        }
        // Ensure at least one assigned farm is registered (is_new === 0)
        if (!fdoAssignedFarmId?.some(({ is_new }) => is_new === 0)) {
            const error = new Error('Assigned farms are not registered for this FDO');
            error.statusCode = 400;
            throw error;
        }

        const farmIdsArray = Array.isArray(farmIds) ? farmIds : [farmIds];

        // Get all data in parallel for maximum performance
        const [farmData, animalData] = await Promise.all([
            // Farm details counts
            FarmDetails.findAll({
                where: { farm_id: { [Op.in]: farmIdsArray } },
                attributes: [
                    [fn('COUNT', col('id')), 'totalFarms'],
                    [fn('COUNT', literal("CASE WHEN farm_status = 'ACTIVE' THEN 1 END")), 'active'],
                    [fn('COUNT', literal("CASE WHEN farm_status = 'PIPELINE' THEN 1 END")), 'pipeline'],
                    [fn('COUNT', literal("CASE WHEN farm_status = 'INACTIVE' THEN 1 END")), 'inactive']
                ],
                raw: true
            }),

            // Farm animals counts - all metrics in single query
            FarmAnimal.findAll({
                where: { farm_id: { [Op.in]: farmIdsArray } },
                attributes: [
                    [fn('COUNT', col('id')), 'totalAnimals'],
                    [fn('COUNT', literal("CASE WHEN is_adult = 1 THEN 1 END")), 'adultAnimals'],
                    [fn('COUNT', literal("CASE WHEN is_calf = 1 THEN 1 END")), 'calvesAnimals'],
                    
                    // Lactation status counts
                    [fn('COUNT', literal("CASE WHEN lactation_status = 'heifers' THEN 1 END")), 'heifers'],
                    [fn('COUNT', literal("CASE WHEN lactation_status = 'milking' THEN 1 END")), 'milking'],
                    [fn('COUNT', literal("CASE WHEN lactation_status = 'dry' THEN 1 END")), 'dry'],
                    [fn('COUNT', literal("CASE WHEN lactation_status = 'calf' THEN 1 END")), 'calf'],
                    
                    // Breeding status counts
                    [fn('COUNT', literal("CASE WHEN breeding_status = 'bred' THEN 1 END")), 'bred'],
                    [fn('COUNT', literal("CASE WHEN breeding_status = 'pregnant' THEN 1 END")), 'pregnant'],
                    [fn('COUNT', literal("CASE WHEN breeding_status = 'open' THEN 1 END")), 'open'],
                    [fn('COUNT', literal("CASE WHEN breeding_status = 'dummy' THEN 1 END")), 'dummy'],
                    
                    // Livestock status counts
                    [fn('COUNT', literal("CASE WHEN livestock_status = 'Alive' THEN 1 END")), 'alive'],
                    [fn('COUNT', literal("CASE WHEN livestock_status = 'Dead' THEN 1 END")), 'dead'],
                    [fn('COUNT', literal("CASE WHEN livestock_status = 'Culled' THEN 1 END")), 'culled'],
                    [fn('COUNT', literal("CASE WHEN livestock_status = 'Sold' THEN 1 END")), 'sold']
                ],
                raw: true
            })
        ]);

        const farmResult = farmData[0] || {};
        const animalResult = animalData[0] || {};

        return {
            farmData: {
                totalFarms: parseInt(farmResult.totalFarms) || 0,
                active: parseInt(farmResult.active) || 0,
                pipeline: parseInt(farmResult.pipeline) || 0,
                inactive: parseInt(farmResult.inactive) || 0
            },
            farmAnimalData: {
                totalAnimals: parseInt(animalResult.totalAnimals) || 0,
                adultAnimals: parseInt(animalResult.adultAnimals) || 0,
                calvesAnimals: parseInt(animalResult.calvesAnimals) || 0
            },
            lactationStatusData: {
                heifers: parseInt(animalResult.heifers) || 0,
                milking: parseInt(animalResult.milking) || 0,
                dry: parseInt(animalResult.dry) || 0,
                calf: parseInt(animalResult.calf) || 0
            },
            breedingStatusData: {
                bred: parseInt(animalResult.bred) || 0,
                pregnant: parseInt(animalResult.pregnant) || 0,
                open: parseInt(animalResult.open) || 0,
                dummy: parseInt(animalResult.dummy) || 0
            },
            lifeStatusData: {
                alive: parseInt(animalResult.alive) || 0,
                dead: parseInt(animalResult.dead) || 0,
                culled: parseInt(animalResult.culled) || 0,
                sold: parseInt(animalResult.sold) || 0
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getFarmDashboardCounts
};