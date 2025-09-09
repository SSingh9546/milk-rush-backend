const FarmAnimals = require('../../models/fdo/FarmAnimals');
const AnimalBioDetail = require('../../models/fdo/AnimalBioDetails');
const CalvingHistory = require('../../models/fdo/CalvingHistory');
const InseminationHistory = require('../../models/fdo/InseminationHistory');
const PregnancyHistory = require('../../models/fdo/PregnancyHistory');

const farmAnimalUpdateService = {
   updateAnimalProfileInfo: async (animal_id, updateData, fdoAssignedFarmId) => {
        // Validate animal_id
        if (!animal_id) {
            const error = new Error('Animal ID is required');
            error.statusCode = 400;
            throw error;
        }
        // Simple required field validation
        const requiredFields = ['farm_id', 'animal_name', 'bcs', 'livestock_status'];
        for (const field of requiredFields) {
            if (updateData[field] === undefined || updateData[field] === "") {
            const error = new Error(`${field} is required`);
            error.statusCode = 400;
            throw error;
            }
        }

        // Check if animal exists
        const existingAnimal = await FarmAnimals.findByPk(animal_id);
        if (!existingAnimal) {
            const error = new Error('Animal not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate farm assignment
        const assignedFarm = fdoAssignedFarmId?.find(farm => farm.farm_id === updateData.farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
        const error = new Error(!assignedFarm ? 'Farm is not assigned to this FDO' : 'Farm is not registered');
        error.statusCode = 400;
        throw error;
        }

        // Validate farm_id if provided (for validation only, not update)
        if (updateData.farm_id && updateData.farm_id !== existingAnimal.farm_id) {
            const error = new Error('Given Farm ID is not associated with this animal');
            error.statusCode = 403;
            throw error;
        }

        // Prepare update fields
        const updateFields = {};
        if (updateData.animal_name) updateFields.animal_name = updateData.animal_name;
        if (updateData.bcs !== undefined) updateFields.bcs = updateData.bcs;
        if (updateData.livestock_status) updateFields.livestock_status = updateData.livestock_status;

        // Update the animal
        const [updatedRowsCount] = await FarmAnimals.update(updateFields, {
            where: { id: animal_id }
        });

        if (updatedRowsCount === 0) {
            const error = new Error('No changes made to animal data');
            error.statusCode = 400;
            throw error;
        }

        // Fetch updated animal data
        const updatedAnimal = await FarmAnimals.findByPk(animal_id);
        return updatedAnimal;
    },

    updateAnimalReproductiveInfo: async (animal_id, updateData, fdoAssignedFarmId) => {
        // Validate animal_id
        if (!animal_id) {
            const error = new Error('Animal ID is required');
            error.statusCode = 400;
            throw error;
        }

        // Simple required field validation
        const requiredFields = [
            'farm_id', 'lactation_status', 'breeding_status', 'lactation_number', 'physiological_stage', 'parity_number',
            'is_inseminated', 'insemination_date', 'insemination_time', 'insemination_type', 'insemination_done_by', 'insemination_count', 'sire_details',
            'is_pregnant', 'pd_check_date', 'pd_check_time', 'pregnancy_result', 'pregnancy_done_by', 'previous_insemination_outcome',
            'estimated_calving_date', 'estimated_dry_off_date', 'is_animal_dry', 'date_of_dry', 'pregnancy_check_notes',
            'calving_number', 'last_calving_date', 'calving_type', 'is_placenta_retained', 'total_calves_in_latest_calving',
            'days_in_milk', 'dam_type', 'dam_breed_type', 'sire_type', 'sire_breed_type', 'calf_details',
        ];

        for (const field of requiredFields) {
            if (updateData[field] === undefined || updateData[field] === "") {
                const error = new Error(`${field} is required`);
                error.statusCode = 400;
                throw error;
            }
        }

        // Check if animal reproductive info exists using farm_animal_id
        const existingAnimal = await AnimalBioDetail.findOne({ where: { farm_animal_id: animal_id } });
        if (!existingAnimal) {
            const error = new Error('Animal Reproductive Info not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate farm assignment
        const assignedFarm = fdoAssignedFarmId?.find(farm => farm.farm_id === updateData.farm_id);
        if (!assignedFarm || assignedFarm.is_new !== 0) {
            const error = new Error(!assignedFarm ? 'Farm is not assigned to this FDO' : 'Farm is not registered');
            error.statusCode = 400;
            throw error;
        }

        // Extract flags from updateData
        const {
            is_heifer_bred = 0, is_calving_new_cycle_date = 0, is_insemination_new_cycle_date = 0,
            is_pregnancy_date_changed = 0, calf_details, last_calving_date, farm_id
        } = updateData;

        // Helper function to calculate age in months
        function calculateAge(dob) {
            if (!dob) return null;
            const dobDate = new Date(dob);
            const now = new Date();
            const months = (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
            return months;
        }

        // Use transaction for consistency
        const sequelize = FarmAnimals.sequelize;
        const result = await sequelize.transaction(async (transaction) => {
            // Fields that go to FarmAnimals table
            const farmAnimalFields = ['lactation_status', 'breeding_status', 'lactation_number', 'physiological_stage', 'parity_number'];
            
            // Fields that go to AnimalBioDetail table (excluding farm animal fields)
            const bioDetailFields = requiredFields.filter(field => !farmAnimalFields.includes(field));

            // Prepare update fields for FarmAnimals table
            const farmAnimalUpdateFields = {};
            for (const field of farmAnimalFields) {
                if (updateData[field] !== undefined) {
                    farmAnimalUpdateFields[field] = updateData[field];
                }
            }

            // Update FarmAnimals table
            if (Object.keys(farmAnimalUpdateFields).length > 0) {
                const [farmAnimalUpdatedRowsCount] = await FarmAnimals.update(farmAnimalUpdateFields, {
                    where: { id: animal_id },
                    transaction
                });

                if (farmAnimalUpdatedRowsCount === 0) {
                    const error = new Error('Failed to update farm animal info');
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Prepare update fields for AnimalBioDetail table
            const bioDetailUpdateFields = {};
            for (const field of bioDetailFields) {
                if (updateData[field] !== undefined) {
                    bioDetailUpdateFields[field] = updateData[field];
                }
            }

            // Update AnimalBioDetail table
            if (Object.keys(bioDetailUpdateFields).length > 0) {
                const [bioDetailUpdatedRowsCount] = await AnimalBioDetail.update(bioDetailUpdateFields, {
                    where: { farm_animal_id: animal_id },
                    transaction
                });

                if (bioDetailUpdatedRowsCount === 0) {
                    const error = new Error('Failed to update animal bio details');
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Initialize response data
            let createdCalving = null;
            let heiferCalving = null;
            let createdInsemination = null;
            let createdPregnancy = null;
            const calves = [];
            const calvesCreatedMeta = [];

            // CALF CREATION - only when is_calving_new_cycle_date is 1
            if (is_calving_new_cycle_date === 1 && Array.isArray(calf_details) && calf_details.length && last_calving_date) {
                const calfAge = calculateAge(last_calving_date);
                const is_animal_calf = calfAge !== null && calfAge <= 6 ? 1 : 0;
                const is_animal_adult = calfAge !== null && calfAge > 6 ? 1 : 0;

                for (const { count, gender, born_status } of calf_details) {
                    if (count > 0) {
                        for (let i = 0; i < count; i++) {
                            const calfRow = await FarmAnimals.create({
                                farm_id,
                                dam_id: animal_id,
                                gender,
                                dob: last_calving_date,
                                age: calfAge,
                                born_status,
                                is_calf: is_animal_calf,
                                is_adult:is_animal_adult,
                                is_animal: 0
                            }, { transaction });
                            calves.push(calfRow);
                            calvesCreatedMeta.push({ calf_id: calfRow.id, gender, born_status });
                        }
                    }
                }
            }

            // HEIFER BRED → create null calving row
            if (is_heifer_bred === 1) {
                await CalvingHistory.update(
                    { is_current: false },
                    { 
                        where: { animal_id: animal_id, is_current: true },
                        transaction 
                    }
                );

                heiferCalving = await CalvingHistory.create({
                    animal_id: animal_id,
                    farm_id: farm_id,
                    lactation_number: 0,
                    parity_number: 0,
                    calving_date: null,
                    calving_type: null,
                    total_calves: 0,
                    calves_gender_status: null,
                    start_milk_date: null,
                    is_current: true
                }, { transaction });
            }

            // CALVING HISTORY
            if (is_calving_new_cycle_date === 1) {
                if (!updateData.last_calving_date) {
                    const e = new Error('last_calving_date is required');
                    e.statusCode = 400;
                    throw e;
                }

                // Get previous calving record before marking current ones as false
                const previousCalving = await CalvingHistory.findOne({
                    where: { 
                        animal_id: animal_id, 
                        is_current: true 
                    },
                    order: [['createdAt', 'DESC']],
                    transaction
                });

                // Calculate and update previous_milk_days in the previous lactation
                if (previousCalving && previousCalving.lactation_number > 0 && previousCalving.calving_date) {
                    const currentCalvingDate = new Date(updateData.last_calving_date);
                    const previousCalvingDate = new Date(previousCalving.calving_date);
                    
                    // Calculate days difference
                    const timeDifference = currentCalvingDate.getTime() - previousCalvingDate.getTime();
                    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
                    let previousMilkDays = daysDifference - 60;
                    
                    // Ensure it's not negative
                    if (previousMilkDays < 0) {
                        previousMilkDays = 0;
                    }

                    // Update the previous calving record with calculated milk days
                    await CalvingHistory.update(
                        { previous_milk_days: previousMilkDays },
                        { 
                            where: { id: previousCalving.id },
                            transaction 
                        }
                    );
                }
           
                // Mark all existing calving records false
                await CalvingHistory.update(
                    { is_current: false },
                    { 
                        where: { animal_id: animal_id, is_current: true },
                        transaction 
                    }
                );

                createdCalving = await CalvingHistory.create({
                    animal_id: animal_id,
                    farm_id: farm_id,
                    lactation_number: updateData.lactation_number ?? null,
                    parity_number: updateData.parity_number ?? null,
                    calving_date: updateData.last_calving_date,
                    calving_type: updateData.calving_type ?? null,
                    total_calves: calvesCreatedMeta.length,
                    calves_gender_status: calvesCreatedMeta.length ? calvesCreatedMeta : null,
                    start_milk_date: updateData.last_calving_date,
                    previous_milk_days: 0,
                    is_current: true
                }, { transaction });
            }

            // Helper to get current calving
            const getCurrentCalvingOrThrow = async () => {
                const current = await CalvingHistory.findOne({
                    where: { animal_id: animal_id, is_current: true },
                    order: [['createdAt', 'DESC']],
                    transaction
                });
                if (!current) {
                    const e = new Error('Current calving record not found. Either create new calving cycle or ensure animal is heifer.');
                    e.statusCode = 400;
                    throw e;
                }
                return current;
            };

            // INSEMINATION HISTORY
            if (is_insemination_new_cycle_date === 1) {
                const current = await getCurrentCalvingOrThrow();

                if (!updateData.insemination_date) {
                    const e = new Error('insemination_date is required');
                    e.statusCode = 400;
                    throw e;
                }

                // Mark all existing insemination records false
                await InseminationHistory.update(
                    { is_current: false },
                    { 
                        where: { calving_id: current.id, is_current: true },
                        transaction 
                    }
                );

                createdInsemination = await InseminationHistory.create({
                    calving_id: current.id,
                    insemination_date: updateData.insemination_date,
                    insemination_time: updateData.insemination_time ?? null,
                    insemination_type: updateData.insemination_type ?? null,
                    done_by: updateData.insemination_done_by ?? null,
                    insemination_count: updateData.insemination_count ?? 1,
                    is_current: true
                }, { transaction });
            }

            // PREGNANCY HISTORY
            if (is_pregnancy_date_changed === 1) {
                const current = await getCurrentCalvingOrThrow();
                if (!updateData.pd_check_date) {
                    const e = new Error('pd_check_date is required');
                    e.statusCode = 400;
                    throw e;
                }

                // Find the current insemination record for this calving
                const currentInsemination = await InseminationHistory.findOne({
                    where: { calving_id: current.id, is_current: true },
                    order: [['createdAt', 'DESC']],
                    transaction
                });

                const inseminationId = currentInsemination ? currentInsemination.id : null;

                createdPregnancy = await PregnancyHistory.create({
                    calving_id: current.id,
                    insemination_id: inseminationId,
                    pd_check_date: updateData.pd_check_date,
                    pd_check_time: updateData.pd_check_time ?? null,
                    pregnancy_result: updateData.pregnancy_result ?? null,
                    done_by: updateData.pregnancy_done_by ?? null,
                    insemination_outcome: updateData.previous_insemination_outcome ?? null,
                    dry_off_date: updateData.date_of_dry ?? null,
                    estimated_dry_off_date: updateData.estimated_dry_off_date ?? null
                }, { transaction });
            }

            // Fetch updated records within transaction
            const updatedAnimal = await AnimalBioDetail.findOne({ 
                where: { farm_animal_id: animal_id },
                transaction
            });

            const updatedFarmAnimal = await FarmAnimals.findByPk(animal_id, { transaction });

            return {
                updatedAnimal,
                updatedFarmAnimal,
                calves,
                createdCalving,
                heiferCalving,
                createdInsemination,
                createdPregnancy
            };
        });

        // Prepare final response with history data
        const response = {
            animal_bio_details: result.updatedAnimal?.dataValues || null,
            farm_animal_details: {
                lactation_status: result.updatedFarmAnimal?.lactation_status,
                breeding_status: result.updatedFarmAnimal?.breeding_status,
                lactation_number: result.updatedFarmAnimal?.lactation_number,
                physiological_stage: result.updatedFarmAnimal?.physiological_stage,
                parity_number: result.updatedFarmAnimal?.parity_number
            },
            calves: result.calves.length ? result.calves : null,
            history_created: {
                calving: result.createdCalving || result.heiferCalving || null,
                insemination: result.createdInsemination || null,
                pregnancy: result.createdPregnancy || null
            }
        };

        return response;
    }
};

module.exports = farmAnimalUpdateService;