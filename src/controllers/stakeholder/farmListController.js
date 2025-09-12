const farmListService = require('../../services/stakeholder/farmListService');

const getfarmListWithFilters = async (req, res) => {
  try {
    const filters = {
      // fdo_accounts filter
      is_new: typeof req.body.is_new !== 'undefined' ? req.body.is_new : null,

      // farm_details filters
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

      from_date: req.body.from_date || null,
      to_date: req.body.to_date || null
    };

    const farms = await farmListService.getFarmListData(filters);

    return res.status(200).json({
      success: true,
      message: 'Farm details fetched successfully',
      data: farms
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { getfarmListWithFilters };
