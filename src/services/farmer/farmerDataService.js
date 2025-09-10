const csv = require('csv-parser');
const { Readable } = require('stream');
const FarmerData = require('../../models/farmer/FarmerData');
const FarmDetails = require('../../models/fdo/FarmDetails');

const importFarmersCSV = async (fileBuffer) => {
  const rows = [];
  const requiredHeaders = ['farm_id', 'farm_name', 'farmer_name', 'phone'];

  await new Promise((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('headers', (headers) => {
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          reject(new Error('Invalid file format. Required columns missing.'));
        }
      })
      .on('data', (r) => {
        rows.push({
          farm_id: String(r.farm_id || '').trim(),
          farm_name: String(r.farm_name || '').trim(),
          farmer_name: String(r.farmer_name || '').trim(),
          phone: String(r.phone || '').trim(),
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  try {
    const created = await FarmerData.bulkCreate(rows, { validate: true });
    return { inserted: created.length };
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Duplicate data found. Some records already exist.');
    }
    throw error;
  }
};

// Get Login farmer profile data
const getFarmerData = async (farmId) => {
  try {
    const farmer = await FarmerData.findOne({
      where: { farm_id: farmId },
      attributes: ['farm_id', 'farm_name', 'farmer_name', 'phone']
    });

    if (!farmer) {
      throw new Error('Farmer profile not found');
    }

    return {
      success: true,
      message: 'Farmer profile retrieved successfully',
      farmer: {
        farmId: farmer.farm_id,
        farmName: farmer.farm_name,
        farmerName: farmer.farmer_name,
        phone: farmer.phone
      }
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

const getFarmerFarmDetails = async (farmId) => {
  try {
    const farmDetails = await FarmDetails.findOne({
      where: { farm_id: farmId },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'id']
      },
      raw: true
    });

    if (!farmDetails) {
      const error = new Error('Farm details not found for the given farm_id');
      error.statusCode = 404;
      throw error;
    }

    return farmDetails;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  importFarmersCSV,
  getFarmerData,
  getFarmerFarmDetails
};