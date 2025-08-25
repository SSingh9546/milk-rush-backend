const stateDistrictService = require('../../services/fdo/stateDistrictService');

const getAllStates = async (req, res) => {
  try {
    const states = await stateDistrictService.getAllStates();
    
    res.status(200).json({
      success: true,
      message: 'States fetched successfully',
      data: states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch states',
      error: error.message
    });
  }
};

const getDistrictsByStateId = async (req, res) => {
  try {
    const { stateId } = req.params;
    
    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: 'State ID is required'
      });
    }

    const districts = await stateDistrictService.getDistrictsByStateId(stateId);
    
    res.status(200).json({
      success: true,
      message: 'Districts fetched successfully',
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts',
      error: error.message
    });
  }
};

module.exports = {
  getAllStates,
  getDistrictsByStateId
};