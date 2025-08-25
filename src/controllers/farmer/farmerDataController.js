const {importFarmersCSV, getFarmerData} = require('../../services/farmer/farmerDataService');

exports.uploadFarmers = async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ error: 'CSV file required (field: file)' });
  
  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    return res.status(400).json({ error: 'Invalid file format. Only CSV files are allowed.' });
  }

  try {
    const result = await importFarmersCSV(req.file.buffer);
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
exports.fetchFarmerData = async (req, res) => {
  try {
    const result = await getFarmerData(req.farmer.farmId);

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