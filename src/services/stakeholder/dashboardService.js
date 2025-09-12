const { Op, fn, col, literal } = require('sequelize');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');

exports.getDashboardCounts = async (filters) => {
  try {
    const { farm_ids, farm_status, state, district, from_date, to_date } = filters;

    // ----------------------------
    // Step 1: Build farmWhere with multi-value support
    // ----------------------------
    const farmWhere = {};

    // Farm IDs (multi)
    if (farm_ids && farm_ids.length > 0) {
      farmWhere.farm_id = { [Op.in]: farm_ids };
    }

    // Farm Status (multi + normalization)
    if (farm_status && farm_status.length > 0) {
      const normalizedStatuses = farm_status.map(s =>
        s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      );
      farmWhere.farm_status = { [Op.in]: normalizedStatuses };
    }

    // State (multi)
    if (state && state.length > 0) {
      farmWhere.state = { [Op.in]: state };
    }

    // District (multi)
    if (district && district.length > 0) {
      farmWhere.district = { [Op.in]: district };
    }

    // Date range
    if (from_date && to_date) {
      farmWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // ----------------------------
    // Step 2: Get matching farms
    // ----------------------------
    const matchingFarms = await FarmDetails.findAll({
      where: farmWhere,
      attributes: ['farm_id'],
      raw: true
    });

    const farmIdList = matchingFarms.map(f => f.farm_id);

    // ----------------------------
    // Step 3: Build animalWhere
    // ----------------------------
    const animalWhere = {};
    if (farmIdList.length > 0) {
      animalWhere.farm_id = { [Op.in]: farmIdList };
    }

    if (from_date && to_date) {
      animalWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // ----------------------------
    // Step 4: Farm counts
    // ----------------------------
    const farmCounts = await FarmDetails.findOne({
      where: farmWhere,
      attributes: [
        [fn('COUNT', col('id')), 'totalFarms'],
        [fn('SUM', literal(`CASE WHEN farm_status = 'Active' THEN 1 ELSE 0 END`)), 'active'],
        [fn('SUM', literal(`CASE WHEN farm_status = 'Pipeline' THEN 1 ELSE 0 END`)), 'pipeline'],
        [fn('SUM', literal(`CASE WHEN farm_status = 'Inactive' THEN 1 ELSE 0 END`)), 'inactive']
      ],
      raw: true
    });

    // ----------------------------
    // Step 5: Animal counts
    // ----------------------------
    const animalCounts = await FarmAnimal.findOne({
      where: animalWhere,
      attributes: [
        [fn('COUNT', col('id')), 'totalAnimals'],
        [fn('SUM', literal(`CASE WHEN is_adult = true THEN 1 ELSE 0 END`)), 'adultAnimals'],
        [fn('SUM', literal(`CASE WHEN is_calf = true THEN 1 ELSE 0 END`)), 'calvesAnimals']
      ],
      raw: true
    });

    // ----------------------------
    // Step 6: Lactation counts
    // ----------------------------
    const lactationCounts = await FarmAnimal.findOne({
      where: animalWhere,
      attributes: [
        [fn('SUM', literal(`CASE WHEN lactation_status = 'Heifer' THEN 1 ELSE 0 END`)), 'heifers'],
        [fn('SUM', literal(`CASE WHEN lactation_status = 'Milking' THEN 1 ELSE 0 END`)), 'milking'],
        [fn('SUM', literal(`CASE WHEN lactation_status = 'Dry' THEN 1 ELSE 0 END`)), 'dry'],
        [fn('SUM', literal(`CASE WHEN lactation_status = 'Calf' THEN 1 ELSE 0 END`)), 'calf']
      ],
      raw: true
    });

    // ----------------------------
    // Step 7: Breeding counts
    // ----------------------------
    const breedingCounts = await FarmAnimal.findOne({
      where: animalWhere,
      attributes: [
        [fn('SUM', literal(`CASE WHEN breeding_status = 'Bred' THEN 1 ELSE 0 END`)), 'bred'],
        [fn('SUM', literal(`CASE WHEN breeding_status = 'Pregnant' THEN 1 ELSE 0 END`)), 'pregnant'],
        [fn('SUM', literal(`CASE WHEN breeding_status = 'Open' THEN 1 ELSE 0 END`)), 'open'],
        [fn('SUM', literal(`CASE WHEN breeding_status = 'N/A' THEN 1 ELSE 0 END`)), 'dummy']
      ],
      raw: true
    });

    // ----------------------------
    // Step 8: Livestock counts
    // ----------------------------
    const livestockCounts = await FarmAnimal.findOne({
      where: animalWhere,
      attributes: [
        [fn('SUM', literal(`CASE WHEN livestock_status = 'Alive' THEN 1 ELSE 0 END`)), 'alive'],
        [fn('SUM', literal(`CASE WHEN livestock_status = 'Dead' THEN 1 ELSE 0 END`)), 'dead'],
        [fn('SUM', literal(`CASE WHEN livestock_status = 'Culled' THEN 1 ELSE 0 END`)), 'culled'],
        [fn('SUM', literal(`CASE WHEN livestock_status = 'Sold' THEN 1 ELSE 0 END`)), 'sold']
      ],
      raw: true
    });

    // ----------------------------
    // Step 9: Return
    // ----------------------------
    return {
      farmData: farmCounts || { totalFarms: 0, active: 0, pipeline: 0, inactive: 0 },
      farmAnimalData: animalCounts || { totalAnimals: 0, adultAnimals: 0, calvesAnimals: 0 },
      lactationStatusData: lactationCounts || { heifers: 0, milking: 0, dry: 0, calf: 0 },
      breedingStatusData: breedingCounts || { bred: 0, pregnant: 0, open: 0, dummy: 0 },
      lifeStatusData: livestockCounts || { alive: 0, dead: 0, culled: 0, sold: 0 }
    };

  } catch (error) {
    throw error;
  }
};
