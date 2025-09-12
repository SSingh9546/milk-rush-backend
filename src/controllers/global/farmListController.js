const allFarmListService = require('../../services/global/allFarmListService');

const getAllFarms = async (req, res) => {
  try {
    const farms = await allFarmListService.getAllFarmsWithNames();

    return res.status(200).json({
      success: true,
      message: 'Farm list fetched successfully',
      data: farms
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAllFarms };
