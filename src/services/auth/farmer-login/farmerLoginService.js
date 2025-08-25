const FarmerData = require('../../../models/farmer/FarmerData');
const LoggedInFarmer = require('../../../models/auth/LoggedInFarmer');
const SmsLog = require('../../../models/auth/SmsLog');
const routeMobileService = require('../../global/routeMobileService');

exports.sendLoginOTP = async (phoneNumber) => {
  try {
    // Checking if phone number exists in farmer_data
    const farmer = await FarmerData.findOne({
      where: { phone: phoneNumber }
    });
    if (!farmer) {
      throw new Error('Please enter registered phone number');
    }

    const [loggedInFarmer] = await LoggedInFarmer.upsert({
      farm_id: farmer.farm_id,
      phone: phoneNumber,
      is_verified: false,  
      is_active: true
    });

    const otp = routeMobileService.generateOTP();
    const tempToken = routeMobileService.generateTempToken();

    let smsResponse;
    let otpSentSuccessfully = false;

    try {
      smsResponse = await routeMobileService.sendOTP(phoneNumber, otp);
      otpSentSuccessfully = true;
    } catch (error) {
      smsResponse = {
        success: false,
        actualMessage: `Login OTP for MILK RUSH APP is ${otp} and failed to send`,
        error: error.message,
        messageId: null
      };
    }

    const commentLog = otpSentSuccessfully 
      ? `SUCCESS - OTP sent via Route Mobile - Message ID: ${smsResponse.messageId} - Destination: ${smsResponse.destination || phoneNumber}`
      : `FAILED - ${smsResponse.error}`;

    const smsLog = await SmsLog.create({
      farmer_id: loggedInFarmer.id,
      msg_text: smsResponse.actualMessage,
      otp: otp,
      temp_token: tempToken,
      is_used: false,
      comment_log: commentLog
    });

    // Only throw error after logging if SMS failed
    if (!otpSentSuccessfully) {
      throw new Error(`Failed to send OTP: ${smsResponse.error}`);
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      tempToken: tempToken,
      farmId: farmer.farm_id
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

exports.logout = async (farmerId) => {
  try {
    const [updatedRows] = await LoggedInFarmer.update({
      is_active: false,
      last_login: new Date()
    }, {
      where: { 
        id: farmerId,
        is_active: true
      }
    });

    if (updatedRows === 0) {
      throw new Error('User not found or already logged out');
    }

    return {
      success: true,
      message: 'Logout successful'
    };

  } catch (error) {
    throw new Error(error.message);
  }
};