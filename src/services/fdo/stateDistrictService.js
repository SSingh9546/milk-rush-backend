const State = require('../../models/fdo/States');
const District = require('../../models/fdo/Districts');

const getAllStates = async () => {
  try {
    const states = await State.findAll({
      attributes: ['id', 'state'],
      order: [['state', 'ASC']]
    });
    
    return states;
  } catch (error) {
    throw new Error(`Error fetching states: ${error.message}`);
  }
};

const getDistrictsByStateId = async (stateId) => {
  try {
    const districts = await District.findAll({
      where: {
        state_id: stateId
      },
      attributes: ['id', 'state_id', 'district'],
      order: [['district', 'ASC']]
    });
    
    if (districts.length === 0) {
      throw new Error('No districts found for the given state ID');
    }
    
    return districts;
  } catch (error) {
    throw new Error(`Error fetching districts: ${error.message}`);
  }
};

module.exports = {
  getAllStates,
  getDistrictsByStateId
};