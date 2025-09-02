const jwt = require('jsonwebtoken');
const FdoAccount = require('../models/fdo/FdoAccounts');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

exports.authenticateFdoToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if it's an FDO token
    if (decoded.userType !== 'fdo') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if FDO is still logged in
    const fdoAccount = await FdoAccount.findOne({
      where: {
        id: decoded.fdoId,
        is_login: true
      }
    });

    if (!fdoAccount) {
      return res.status(401).json({
        success: false,
        message: 'FDO is not logged in'
      });
    }

    // Add decoded token data to request object
    req.fdo = {
      fdoId: decoded.fdoId,
      empId: fdoAccount.emp_id,
      fdoName: decoded.fdoName,
      phone: decoded.phone,
      username: decoded.username,
      assignedFarmIds: fdoAccount.assigned_farm_id
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};