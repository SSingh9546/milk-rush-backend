const farmerService = require('../../services/farmer/farmerDataService');
const farmerDashboardService = require('../../services/global/dashboardDataService');

const uploadFarmers = async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ error: 'CSV file required (field: file)' });
  
  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    return res.status(400).json({ error: 'Invalid file format. Only CSV files are allowed.' });
  }

  try {
    const result = await farmerService.importFarmersCSV(req.file.buffer);
    res.status(201).json({ 
      success: true, 
      message: 'Farmers data uploaded successfully',
      inserted: result.inserted
    });
  } catch (e) {
    res.status(500).json({
        success: false,
        message: 'Failed to upload farmers data',
        error: e.message
    });
  }
};

// Get Login farmer profile data
const fetchFarmerData = async (req, res) => {
  try {
    const result = await farmerService.getFarmerData(req.farmer.farmId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.farmer
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const getFarmerDashboardData = async (req, res) => {
    try {
        const FarmId = req.farmer.farmId;
        const dashboardData = await farmerDashboardService.getFarmerDashboardCounts(FarmId);
        
        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard controller error:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getFarmerFarmDetails = async (req, res) => {
  try {
    const farmId = req.farmer.farmId; 

    const farmDetails = await farmerService.getFarmerFarmDetails(farmId);

    res.status(200).json({
      success: true,
      farmDetails
    });
  } catch (error) {
    console.error('Get Farmer Farm Details error:', error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  uploadFarmers,
  fetchFarmerData,
  getFarmerDashboardData,
  getFarmerFarmDetails
};