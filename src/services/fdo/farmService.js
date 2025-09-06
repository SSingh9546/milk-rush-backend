const FarmDetails = require('../../models/fdo/FarmDetails');
const FdoAccount = require('../../models/fdo/FdoAccounts');
const FarmAnimal = require('../../models/fdo/FarmAnimals');

const createFarmDetails = async (farmData, fdoAssignedFarmId, fdoEmpId) => {
  try {
    if (
      !farmData.farm_id ||
      !Array.isArray(fdoAssignedFarmId) ||
      !fdoAssignedFarmId.some(farm => farm.farm_id === farmData.farm_id)
    ) {
      const error = new Error('Farm is not assigned to this FDO');
      throw error;
    }

    if (farmData.fdo_emp_id !== fdoEmpId) {
      throw new Error('Employee Id is not associated with this FDO');
    }
 
    // Check for duplicate farm_id
    const existingFarm = await FarmDetails.findOne({
      where: { farm_id: farmData.farm_id }
    });

    if (existingFarm) {
      throw new Error('Farm is already Registered');
    }

    // Validate required fields
    const requiredFields = [
      'fdo_emp_id', 'farm_id', 'farmer_contact_number', 'farm_name', 'procurement_model',
      'salutation', 'farmer_name', 'gender', 'date_of_birth', 'latitude',
      'longitude', 'address_line1', 'landmark', 'pin_code', 'village_city',
      'tehsil', 'district', 'fdo_name', 'fdo_phone_number', 'inseminator_name',
      'inseminator_contact_number', 'veterinarian_name', 'veterinarian_contact_number'
    ];

    for (const field of requiredFields) {
      if (!farmData[field] || farmData[field].toString().trim() === '') {
        throw new Error(`${field} is required`);
      }
    }

    // Validation for specific fields
    const validFarmStatuses = ['Active', 'Inactive', 'Pipeline'];
    const validProcurementModels = ['A', 'B', 'C', 'D'];
    const validSalutations = ['Mr.', 'Mrs.', 'Smt.', 'Miss'];
    const validGenders = ['Male', 'Female', 'Other'];

    if (farmData.farm_status && !validFarmStatuses.includes(farmData.farm_status)) {
      throw new Error('Invalid farm status');
    }
    
    if (!validProcurementModels.includes(farmData.procurement_model)) {
      throw new Error('Invalid procurement model');
    }
    
    if (!validSalutations.includes(farmData.salutation)) {
      throw new Error('Invalid salutation');
    }
    
    if (!validGenders.includes(farmData.gender)) {
      throw new Error('Invalid gender');
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(farmData.farmer_contact_number)) {
      throw new Error('Invalid farmer contact number format');
    }
    
    if (farmData.alternate_phone_number && !phoneRegex.test(farmData.alternate_phone_number)) {
      throw new Error('Invalid alternate phone number format');
    }
    
    if (!phoneRegex.test(farmData.fdo_phone_number)) {
      throw new Error('Invalid FDO phone number format');
    }
    
    if (!phoneRegex.test(farmData.inseminator_contact_number)) {
      throw new Error('Invalid inseminator contact number format');
    }
    
    if (!phoneRegex.test(farmData.veterinarian_contact_number)) {
      throw new Error('Invalid veterinarian contact number format');
    }

    const pinCodeRegex = /^\d{6}$/;
    if (!pinCodeRegex.test(farmData.pin_code)) {
      throw new Error('Invalid pin code format');
    }

    if (farmData.latitude < -90 || farmData.latitude > 90) {
      throw new Error('Invalid latitude value');
    }
    
    if (farmData.longitude < -180 || farmData.longitude > 180) {
      throw new Error('Invalid longitude value');
    }

    // Check if farm_id is assigned to this fdo_emp_id
    const fdoAccount = await FdoAccount.findOne({
      where: { emp_id: farmData.fdo_emp_id }
    });

    if (!fdoAccount) {
      throw new Error('FDO employee ID not found');
    }

    let assignedFarmIds = fdoAccount.assigned_farm_id || [];
    
    // Find the specific farm_id and Update is_new to 0 for the specific farm_id
    const farmIndex = assignedFarmIds.findIndex(farm => farm.farm_id === farmData.farm_id);  
    if (farmIndex === -1) {
      throw new Error('This farm_id is not assigned to this FDO');
    }
    const newFarm = await FarmDetails.create(farmData);    
    assignedFarmIds[farmIndex].is_new = 0;    
    await FdoAccount.update(
      { assigned_farm_id: assignedFarmIds },
      { where: { emp_id: farmData.fdo_emp_id } }
    );
    
    // Return without timestamps
    const { createdAt, updatedAt, ...farmDetails } = newFarm.toJSON();
    return farmDetails;
    
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const getFarmDetailsByFarmId = async (farmId, fdoAssignedFarmId) => {
  try {
        if (
          !farmId ||
          !Array.isArray(fdoAssignedFarmId) ||
          !fdoAssignedFarmId.some(farm => farm.farm_id === farmId)
        ) {
          const error = new Error('Farm is not assigned to this FDO');
          throw error;
        }
    
        const farmDetails = await FarmDetails.findOne({
          where: { farm_id: farmId }
        });

        if (!farmDetails) {
          throw new Error('Farm details not found for the given farm ID');
        }

        const farmData = farmDetails.toJSON();
    
    const formatDateOfBirth = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const formatToIST = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    
    const formattedResponse = {
      "Organizational Information": {
        farm_status: farmData.farm_status
      },
      "Farm Information": {
        farm_id: farmData.farm_id,
        farmer_contact_number: farmData.farmer_contact_number,
        alternate_phone_number: farmData.alternate_phone_number,
        farm_name: farmData.farm_name,
        procurement_model: farmData.procurement_model
      },
      "Farmer Profile": {
        salutation: farmData.salutation,
        farmer_name: farmData.farmer_name,
        father_parent_name: farmData.father_parent_name,
        gender: farmData.gender,
        date_of_birth: formatDateOfBirth(farmData.date_of_birth)
      },
      "Address and Location": {
        latitude: farmData.latitude,
        longitude: farmData.longitude,
        address_line1: farmData.address_line1,
        address_line2: farmData.address_line2,
        landmark: farmData.landmark,
        pin_code: farmData.pin_code,
        village_city: farmData.village_city,
        tehsil: farmData.tehsil,
        district: farmData.district,
        country: farmData.country,
        state: farmData.state
      },
      "Service Personnel Information": {
        fdo_name: farmData.fdo_name,
        fdo_emp_id: farmData.fdo_emp_id,
        fdo_phone_number: farmData.fdo_phone_number,
        inseminator_name: farmData.inseminator_name,
        inseminator_contact_number: farmData.inseminator_contact_number,
        veterinarian_name: farmData.veterinarian_name,
        veterinarian_contact_number: farmData.veterinarian_contact_number
      },
      "Timestamps": {
        createdAt: formatToIST(farmData.createdAt),
        updatedAt: formatToIST(farmData.updatedAt)
      }
    };

    return formattedResponse;
    
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const updateFarmDetails = async (farm_id, fdoAssignedFarmId, updateData) => {
    try {
         if (
            !farm_id ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === farm_id)
        ) {
            const error = new Error('Given Farm Id is not assigned to this FDO');
            error.statusCode = 400;
            throw error;
        }

        const assignedFarm = fdoAssignedFarmId.find(farm => farm.farm_id === farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            const error = new Error('Farm is not registered');
            error.statusCode = 400;
            throw error;
        }
        
        const farmRecord = await FarmDetails.findOne({ where: { farm_id } });

        if (!farmRecord) {
            throw new Error('Farm not found');
        }

        const updateFields = {};
        if (updateData.inseminator_contact_number !== undefined) {
            updateFields.inseminator_contact_number = updateData.inseminator_contact_number;
        }
        if (updateData.veterinarian_contact_number !== undefined) {
            updateFields.veterinarian_contact_number = updateData.veterinarian_contact_number;
        }

        await FarmDetails.update(updateFields, { where: { farm_id } });

        return await FarmDetails.findOne({ where: { farm_id } });
    } catch (error) {
        throw error;
    }
};

// Get all farm animals under FDO's assigned farms
const getAllFarmAnimalsUnderFdo = async (fdoAssignedFarmId) => {
    try {
        if (!Array.isArray(fdoAssignedFarmId) || fdoAssignedFarmId.length === 0) {
            const error = new Error('No farms assigned to this FDO');
            error.statusCode = 400;
            throw error;
        }

        const registeredFarms = fdoAssignedFarmId.filter(farm => farm.is_new === 0);
        
        if (registeredFarms.length === 0) {
            const error = new Error('All assigned farm id are not registered for this fdo');
            error.statusCode = 400;
            throw error;
        }

        const registeredFarmIds = registeredFarms.map(farm => farm.farm_id);

        const animals = await FarmAnimal.findAll({
            where: {
                farm_id: registeredFarmIds,
                is_animal: 1
            },
            include: [{
                model: FarmDetails,
                as: 'farm',
                attributes: ['farm_name']
            }],
            attributes: [
                'id',
                'farm_id',
                'registration_id',
                'age',
                'lactation_status',
                'breeding_status',
                'born_status'
            ]
        });

        if (animals.length === 0) {
            const error = new Error('No animal registered yet in this farm');
            error.statusCode = 404;
            throw error;
        }

        const formattedAnimals = animals.map(animal => ({
            animal_id: animal.id,
            farm_id: animal.farm_id,
            registration_id: animal.registration_id,
            age: animal.age,
            farm_name: animal.farm?.farm_name || null,
            lactation_status: animal.lactation_status,
            breeding_status: animal.breeding_status,
            life_status: animal.born_status
        }));

        return formattedAnimals;
    } catch (error) {
        throw error;
    }
};

module.exports = {
  createFarmDetails,
  getFarmDetailsByFarmId,
  updateFarmDetails,
  getAllFarmAnimalsUnderFdo
};