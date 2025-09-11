const jwt = require('jsonwebtoken');
const AdminLogin = require('../models/stake-holder/AdminLogin');

const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';

exports.authenticateAdminToken = async (req, res, next) => {
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
    if (decoded.userType !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if FDO is still logged in
    const adminLogin = await AdminLogin.findOne({
      where: {
        id: decoded.adminId,
        is_login: true
      }
    });

    if (!adminLogin) {
      return res.status(401).json({
        success: false,
        message: 'Admin is not logged in'
      });
    }

    // Add decoded token data to request object
    req.admin = {
      adminId: decoded.adminId,
      adminName: decoded.adminName,
      phone: decoded.phone,
      username: decoded.username,
    };
    next();

  } catch (error) {
    console.error('getAnimalRule error:', error);
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