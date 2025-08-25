const authService = require('../../../services/auth/farmer-login/farmerLoginService');

exports.farmerLogin = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    const result = await authService.sendLoginOTP(phoneNumber);

    return res.status(200).json({
      success: true,
      message: result.message,
      tempToken: result.tempToken,
      farmerData: {
        farmId: result.farmId,
        phone: phoneNumber
      }
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const result = await authService.logout(req.farmer.farmerId);

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};