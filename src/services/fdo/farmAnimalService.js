const FarmDetail = require('../../models/fdo/FarmDetails');
const FarmAnimal = require('../../models/fdo/FarmAnimals');
const AnimalBioDetail = require('../../models/fdo/AnimalBioDetails');
const AnimalRule = require('../../models/fdo/AnimalRules');
const { sequelize } = require('../../shared/config/sequelize-db');

const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    const diffTime = Math.abs(today - birthDate);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
};

const registerAnimal = async (animalData, fdoAssignedFarmId) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            // Farm animals table fields
            farm_id,
            dam_id,
            registration_id,
            origin,
            pedometer_id,
            dam_type,
            dam_breed_type,
            sire_id,
            sire_type,
            sire_breed_type,
            animal_name,
            type_of_birth,
            gender,
            dob,
            species,
            breed,
            bcs,
            livestock_status,
            lactation_status,
            breeding_status,
            lactation_number,
            physiological_stage,
            parity_number,
            born_status,
            
            // Animal bio details fields
            is_inseminated,
            is_pregnant,
            calving_number,
            insemination_date,
            insemination_time,
            insemination_count,
            sire_details,
            pd_check_date,
            pd_check_time,
            pregnancy_result,
            done_by,
            previous_insemination_outcome,
            estimated_calving_date,
            estimated_dry_off_date,
            is_animal_dry,
            date_of_dry,
            pregnancy_check_notes,
            last_calving_date,
            calving_type,
            is_placenta_retained,
            total_calves_in_latest_calving,
            days_in_milk,
            
            // Calf details
            calf_details
        } = animalData;

        // 1. Check that farm_id is assigned to the FDO
        if (
            !fdoAssignedFarmId ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === farm_id)
        ) {
            throw new Error('Farm is not assigned to this FDO');
        }

        // 2. Check that farm_id is assigned with is_new = 0 (registered)
        const assignedFarm = fdoAssignedFarmId.find(farm => farm.farm_id === farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            throw new Error('Farm is not registered');
        }

        // 3. Check if registration_id already exists
        if (registration_id) {
            const existingAnimal = await FarmAnimal.findOne({
                where: { registration_id: registration_id }
            });

            if (existingAnimal) {
                throw new Error('Animal is already registered');
            }
        }

        // Calculate age and set is_calf
        const age = calculateAge(dob);
        const is_calf = age !== null && age <= 6 ? 1 : 0;
        
        // Step 1: Create main farm animal record
        const mainAnimal = await FarmAnimal.create({
            farm_id,
            registration_id,
            dam_id,
            origin,
            pedometer_id,
            dam_type,
            dam_breed_type,
            sire_id,
            sire_type,
            sire_breed_type,
            animal_name,
            type_of_birth,
            gender,
            dob,
            age: age,
            species,
            breed,
            bcs,
            livestock_status,
            lactation_status,
            breeding_status,
            lactation_number,
            physiological_stage,
            parity_number,
            born_status,
            is_calf: is_calf,
            is_animal: 1
        }, { transaction });

        let bioDetails = null;
        
        // Step 2: Create bio details if not a calf
        if (is_calf === 0) {
            const bioDetailsData = {
                farm_animal_id: mainAnimal.id,
                is_inseminated: is_inseminated || false,
                is_pregnant: is_pregnant || false,
                calving_number: calving_number || 0,
                insemination_date: insemination_date || null,
                insemination_time: insemination_time || null,
                insemination_count: insemination_count || 0,
                sire_details: sire_details || null,
                pd_check_date: pd_check_date || null,
                pd_check_time: pd_check_time || null,
                pregnancy_result: pregnancy_result || '',
                done_by: done_by || '',
                previous_insemination_outcome: previous_insemination_outcome || null,
                estimated_calving_date: estimated_calving_date || null,
                estimated_dry_off_date: estimated_dry_off_date || null,
                is_animal_dry: is_animal_dry || false,
                date_of_dry: date_of_dry || null,
                pregnancy_check_notes: pregnancy_check_notes || '',
                last_calving_date: last_calving_date || null,
                calving_type: calving_type || '',
                is_placenta_retained: is_placenta_retained || false,
                total_calves_in_latest_calving: total_calves_in_latest_calving || 0,
                days_in_milk: days_in_milk || null
            };
            
            bioDetails = await AnimalBioDetail.create(bioDetailsData, { transaction });
        }

        let calves = [];
        const calfAge = calculateAge(last_calving_date);
        const is_animal_calf = calfAge !== null && calfAge <= 6 ? 1 : 0;
        // Step 3: Create calf records if calf_details provided
        if (calf_details && Array.isArray(calf_details) && calf_details.length > 0) {
            for (const calfDetail of calf_details) {
                const { count, gender, born_status } = calfDetail;
                
                if (count && count > 0) {
                    for (let i = 0; i < count; i++) {
                        const calfRecord = await FarmAnimal.create({
                            farm_id: farm_id,
                            dam_id: mainAnimal.id,
                            gender: gender,
                            dob:last_calving_date,
                            age: calfAge,
                            born_status: born_status,
                            is_calf: is_animal_calf,
                            is_animal: 0
                        }, { transaction });
                        
                        calves.push(calfRecord);
                    }
                }
            }
        }

        await transaction.commit();

        return {
            mainAnimal,
            bioDetails,
            calves: calves.length > 0 ? calves : null
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getAnimalsByFarmId = async (farm_id, fdoAssignedFarmId) => {
    try {
        if (
            !farm_id ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === farm_id)
        ) {
            const error = new Error('Farm is not assigned to this FDO');
            error.statusCode = 400;
            throw error;
        }

        const assignedFarm = fdoAssignedFarmId.find(farm => farm.farm_id === farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            const error = new Error('Farm is not registered');
            error.statusCode = 400;
            throw error;
        }

        const animals = await FarmAnimal.findAll({
            where: {
                farm_id: farm_id,
                is_animal: 1
            },
            include: [{
                model: FarmDetail,
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

const getAnimalDetailsByAnimalId = async (animal_id, fdoAssignedFarmId) => {
    try {
        // Check if animal exists
        const animal = await FarmAnimal.findOne({
            where: { id: animal_id },
            include: [{
                model: AnimalBioDetail,
                as: 'bioDetails'
            }]
        });

        // Check if animal's farm_id is associated with this FDO
        const farm_id = animal.farm_id;
        if (
            !farm_id ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === farm_id)
        ) {
            const error = new Error('Animal is not associated with this FDO.');
            error.statusCode = 400;
            throw error;
        }

        // If animal not found
        if (!animal) {
            const error = new Error('Animal is not registered');
            error.statusCode = 404;
            throw error;
        }

        // Get calves info
        const calves = await FarmAnimal.findAll({
            where: { dam_id: animal_id },
            attributes: ['id', 'dam_id', 'gender', 'dob', 'born_status', 'is_animal']
        });

        const bioDetails = animal.bioDetails && animal.bioDetails.length > 0 ? animal.bioDetails[0] : null;

        // Format calves data
        const calvesBasicInfo = calves.map(calf => ({
            calfId: calf.id,
            damId: calf.dam_id,
            gender: calf.gender,
            dob: calf.dob,
            calveBornStatus: calf.born_status,
            registration: calf.is_animal === true ? "done" : "pending"
        }));

        const response = {
            farm_id: animal.farm_id,
            animal_id: animal.id,
            "Lactation Breeding Info": {
                lactationStatus: animal.lactation_status,
                breedingStatus: animal.breeding_status,
                lactationNumber: animal.lactation_number,
                parityNumber: animal.parity_number,
                physiologicalStage: animal.physiological_stage
            },
            "Animal Identification And Physical Info": {
                species: animal.species,
                breed: animal.breed,
                dateOfBirth: animal.dob,
                ageInMonths: animal.age,
                gender: animal.gender,
                animalName: animal.animal_name,
                livestockStatus: animal.livestock_status,
                bcs: animal.bcs
            },
            "Animal Lineage And Farm Details": {
                damId: animal.dam_id,
                sireId: animal.sire_id,
                pedometerId: animal.pedometer_id,
                typeOfBirth: animal.type_of_birth,
                origin: animal.origin,
                farmId: animal.farm_id
            },
            "ReproductiveInfo": {
                isInseminated: bioDetails ? bioDetails.is_inseminated : null,
                isPGConfirmed: bioDetails ? bioDetails.is_pregnant : null,
                howManyTimesCalved: bioDetails ? bioDetails.calving_number : null
            },
            "Insemination Info": {
                inseminationDate: bioDetails ? bioDetails.insemination_date : null,
                inseminationTime: bioDetails ? bioDetails.insemination_time : null,
                inseminationType: animal.sire_type,
                doneBy: bioDetails ? bioDetails.done_by : null,
                inseminationCount: bioDetails ? bioDetails.insemination_count : null,
                sireDetails: bioDetails ? bioDetails.sire_details : null
            },
            "Current Pregnancy Check": {
                pdCheckDate: bioDetails ? bioDetails.pd_check_date : null,
                pdCheckTime: bioDetails ? bioDetails.pd_check_time : null,
                pregnancyResult: bioDetails ? bioDetails.pregnancy_result : null,
                doneBy: bioDetails ? bioDetails.done_by : null,
                prevInseminationOutcome: bioDetails ? bioDetails.previous_insemination_outcome : null,
                estimatedCalvingDate: bioDetails ? bioDetails.estimated_calving_date : null,
                isAnimalDry: bioDetails ? bioDetails.is_animal_dry : null,
                dateOfDry: bioDetails ? bioDetails.date_of_dry : null,
                estimatedDryOffDate: bioDetails ? bioDetails.estimated_dry_off_date : null,
                pregnancyCheckNotes: bioDetails ? bioDetails.pregnancy_check_notes : null
            },
            "Recent Calving Info": {
                lastCalvingDate: bioDetails ? bioDetails.last_calving_date : null,
                calvingType: bioDetails ? bioDetails.calving_type : null,
                placentaRetained: bioDetails ? bioDetails.is_placenta_retained : null,
                daysInMilk: bioDetails ? bioDetails.days_in_milk : null,
                noOfCalvesInLatestCalving: bioDetails ? bioDetails.total_calves_in_latest_calving : null
            },
            "Additional Information": {
                damType: animal.dam_type,
                damBreedType: animal.dam_breed_type,
                sireType: animal.sire_type,
                sireBreedType: animal.sire_breed_type
            },
            "Calves Basic Info": calvesBasicInfo
        };

        return response;
    } catch (error) {
        throw error;
    }
};

const getCalfDetailsByCalfId = async (calfId, fdoAssignedFarmId) => {
    try {
        // Find calf in farm_animals table
        const calfData = await FarmAnimal.findOne({
            where: { id: calfId }
        });

        if (!calfData) {
            return null;
        }

        // Check if dam_id is null
        if (!calfData || calfData.dam_id === null) {
            const error = new Error('This is not a Calf Id');
            error.statusCode = 400;
            throw error;
        }

        // Check if calf's farm_id is associated with this FDO
        const farm_id = calfData.farm_id;
        if (
            !farm_id ||
            !Array.isArray(fdoAssignedFarmId) ||
            !fdoAssignedFarmId.some(farm => farm.farm_id === farm_id)
        ) {
            const error = new Error('Calf is not associated with this FDO.');
            error.statusCode = 400;
            throw error;
        }

        // Calculate age in months from DOB
        const currentDate = new Date();
        const dobDate = new Date(calfData.dob);
        const ageInMonths = (currentDate.getFullYear() - dobDate.getFullYear()) * 12 + 
                           (currentDate.getMonth() - dobDate.getMonth());

        let responseData = {
            calf_details: calfData.toJSON()
        };

        // Check if calf is > 6 months old
        if (ageInMonths > 6) {
            // Fetch rule = 2
            const animalRule = await AnimalRule.findOne({
                where: { id: 2 }
            });

            if (animalRule) {
                const ruleData = animalRule.toJSON();
                responseData.calf_details.lactation_status = ruleData.lactation_status;
                responseData.calf_details.breeding_status = ruleData.breeding_status;
                responseData.calf_details.physiological_stage = ruleData.physiological_stage;
                responseData.calf_details.lactation_number = ruleData.calving_number;
                responseData.calf_details.parity_number = ruleData.calving_number;
                responseData.calf_details.rule_description = ruleData.rule_description;
            }
        } else {
            // Fetch rule= 1
            const animalRule = await AnimalRule.findOne({
                where: { id: 1 }
            });

            if (animalRule) {
                const ruleData = animalRule.toJSON();
                responseData.calf_details.lactation_status = ruleData.lactation_status;
                responseData.calf_details.breeding_status = ruleData.breeding_status;
                responseData.calf_details.physiological_stage = ruleData.physiological_stage;
                responseData.calf_details.lactation_number = ruleData.calving_number;
                responseData.calf_details.parity_number = ruleData.calving_number;
                responseData.calf_details.rule_description = ruleData.rule_description;
            }
        }
        return responseData;

    } catch (error) {
        console.error('Error in getCalfDetailsById service:', error);
        throw error;
    }
};

const updateCalfById = async (calfId, updateData, fdoAssignedFarmId) => {
    try {
        // Check if calf exists
        const existingCalf = await FarmAnimal.findOne({
            where: { id: calfId }
        });
        
        // If calf not found
        if (!existingCalf) {
            return null;
        }

        // Check if calf's farm_id is associated with this FDO
        const farm_id = existingCalf.farm_id;
        const updateFarmId = updateData.farm_id;

        const isFarmAssociated = Array.isArray(fdoAssignedFarmId) && fdoAssignedFarmId.some(farm => farm.farm_id === farm_id);
        const isUpdateFarmAssociated = !updateFarmId || (Array.isArray(fdoAssignedFarmId) && fdoAssignedFarmId.some(farm => farm.farm_id === updateFarmId));

        if (!farm_id || !isFarmAssociated) {
            const error = new Error('Given Calf Id is not assigned to this FDO.');
            error.statusCode = 400;
            throw error;
        }
        if (!isUpdateFarmAssociated) {
            const error = new Error('Requested Farm_id is not associated with this FDO.');
            error.statusCode = 400;
            throw error;
        }

        // 2. Check that updateFarmId is assigned with is_new = 0 (registered)
        const assignedFarm = fdoAssignedFarmId.find(farm => farm.farm_id === updateFarmId);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            const error = new Error('Farm is not registered');
            error.statusCode = 400;
            throw error;
        }

        // Prepare update object with allowed fields
        const allowedFields = [
            'farm_id', 'origin', 'registration_id', 'pedometer_id', 'dam_type', 'dam_breed_type',
            'sire_id', 'sire_type', 'sire_breed_type', 'animal_name', 'type_of_birth',
            'species', 'breed', 'bcs', 'livestock_status', 'lactation_status', 'breeding_status',
            'lactation_number', 'physiological_stage', 'parity_number'
        ];

        const filteredUpdateData = {};
        allowedFields.forEach(field => {
            if (updateData.hasOwnProperty(field)) {
                filteredUpdateData[field] = updateData[field];
            }
        });

        // Update the calf record
        await FarmAnimal.update(filteredUpdateData, {
            where: { id: calfId }
        });

        // Update is_animal status to 1 after successful update
        await FarmAnimal.update(
            { is_animal: 1 },
            { where: { id: calfId } }
        );

        // Fetch and return updated record
        const updatedCalf = await FarmAnimal.findOne({
            where: { id: calfId }
        });

        return updatedCalf.toJSON();

    } catch (error) {
        console.error('Error in updateCalfById service:', error);
        throw error;
    }
};

module.exports = {
    registerAnimal,
    getAnimalsByFarmId,
    getAnimalDetailsByAnimalId,
    getCalfDetailsByCalfId,
    updateCalfById
};