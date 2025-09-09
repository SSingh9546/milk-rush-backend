const lactationHistoryService = require('../../services/fdo/lactationHistoryService');

const getLactationHistory = async (req, res) => {
  try {
    const { animal_id } = req.params;

    if (!animal_id) {
      return res.status(400).json({
        success: false,
        message: 'Animal ID is required'
      });
    }

    const lactationHistory = await lactationHistoryService.getLactationHistoryByAnimalId(animal_id);

    return res.status(200).json({
      success: true,
      message: 'Lactation history fetched successfully',
      data: lactationHistory
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};


const getLactationHistoryDetails = async (req, res) => {
  try {
    const { calving_id } = req.params;

    if (!calving_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Calving ID is required'
      });
    }

    const lactationDetails = await lactationHistoryService.getLactationHistoryDetailsByCalvingId(calving_id);

    return res.status(200).json({
      success: true,
      message: 'Lactation details fetched successfully',
      data: lactationDetails
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getLactationHistory,
  getLactationHistoryDetails
};