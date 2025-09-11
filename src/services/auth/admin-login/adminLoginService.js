const AdminLogin = require('../../../models/stake-holder/AdminLogin');
const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '60d';

exports.login = async (username, password) => {
  try {
    const adminLogin = await AdminLogin.findOne({
      where: {
        username: username,
        password: password
      }
    });

    if (!adminLogin) {
      const error = new Error('Invalid username or password');
      error.statusCode = 400;
      throw error;
    }

    // if (adminLogin.is_login) {
    //   const error = new Error('This account is already logged in on another device');
    //   error.statusCode = 403;
    //   throw error;
    // }

    await AdminLogin.update({
      is_login: true,
      last_login: new Date()
    }, {
      where: { id: adminLogin.id }
    });

    // Generating JWT auth token
    const tokenPayload = {
      adminId: adminLogin.id,
      adminName: adminLogin.name,
      phone: adminLogin.phone,
      username: adminLogin.username,
      userType: 'admin'
    };

    const authToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRY 
    });

    return {
      success: true,
      message: 'Login successful',
      authToken: authToken,
      admin: {
        adminId: adminLogin.id,
        adminName: adminLogin.name,
        phone: adminLogin.phone,
        username: adminLogin.username,
      }
    };

  } catch (error) {
    throw error;
  }
};

exports.logout = async (adminId) => {
  try {
    const [updatedRows] = await AdminLogin.update({
      is_login: false,
      last_login: new Date()
    }, {
      where: { 
        id: adminId,
        is_login: true
      }
    });

    if (updatedRows === 0) {
      const error = new Error('Admin not found or already logged out');
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      message: 'Logout successful'
    };

  } catch (error) {
    throw error;
  }
};