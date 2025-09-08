const CalvingHistory = require('../../models/fdo/CalvingHistory');
const PregnancyHistory = require('../../models/fdo/PregnancyHistory');
const InseminationHistory = require('../../models/fdo/InseminationHistory');

const getLactationHistoryByAnimalId = async (animalId) => {
  try {
    // Fetch all calving records for the animal
    const calvingRecords = await CalvingHistory.findAll({
      where: { animal_id: animalId },
      order: [['lactation_number', 'ASC']]
    });

    if (!calvingRecords || calvingRecords.length === 0) {
      const error = new Error('No lactation history found for this animal');
      error.statusCode = 404;
      throw error;
    }

    const lactationHistory = [];

    for (const calving of calvingRecords) {
      // Get pregnancy history for end milk date
      const pregnancyRecord = await PregnancyHistory.findOne({
        where: { calving_id: calving.id },
        order: [['createdAt', 'DESC']]
      });

      // Get insemination history for last insemination and count
      const inseminationRecords = await InseminationHistory.findAll({
        where: { calving_id: calving.id },
        order: [['insemination_date', 'DESC']]
      });

     // Calculate end milk date
      let endMilkDate = null;
      if (pregnancyRecord) {
        if (pregnancyRecord.dry_off_date) {
          endMilkDate = pregnancyRecord.dry_off_date;
        } else if (pregnancyRecord.estimated_dry_off_date) {
          endMilkDate = pregnancyRecord.estimated_dry_off_date;
        }
      }

      // Calculate days in milk
      let daysInMilk = null;
      if (calving.calving_date) {
        const currentDate = new Date();
        const calvingDate = new Date(calving.calving_date);
        const timeDiff = currentDate.getTime() - calvingDate.getTime();
        daysInMilk = Math.floor(timeDiff / (1000 * 3600 * 24));
      }

      // Get last insemination date and insemination count
      const lastInsemination = inseminationRecords.length > 0 ? inseminationRecords[0].insemination_date : null;
      const inseminationCount = inseminationRecords.length > 0 ? inseminationRecords[0].insemination_count : 0;

      // Determine status
      const status = calving.is_current ? 'current' : 'previous';

      lactationHistory.push({
        calving_id: calving.id,
        animal_id: calving.animal_id,
        lactation_number: calving.lactation_number,
        parity_number: calving.parity_number,
        start_milk_date: calving.start_milk_date,
        end_milk_date: endMilkDate,
        days_in_milk: daysInMilk,
        last_insemination: lastInsemination,
        insemination_count: inseminationCount,
        calving_date: calving.calving_date,
        number_of_calves: calving.total_calves,
        status: status
      });
    }

    return lactationHistory;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getLactationHistoryByAnimalId
};