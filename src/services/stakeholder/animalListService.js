const { Op } = require('sequelize');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');

exports.getAnimalList = async (filters) => {
 try {
    const {
      farm_ids, farm_status, state, district,
      category, breeding_status, lactation_status,
      from_date, to_date
    } = filters;

    // ----------------------------
    // Step 1: Build farmWhere filters
    // ----------------------------
    const farmWhere = {};

    if (farm_ids && farm_ids.length > 0) {
      farmWhere.farm_id = { [Op.in]: farm_ids };
    }

    if (farm_status && farm_status.length > 0) {
      const normalizedStatuses = farm_status.map(
        s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      );
      farmWhere.farm_status = { [Op.in]: normalizedStatuses };
    }

    if (state && state.length > 0) {
      farmWhere.state = { [Op.in]: state };
    }

    if (district && district.length > 0) {
      farmWhere.district = { [Op.in]: district };
    }

    // Get all farm_ids matching farm filters
    const matchingFarms = await FarmDetails.findAll({
      where: farmWhere,
      attributes: ['farm_id', 'farm_name'],
      raw: true
    });

    const farmIdList = matchingFarms.map(f => f.farm_id);

    // ❌ No farms matched
    if (farmIdList.length === 0) {
      const error = new Error("No animal found for applied filters");
      error.statusCode = 404;
      throw error;
    }

    // ----------------------------
    // Step 2: Build animalWhere filters
    // ----------------------------
    const animalWhere = { farm_id: { [Op.in]: farmIdList } };

    // Category filter
    if (category && category !== 'all') {
      if (category === 'adult_cow') {
        animalWhere.is_adult = true;
      } else if (category === 'calves') {
        animalWhere.is_calf = true;
      }
    }

    // Breeding status filter (multi)
    if (breeding_status && breeding_status.length > 0) {
      animalWhere.breeding_status = { [Op.in]: breeding_status };
    }

    // Lactation status filter (multi)
    if (lactation_status && lactation_status.length > 0) {
      animalWhere.lactation_status = { [Op.in]: lactation_status };
    }

    // Date range filter
    if (from_date && to_date) {
      animalWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // ----------------------------
    // Step 3: Count animals
    // ----------------------------
    const total_count = await FarmAnimal.count({ where: animalWhere });

    if (total_count === 0) {
      const error = new Error("No animal found for applied filters");
      error.statusCode = 404;
      throw error;
    }

    // ----------------------------
    // Step 4: Query farm_animals
    // ----------------------------
    const animals = await FarmAnimal.findAll({
      where: animalWhere,
      attributes: [
        ['id', 'id'],  // animal_id as id
        'registration_id',
        'farm_id',
        'age',
        'lactation_status',
        'breeding_status',
        ['livestock_status', 'life_status']
      ],
      raw: true
    });

    // ----------------------------
    // Step 5: Attach farm_name from FarmDetails
    // ----------------------------
    const farmMap = {};
    matchingFarms.forEach(f => {
      farmMap[f.farm_id] = f.farm_name;
    });

    const result = animals.map(a => ({
      ...a,
      farm_name: farmMap[a.farm_id] || null
    }));

    return { total_count, animals: result };

  } catch (error) {
    throw error;
  }
};