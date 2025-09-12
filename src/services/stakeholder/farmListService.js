const { Op, fn, col } = require('sequelize');
const FdoAccount = require('../../models/fdo/FdoAccounts');
const FarmDetails = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');

exports.getFarmListData = async (filters) => {
  try {
    const { is_new, farm_ids, farm_status, state, district, from_date, to_date } = filters;

    let allowedFarmIds = [];

    // ---------------------------------
    // Step 1: Handle is_new filter (FDO Accounts table)
    // ---------------------------------
    if (is_new !== null) {
      const fdoRecords = await FdoAccount.findAll({
        attributes: ['assigned_farm_id'],
        raw: true
      });

      fdoRecords.forEach(rec => {
        try {
          const farms = JSON.parse(rec.assigned_farm_id || '[]');
          farms.forEach(f => {
            if (parseInt(f.is_new) === parseInt(is_new)) {
              allowedFarmIds.push(f.farm_id);
            }
          });
        } catch (e) {
          // ignore bad JSON
        }
      });

      if (allowedFarmIds.length === 0) {
        return []; // No matching farms
      }
    }

    // ---------------------------------
    // Step 2: Build farmWhere with multiple filters
    // ---------------------------------
    const farmWhere = {};

    if (allowedFarmIds.length > 0) {
      farmWhere.farm_id = { [Op.in]: allowedFarmIds };
    }

    if (farm_ids && farm_ids.length > 0) {
      farmWhere.farm_id = farmWhere.farm_id
        ? { [Op.and]: [farmWhere.farm_id, { [Op.in]: farm_ids }] }
        : { [Op.in]: farm_ids };
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

    if (from_date && to_date) {
      farmWhere.createdAt = { [Op.between]: [from_date, to_date] };
    }

    // ---------------------------------
    // Step 3: Fetch farm details
    // ---------------------------------
    const farms = await FarmDetails.findAll({
      where: farmWhere,
      attributes: [
        'farm_id',
        'farm_name',
        ['farmer_contact_number', 'farmer_phone'],
        ['farm_status', 'status'],
        'address_line1',
        'address_line2'
      ],
      raw: true
    });

    if (farms.length === 0) {
      return [];
    }

    const farmIds = farms.map(f => f.farm_id);

    // ---------------------------------
    // Step 4: Get animal counts per farm
    // ---------------------------------
    const animalCounts = await FarmAnimal.findAll({
      where: { farm_id: { [Op.in]: farmIds } },
      attributes: ['farm_id', [fn('COUNT', col('id')), 'total_animals']],
      group: ['farm_id'],
      raw: true
    });

    const animalCountMap = {};
    animalCounts.forEach(ac => {
      animalCountMap[ac.farm_id] = parseInt(ac.total_animals, 10);
    });

    // ---------------------------------
    // Step 5: Attach address + animal counts
    // ---------------------------------
    const result = farms.map(f => ({
      farm_id: f.farm_id,
      farm_name: f.farm_name,
      farmer_phone: f.farmer_phone,
      status: f.status,
      address: f.address_line1 ? f.address_line1 : f.address_line2,
      total_animals: animalCountMap[f.farm_id] || 0
    }));

    return result;
  } catch (error) {
    throw error;
  }
};
