const jwt = require('jsonwebtoken');
const LoggedInFarmer = require('../models/auth/LoggedInFarmer');

const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';

exports.authenticateFarmerToken = async (req, res, next) => {
  try {
    // Extracting token from Authorization header
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

    // Verifing JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Checking if farmer is still active
    const farmer = await LoggedInFarmer.findOne({
      where: {
        id: decoded.farmerId,
        is_active: true,
        is_verified: true
      }
    });

    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'User is not active or verified'
      });
    }

    // Adding decoded token data to request object
    req.farmer = {
      farmerId: decoded.farmerId,
      farmId: decoded.farmId,
      phone: decoded.phone,
      farmerName: decoded.farmerName
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