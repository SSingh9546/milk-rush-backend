const { Op, fn, col, literal } = require('sequelize');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');
const FdoAccount = require('../../models/fdo/FdoAccounts');
const FarmerData = require('../../models/farmer/FarmerData');

exports.getDashboardCounts = async (filters) => {
  try {
    const { farm_ids, farm_status, state, district, from_date, to_date } = filters;

    // Step 1: Build farmWhere with all filters
    const farmWhere = {};

    if (farm_ids && farm_ids.length > 0) {
      farmWhere.farm_id = { [Op.in]: farm_ids };
    }

    if (farm_status) {
      const normalizedStatus =
        farm_status.charAt(0).toUpperCase() + farm_status.slice(1).toLowerCase();
      farmWhere.farm_status = normalizedStatus;
    }

    if (state) farmWhere.state = state;
    if (district) farmWhere.district = district;

    if (from_date && to_date) {
      farmWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // Step 2: Query FarmDetails once to get matching farm_ids
    const matchingFarms = await FarmDetails.findAll({
      where: farmWhere,
      attributes: ['farm_id'],
      raw: true
    });

    const farmIdList = matchingFarms.map(f => f.farm_id);

    // If no farms match, return zero counts safely
    if (farmIdList.length === 0) {
      return {
        farmData: { totalFarms: 0, active: 0, pipeline: 0, inactive: 0 },
        farmAnimalData: { totalAnimals: 0, adultAnimals: 0, calvesAnimals: 0 },
        lactationStatusData: { heifers: 0, milking: 0, dry: 0, calf: 0 },
        breedingStatusData: { bred: 0, pregnant: 0, open: 0, dummy: 0 },
        lifeStatusData: { alive: 0, dead: 0, culled: 0, sold: 0 }
      };
    }

    // Step 3: Build animalWhere based only on farmIdList (and optional date filter)
    const animalWhere = { farm_id: { [Op.in]: farmIdList } };

    if (from_date && to_date) {
      animalWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // ✅ Farm counts
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

    // ✅ Farm animal counts
    const animalCounts = await FarmAnimal.findOne({
      where: animalWhere,
      attributes: [
        [fn('COUNT', col('id')), 'totalAnimals'],
        [fn('SUM', literal(`CASE WHEN is_adult = true THEN 1 ELSE 0 END`)), 'adultAnimals'],
        [fn('SUM', literal(`CASE WHEN is_calf = true THEN 1 ELSE 0 END`)), 'calvesAnimals']
      ],
      raw: true
    });

    // ✅ Lactation status counts
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

    // ✅ Breeding status counts
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

    // ✅ Livestock status counts
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

    return {
      farmData: farmCounts,
      farmAnimalData: animalCounts,
      lactationStatusData: lactationCounts,
      breedingStatusData: breedingCounts,
      lifeStatusData: livestockCounts
    };

  } catch (error) {
    throw error;
  }
};


