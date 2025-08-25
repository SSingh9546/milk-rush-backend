const axios = require('axios');
const crypto = require('crypto');

// Configuration
const config = {
  url: process.env.ROUTE_MOBILE_BASE_URL_HTTPS || 'https://sms6.rmlconnect.net:8443/bulksms/bulksms',
  username: process.env.ROUTE_MOBILE_USERNAME,
  password: process.env.ROUTE_MOBILE_PASSWORD,
  senderId: process.env.ROUTE_MOBILE_SENDER_ID,
  entityId: process.env.ROUTE_MOBILE_ENTITY_ID,
  templateId: process.env.ROUTE_MOBILE_TEMPID,
  otpLength: Number(process.env.OTP_LENGTH || 4),
  timeout: Number(process.env.ROUTE_MOBILE_TIMEOUT || 120000)
};

// Error codes mapping
const ERROR_CODES = {
  '1702': 'Invalid URL / missing parameter',
  '1703': 'Invalid username/password',
  '1704': 'Invalid type',
  '1705': 'Invalid message',
  '1706': 'Invalid destination',
  '1707': 'Invalid sender ID (source)',
  '1708': 'Invalid dlr',
  '1709': 'User validation failed',
  '1710': 'Internal error',
  '1715': 'Response timeout',
  '1025': 'Insufficient credit',
  '1032': 'DND reject',
  '1028': 'Spam message',
  '1051': 'Invalid template ID (tempid)',
  '1052': 'Invalid entity ID'
};

const validateConfig = () => {
  const requiredFields = ['username', 'password', 'senderId', 'entityId', 'templateId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Route Mobile configuration missing: ${missingFields.join(', ')}`);
  }
};

exports.generateOTP = (length = config.otpLength) => {
  const bytes = crypto.randomBytes(length);
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += (bytes[i] % 10).toString();
  }
  
  return otp;
};

exports.generateTempToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const buildOtpMessage = (otp) => {
  return `Dear customer, your login OTP for ALTQUBE Wealth Hub APP is ${otp} and valid till 2 minutes. Do not share this with anyone.`;
};

const parseResponse = (responseData) => {
  const text = String(responseData).trim();
  const firstResponse = text.split(',')[0] || '';
  const [code, destinationAndMessageId] = firstResponse.split('|');
  const [destination, messageId] = destinationAndMessageId ? destinationAndMessageId.split(':') : [null, null];
  
  if (code === '1701') {
    return {
      messageId: messageId || 'N/A',
      status: 'sent',
      destination: destination
    };
  }
  
  const errorMessage = ERROR_CODES[code] || 'Unknown error';
  throw new Error(`Route Mobile SMS failed: ${code} (${errorMessage})`);
};

const buildSmsParams = (phoneNumber, message) => {
  return new URLSearchParams({
    username: config.username,
    password: config.password,
    type: '0',                    
    dlr: '1',                     
    destination: phoneNumber, 
    source: config.senderId,       
    message: message,              
    entityid: config.entityId,     
    tempid: config.templateId 
  });
};

exports.sendOTP = async (phoneNumber, otp) => {
  try {
    const message = buildOtpMessage(otp);
    const response = await exports.sendSMS(phoneNumber, message);
    
    return {
      success: true,
      messageId: response.messageId,
      destination: response.destination,
      actualMessage: message,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

exports.sendSMS = async (phoneNumber, message) => {
  validateConfig();
  
  try {
    const params = buildSmsParams(phoneNumber, message);
    const url = `${config.url}?${params.toString()}`;
    
    const { data } = await axios.get(url, { 
      timeout: config.timeout 
    });
    
    return parseResponse(data);
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('SMS request timeout');
    }
    
    if (error.response) {
      throw new Error(`SMS API error: ${error.response.status} - ${error.response.statusText}`);
    }
    
    throw error;
  }
};