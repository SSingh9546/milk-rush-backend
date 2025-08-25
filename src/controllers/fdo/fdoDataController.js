const fdoData = require('../../services/fdo/fdoDataService');

exports.uploadFdoCsv = async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ error: 'CSV file required (field: file)' });
  
  // File format validation
  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    return res.status(400).json({ error: 'Invalid file format. Only CSV files are allowed.' });
  }

  try {
    const result = await fdoData.importFdoCSV(req.file.buffer);
    res.status(201).json({ 
      success: true, 
      message: 'FDO accounts created successfully',
      inserted: result.inserted
    });
  } catch (e) {
    res.status(500).json({
        success: false,
        message: 'Failed to upload FDO data',
        error: e.message
    });
  }
};

// Get authenticated FDO's data with optional is_new filter
exports.getFdoData = async (req, res) => {
  try {
    const { is_new } = req.query;
    
    const fdoId = req.fdo.fdoId;
    const result = await fdoData.getSpecificFdoData(fdoId, is_new);

    res.status(200).json({
      success: true,
      data: result.data,
      ...(is_new !== undefined && { 
        [is_new == 1 ? 'total_new_farms' : 'total_existing_farms']: result.total_farms 
      })
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
};

// Get all FDO data (separate API)
exports.getAllFdoData = async (req, res) => {
  try {
    const result = await fdoData.getAllFdoData();

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
};
