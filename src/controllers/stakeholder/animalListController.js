const animalService = require('../../services/stakeholder/animalListService');

const getAnimalListWithFilters = async (req, res) => {
try {
    const filters = {
      // farm filters
      farm_ids: Array.isArray(req.body.farm_ids)
        ? req.body.farm_ids
        : req.body.farm_ids
        ? [req.body.farm_ids]
        : [],

      farm_status: Array.isArray(req.body.farm_status)
        ? req.body.farm_status
        : req.body.farm_status
        ? [req.body.farm_status]
        : [],

      state: Array.isArray(req.body.state)
        ? req.body.state
        : req.body.state
        ? [req.body.state]
        : [],

      district: Array.isArray(req.body.district)
        ? req.body.district
        : req.body.district
        ? [req.body.district]
        : [],

      // animal filters
      category: req.body.category || 'all', // default

      breeding_status: Array.isArray(req.body.breeding_status)
        ? req.body.breeding_status
        : req.body.breeding_status
        ? [req.body.breeding_status]
        : [],

      lactation_status: Array.isArray(req.body.lactation_status)
        ? req.body.lactation_status
        : req.body.lactation_status
        ? [req.body.lactation_status]
        : [],

      from_date: req.body.from_date || null,
      to_date: req.body.to_date || null
    };

    const { total_count, animals } = await animalService.getAnimalList(filters);

    return res.status(200).json({
      success: true,
      message: 'Animal details fetched successfully',
      total_count,
      data: animals
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { getAnimalListWithFilters };
