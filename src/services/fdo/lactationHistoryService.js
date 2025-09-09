const CalvingHistory = require('../../models/fdo/CalvingHistory');
const PregnancyHistory = require('../../models/fdo/PregnancyHistory');
const InseminationHistory = require('../../models/fdo/InseminationHistory');
const { Op } = require('sequelize');

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
      if (calving.is_current) {
        if (calving.calving_date) {
          const currentDate = new Date();
          const calvingDate = new Date(calving.calving_date);
          const timeDiff = currentDate.getTime() - calvingDate.getTime();
          daysInMilk = Math.floor(timeDiff / (1000 * 3600 * 24));
        }
      } else {
        daysInMilk = calving.previous_milk_days;
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

const getLactationHistoryDetailsByCalvingId = async (calvingId) => {
try {
    // Fetch calving record
    const calvingRecord = await CalvingHistory.findByPk(calvingId);
    
    if (!calvingRecord) {
      const error = new Error('Calving record not found');
      error.statusCode = 404;
      throw error;
    }

    // Fetch all insemination and pregnancy records for this calving
    const [inseminationRecords, pregnancyRecords] = await Promise.all([
      InseminationHistory.findAll({
        where: { calving_id: calvingId },
        order: [['insemination_date', 'DESC']]
      }),
      PregnancyHistory.findAll({
        where: { calving_id: calvingId },
        order: [['pd_check_date', 'DESC']]
      })
    ]);

    // Get latest pregnancy record for end milk date
    const latestPregnancyRecord = pregnancyRecords.length > 0 ? pregnancyRecords[0] : null;

    // Calculate end milk date
    let endMilkDate = null;
    let dryOffDate = null;
    if (latestPregnancyRecord) {
      if (latestPregnancyRecord.dry_off_date) {
        endMilkDate = latestPregnancyRecord.dry_off_date;
        dryOffDate = latestPregnancyRecord.dry_off_date;
      } else if (latestPregnancyRecord.estimated_dry_off_date) {
        endMilkDate = latestPregnancyRecord.estimated_dry_off_date;
        dryOffDate = latestPregnancyRecord.estimated_dry_off_date;
      }
    }

    // Calculate days in milk
    let daysInMilk = null;
    if (calvingRecord.is_current) {
      if (calvingRecord.calving_date) {
        const currentDate = new Date();
        const calvingDate = new Date(calvingRecord.calving_date);
        const timeDiff = currentDate.getTime() - calvingDate.getTime();
        daysInMilk = Math.floor(timeDiff / (1000 * 3600 * 24));
      }
    } else {
      daysInMilk = calvingRecord.previous_milk_days;
    }

    // Create events timeline with specific flow
    const events = [];
    
    if (calvingRecord.lactation_number > 0) {
      events.push({
        count: 1,
        name: 'calving',
        type: calvingRecord.calving_type || 'natural',
        date: calvingRecord.calving_date,
        outcome: `${calvingRecord.total_calves} calves`
      });
    }

    // Count 2: Always show first insemination
    if (inseminationRecords.length > 0) {
      const firstInsemination = inseminationRecords[inseminationRecords.length - 1]; // Oldest first
      const correspondingPregnancy = pregnancyRecords.find(p => 
        p.insemination_id === firstInsemination.id
      ) || pregnancyRecords.find(p => 
        new Date(p.pd_check_date) >= new Date(firstInsemination.insemination_date)
      );

      events.push({
        count: 2,
        name: 'insemination',
        type: firstInsemination.insemination_type,
        date: firstInsemination.insemination_date,
      });
    }

    // Collect all remaining events after first insemination
    const remainingEvents = [];
    let eventCount = 3;

    // Get all events after first insemination date
    const firstInseminationDate = inseminationRecords.length > 0 
      ? new Date(inseminationRecords[inseminationRecords.length - 1].insemination_date) 
      : null;

    if (firstInseminationDate) {
      // Add remaining insemination events (excluding the first one)
      inseminationRecords.slice(0, -1).forEach(insemination => {
        remainingEvents.push({
          date: insemination.insemination_date,
          name: 'insemination',
          type: insemination.insemination_type
        });
      });

      // Add all pregnancy check events after first insemination
      pregnancyRecords.forEach(pregnancy => {
        if (new Date(pregnancy.pd_check_date) > firstInseminationDate) {
          remainingEvents.push({
            date: pregnancy.pd_check_date,
            name: 'pregnancy check',
            type: 'PD Check',
            pregnancy_result: pregnancy.pregnancy_result,
            prev_insemination_outcome: pregnancy.insemination_outcome
          });
        }
      });

      // Sort remaining events by date (oldest first - chronological order)
      remainingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Add remaining events with sequential count
      remainingEvents.forEach(event => {
        events.push({
          count: eventCount++,
          ...event
        });
      });
    }

    // Remove the old formattedEvents code since we're building events directly above
    const formattedEvents = events;

    // Get insemination count (latest insemination record)
    const inseminationCount = inseminationRecords.length > 0 ? inseminationRecords[0].insemination_count : 0;

    // Parse calf details from calves_gender_status JSON
    let calfDetails = [];
    if (calvingRecord.calves_gender_status) {
      try {
        const calvesData = typeof calvingRecord.calves_gender_status === 'string' 
          ? JSON.parse(calvingRecord.calves_gender_status) 
          : calvingRecord.calves_gender_status;
        
        if (Array.isArray(calvesData)) {
          calfDetails = calvesData.map((calf, index) => ({
            count: index + 1,
            calf_id: calf.calf_id || null,
            gender: calf.gender || 'unknown',
            status: calf.status || 'alive'
          }));
        }
      } catch (error) {
        console.error('Error parsing calves_gender_status:', error);
      }
    }

    // Prepare response
    const response = {
      lactation_number: calvingRecord.lactation_number,
      parity_number: calvingRecord.parity_number,
      start_milk_date: calvingRecord.start_milk_date,
      end_milk_date: endMilkDate,
      days_in_milk: daysInMilk,
      insemination_count: inseminationCount,
      calving_date: calvingRecord.calving_date,
      number_of_calves: calvingRecord.total_calves,
      events_details: formattedEvents,
      calving_summary: {
        date: calvingRecord.calving_date,
        no_of_calves: calvingRecord.total_calves,
        calf_details: calfDetails
      },
      lactation_summary: {
        days_in_milk: daysInMilk,
        dry_off_date: dryOffDate
      }
    };

    return response;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new Error(`Error fetching lactation details: ${error.message}`);
  }
};

module.exports = {
  getLactationHistoryByAnimalId,
  getLactationHistoryDetailsByCalvingId
};