const farmDetailsService = require('../../services/fdo/farmService');

const registerFarmDetails = async (req, res) => {
  try {
    const farmData = req.body;
    const fdoAssignedFarmId = req.fdo.assignedFarmIds;
    const fdoEmpId = req.fdo.empId;

    const result = await farmDetailsService.createFarmDetails(farmData, fdoAssignedFarmId, fdoEmpId);
    
    res.status(201).json({
      success: true,
      message: 'Farm details created successfully',
      data: result
    });
  } catch (error) {
    if (error.message.includes('Validation error') || error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create farm details',
      error: error.message
    });
  }
};

const getFarmDetailsByFarmId = async (req, res) => {
  try {
    const { farmId } = req.params;
    const fdoAssignedFarmId = req.fdo.assignedFarmIds;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required'
      });
    }

    const result = await farmDetailsService.getFarmDetailsByFarmId(farmId, fdoAssignedFarmId);
    
    res.status(200).json({
      success: true,
      message: 'Farm details fetched successfully',
      data: result
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farm details',
      error: error.message
    });
  }
};

const updateFarmDetails = async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { inseminator_contact_number, veterinarian_contact_number } = req.body;
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        if (!farm_id) {
            return res.status(400).json({
                success: false,
                message: 'Farm ID is required'
            });
        }

        const result = await farmDetailsService.updateFarmDetails(farm_id, fdoAssignedFarmId, {
            inseminator_contact_number,
            veterinarian_contact_number
        });

        res.status(200).json({
            success: true,
            message: 'Farm details updated successfully',
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getAllFarmAnimalsUnderFdo = async (req, res) => {
    try {
        const fdoAssignedFarmId = req.fdo.assignedFarmIds;

        const animals = await farmDetailsService.getAllFarmAnimalsUnderFdo(fdoAssignedFarmId);
        
        res.status(200).json({
            status: 'success',
            message: 'Animals fetched successfully',
            data: animals
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
  registerFarmDetails,
  getFarmDetailsByFarmId,
  updateFarmDetails,
  getAllFarmAnimalsUnderFdo
};