const csv = require('csv-parser');
const { Readable } = require('stream');
const { Op } = require('sequelize');
const { sequelize } = require('../../shared/config/sequelize-db');
const FdoAccount = require('../../models/fdo/FdoAccounts');
const FarmerData = require('../../models/farmer/FarmerData');
const FarmDetails = require('../../models/fdo/FarmDetails');

const generateCredentials = (fdoName, phone, assignedFarmId) => {
  const firstWord = fdoName.split(' ')[0].toLowerCase();
  const last4Digits = phone.slice(-4);
  const username = `${firstWord}${last4Digits}`;
  
  const firstName = fdoName.split(' ')[0].toLowerCase();
  const random3Digits = Math.floor(100 + Math.random() * 900);
  const randomAlphabet = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const password = `${firstName}${last4Digits}@${random3Digits}${randomAlphabet}`;
  
  return { username, password };
};

exports.importFdoCSV = async (fileBuffer) => {
  const rows = [];
  const requiredHeaders = ['fdo_name', 'phone', 'assigned_farm_id', 'status', 'emp_id'];

  await new Promise((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('headers', (headers) => {
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) reject(new Error('Required columns missing.'));
      })
      .on('data', (r) => {
        if (requiredHeaders.some(field => !r[field] || !String(r[field]).trim())) {
          reject(new Error('No empty cells allowed.'));
          return;
        }
        
        const status = String(r.status).trim();
        if (!['new', 'replace'].includes(status)) {
          reject(new Error('Status must be: new or replace.'));
          return;
        }

        const { username, password } = generateCredentials(r.fdo_name, r.phone, r.assigned_farm_id);
        const farmIds = String(r.assigned_farm_id).trim().replace(/"/g, '').split(',').map(id => id.trim());
        const farmIdsWithStatus = farmIds.map(farmId => ({ farm_id: farmId, is_new: 1 }));
        
        rows.push({
          fdo_name: String(r.fdo_name).trim(),
          phone: String(r.phone).trim(),
          assigned_farm_id: farmIdsWithStatus,
          status,
          emp_id: String(r.emp_id).trim(),
          username,
          password
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Validate farm_ids exist
  const allFarmIds = [...new Set(rows.flatMap(row => row.assigned_farm_id.map(item => item.farm_id)))];
  const validFarmIds = (await FarmerData.findAll({ where: { farm_id: { [Op.in]: allFarmIds } }, attributes: ['farm_id'] })).map(f => f.farm_id);
  const invalidFarmIds = allFarmIds.filter(id => !validFarmIds.includes(id));
  if (invalidFarmIds.length > 0) throw new Error(`Invalid farm_id(s): ${invalidFarmIds.join(', ')}`);

  const [newEntries, replaceEntries] = [rows.filter(r => r.status === 'new'), rows.filter(r => r.status === 'replace')];
  let insertedCount = 0;

  // Handle new entries
  if (newEntries.length > 0) {
    const newFarmIds = newEntries.flatMap(e => e.assigned_farm_id.map(item => item.farm_id));
    const existingAssignments = await FdoAccount.findAll({ 
      where: sequelize.literal(`JSON_OVERLAPS(JSON_EXTRACT(assigned_farm_id, '$[*].farm_id'), '${JSON.stringify(newFarmIds)}')`)
    });
    if (existingAssignments.length > 0) {
      const existingFarmIds = existingAssignments.flatMap(record => record.assigned_farm_id.map(item => item.farm_id));
      const duplicates = [...new Set(newFarmIds.filter(id => existingFarmIds.includes(id)))];
      throw new Error(`Farm ID(s) already assigned: ${duplicates.join(', ')}`);
    }
    const created = await FdoAccount.bulkCreate(newEntries, { validate: true });
    insertedCount += created.length;
  }

  // Handle replace entries
  for (const entry of replaceEntries) {
    const farmIdsToReplace = entry.assigned_farm_id;
    
    // Check each farm_id - some might be existing, some might be new
    for (const farmItem of farmIdsToReplace) {
      const farmIdToReplace = farmItem.farm_id;
      const currentFdo = await FdoAccount.findOne({ 
        where: sequelize.literal(`JSON_CONTAINS(JSON_EXTRACT(assigned_farm_id, '$[*].farm_id'), '"${farmIdToReplace}"')`)
      });
      
      if (currentFdo) {
        // Remove farm_id from current FDO's array
        const updatedFarmIds = currentFdo.assigned_farm_id.filter(item => item.farm_id !== farmIdToReplace);
        await currentFdo.update({ assigned_farm_id: updatedFarmIds });
      }
    }
    
    // Find or create target FDO
    const targetFdo = await FdoAccount.findOne({ where: { phone: entry.phone } });
    if (targetFdo) {
      // Merge existing and new farm_ids, avoiding duplicates
      const existingFarmIds = targetFdo.assigned_farm_id.map(item => item.farm_id);
      const newFarmItems = farmIdsToReplace.filter(item => !existingFarmIds.includes(item.farm_id));
      const mergedFarmIds = [...targetFdo.assigned_farm_id, ...newFarmItems];
      
      await targetFdo.update({
        fdo_name: entry.fdo_name,
        assigned_farm_id: mergedFarmIds,
        emp_id: entry.emp_id,
        username: entry.username,
        password: entry.password,
        status: 'replaced'
      });
    } else {
      // Create new FDO
      await FdoAccount.create({ 
        ...entry, 
        status: 'replaced' 
      });
    }
    insertedCount++;
  }

  return { inserted: insertedCount };
};

// Get specific FDO data by ID with optional is_new filter
exports.getSpecificFdoData = async (fdoId, is_new) => {
  const fdo = await FdoAccount.findByPk(fdoId, {
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  
  if (!fdo) throw new Error('FDO not found');
  
  const filteredFarms = is_new !== undefined 
    ? fdo.assigned_farm_id.filter(farm => farm.is_new == is_new)
    : fdo.assigned_farm_id;
  
  const farmIds = filteredFarms.map(farm => farm.farm_id);
  
  const [farmerData, farmDetails] = await Promise.all([
    FarmerData.findAll({
      where: { farm_id: { [Op.in]: farmIds } },
      attributes: ['farm_id', 'farm_name', 'phone', 'farmer_name']
    }),
    FarmDetails.findAll({
      where: { farm_id: { [Op.in]: farmIds } },
      attributes: ['farm_id', 'address_line1', 'farm_status']
    })
  ]);
  
  const farmMap = {};
  farmerData.forEach(farm => farmMap[farm.farm_id] = { farm_name: farm.farm_name, farm_phone:farm.phone, farmer_name: farm.farmer_name });
  farmDetails.forEach(farm => {
    if (farmMap[farm.farm_id]) {
      farmMap[farm.farm_id] = {
        ...farmMap[farm.farm_id],
        farm_address: is_new == 0 ? farm.address_line1 : null,
        status: is_new == 0 ? farm.farm_status : null,
        total_animals: null
      };
    }
  });
  
  const enhancedFarms = filteredFarms.map(farm => ({ ...farm, ...farmMap[farm.farm_id] }));
  
  return {
    data: { ...fdo.toJSON(), assigned_farm_id: enhancedFarms },
    ...(is_new !== undefined && { total_farms: enhancedFarms.length })
  };
};

// Get all FDO data
exports.getAllFdoData = async () => {
  const fdoData = await FdoAccount.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  
  return { data: fdoData };
};