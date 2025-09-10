const { Op, fn, col, literal } = require('sequelize');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');
const FdoAccount = require('../../models/fdo/FdoAccounts');
const FarmerData = require('../../models/farmer/FarmerData');

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

const getFarmerDashboardCounts = async (farmId) => {
    try {
        // Step 1 & 2: Get FDO assignments and validate farm_id
        const fdoAssignments = await FdoAccount.findAll({
            attributes: ['assigned_farm_id'],
            where: {
                assigned_farm_id: {
                    [Op.ne]: null
                }
            }
        });

        let assignedFarm = null;
        
        for (const fdo of fdoAssignments) {
            try {
                let assignedFarms;

                if (typeof fdo.assigned_farm_id === 'string') {
                    assignedFarms = JSON.parse(fdo.assigned_farm_id);
                } else {
                    assignedFarms = fdo.assigned_farm_id; // already object/array
                }

                assignedFarm = assignedFarms.find(farm => farm.farm_id === farmId);
                if (assignedFarm) break;

            } catch (parseError) {
                console.log('Error parsing assigned_farm_id for FDO:', parseError.message);
                continue;
            }
        }


        // Check if farm is assigned to any FDO and if it's registered
        if (!assignedFarm) {
            const error = new Error('Farm_id is not assigned to any fdo');
            error.statusCode = 400;
            throw error;
        }

        if (assignedFarm.is_new === 1) {
            const error = new Error('farm_id is not registered');
            error.statusCode = 400;
            throw error;
        }

        // Step 3: Check if any animals are registered for this farm_id
        const animalCount = await FarmAnimal.count({
            where: { farm_id: farmId }
        });

        if (animalCount === 0) {
            const error = new Error('no animal registered for this farm');
            error.statusCode = 400;
            throw error;
        }

        // Step 4: Get dashboard counts for animals registered under this farm_id
        const [animalData] = await Promise.all([
            FarmAnimal.findAll({
                where: { farm_id: farmId },
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

        const animalResult = animalData[0] || {};

        const farmerInfo = await FarmerData.findOne({
            where: { farm_id: farmId },
            attributes: ['farm_id', 'farm_name', 'farmer_name', 'phone'],
            raw: true
        });

        return {
            farmerInfo,
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
    getFarmDashboardCounts,
    getFarmerDashboardCounts
};