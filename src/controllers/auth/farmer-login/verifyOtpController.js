const verifyOtpService = require('../../../services/auth/farmer-login/verifyOtpService');

exports.verifyOTP = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    // Basic validation
    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Temp token and OTP are required'
      });
    }

    const result = await verifyOtpService.verifyOTP(tempToken, otp);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        authToken: result.authToken,
        farmer: result.farmer
      }
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};