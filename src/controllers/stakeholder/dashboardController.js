const dashboardService = require('../../services/stakeholder/dashboardService');

const getDashboardCounts = async (req, res) => {
  try {
    const filters = {
      farm_ids: req.body.farm_ids || [],
      farm_status: req.body.farm_status || null,
      state: req.body.state || null,
      district: req.body.district || null,
      from_date: req.body.from_date || null,
      to_date: req.body.to_date || null
    };

    const data = await dashboardService.getDashboardCounts(filters);

    return res.status(200).json({
      success: true,
      message: 'Dashboard counts fetched successfully',
      data
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { getDashboardCounts };
