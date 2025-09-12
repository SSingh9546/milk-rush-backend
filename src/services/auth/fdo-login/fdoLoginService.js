const FdoAccount = require('../../../models/fdo/FdoAccounts');
const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';
const JWT_EXPIRY = process.env.FDO_JWT_EXPIRY || '1d';

exports.login = async (username, password) => {
  try {
    const fdoAccount = await FdoAccount.findOne({
      where: {
        username: username,
        password: password
      }
    });

    if (!fdoAccount) {
      const error = new Error('Invalid username or password');
      error.statusCode = 400;
      throw error;
    }

    if (fdoAccount.is_login) {
      const error = new Error('This account is already logged in on another device');
      error.statusCode = 403;
      throw error;
    }

    await FdoAccount.update({
      is_login: true,
      last_login: new Date()
    }, {
      where: { id: fdoAccount.id }
    });

    const tokenPayload = {
      fdoId: fdoAccount.id,
      fdoName: fdoAccount.fdo_name,
      phone: fdoAccount.phone,
      username: fdoAccount.username,
      assignedFarmIds: fdoAccount.assigned_farm_id,
      userType: 'fdo'
    };

    const authToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRY 
    });

    return {
      success: true,
      message: 'Login successful',
      authToken: authToken,
      fdo: {
        fdoId: fdoAccount.id,
        fdoName: fdoAccount.fdo_name,
        phone: fdoAccount.phone,
        username: fdoAccount.username,
        assignedFarmIds: fdoAccount.assigned_farm_id,
        status: fdoAccount.status
      }
    };

  } catch (error) {
    throw error;
  }
};

exports.logout = async (fdoId) => {
  try {
    // Update is_login to false
    const [updatedRows] = await FdoAccount.update({
      is_login: false,
      last_login: new Date()
    }, {
      where: { 
        id: fdoId,
        is_login: true
      }
    });

    if (updatedRows === 0) {
      const error = new Error('Fdo not found or already logged out');
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