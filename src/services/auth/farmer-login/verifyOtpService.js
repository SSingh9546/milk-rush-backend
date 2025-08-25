const FarmerData = require('../../../models/farmer/FarmerData');
const LoggedInFarmer = require('../../../models/auth/LoggedInFarmer');
const SmsLog = require('../../../models/auth/SmsLog');
const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '60d';

exports.verifyOTP = async (tempToken, otp) => {
  try {
    //Finding SMS log entry
    const smsLog = await SmsLog.findOne({
      where: {
        temp_token: tempToken,
        otp: otp,
        is_used: false
      },
      include: [{
        model: LoggedInFarmer,
        as: 'loggedInFarmer',
        include: [{
          model: FarmerData,
          as: 'farmerData'
        }]
      }]
    });

    if (!smsLog) {
      throw new Error('Invalid or expired OTP');
    }

    //Checking if OTP is expired
    const otpAge = Date.now() - new Date(smsLog.createdAt).getTime();
    const twoMinutes = 2 * 60 * 1000; // 2 min in milliseconds
    
    if (otpAge > twoMinutes) {
      throw new Error('OTP has expired');
    }

    //Updating logged_in_farmers table
    await LoggedInFarmer.update({
      is_verified: true,
      last_login: new Date()
    }, {
      where: { id: smsLog.farmer_id }
    });

    //Updating sms_logs table
    await SmsLog.update({
      is_used: true
    }, {
      where: { id: smsLog.id }
    });

    //Generateing JWT auth token
    const tokenPayload = {
      farmerId: smsLog.loggedInFarmer.id,
      farmId: smsLog.loggedInFarmer.farm_id,
      phone: smsLog.loggedInFarmer.phone,
      farmerName: smsLog.loggedInFarmer.farmerData.farmer_name
    };

    const authToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRY 
    });

    return {
      success: true,
      message: 'OTP verified successfully',
      authToken: authToken,
      farmer: {
        farmId: smsLog.loggedInFarmer.farm_id,
        farmerName: smsLog.loggedInFarmer.farmerData.farmer_name,
        phone: smsLog.loggedInFarmer.phone
      }
    };

  } catch (error) {
    throw new Error(error.message);
  }
};