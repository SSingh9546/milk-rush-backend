const FarmDetails = require('../../models/fdo/FarmDetails');

exports.getAllFarmsWithNames = async () => {
  try {
    const farms = await FarmDetails.findAll({
      attributes: ['farm_id', 'farm_name']
    });

    // Format output like farmId_farm_name
    return farms.map(farm => `${farm.farm_id}_${farm.farm_name}`);
  } catch (error) {
    throw error;
  }
};
