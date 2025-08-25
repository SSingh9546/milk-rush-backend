const FdoAccount = require('../../../models/fdo/FdoAccounts');
const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'e3aab66d66df84c3d885a1bce2f3923df5f3121375a4632397f4d6bc068f48b6';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '60d'; // 60 days

exports.login = async (username, password) => {
  try {
    // Step 1: Find FDO account with username and password
    const fdoAccount = await FdoAccount.findOne({
      where: {
        username: username,
        password: password
      }
    });

    if (!fdoAccount) {
      throw new Error('Invalid username or password');
    }

    // Step 2: Update is_login and last_login columns
    await FdoAccount.update({
      is_login: true,
      last_login: new Date()
    }, {
      where: { id: fdoAccount.id }
    });

    // Step 3: Generate JWT auth token
    const tokenPayload = {
      fdoId: fdoAccount.id,
      fdoName: fdoAccount.fdo_name,
      phone: fdoAccount.phone,
      username: fdoAccount.username,
      assignedFarmIds: fdoAccount.assigned_farm_id,
      userType: 'fdo' // To distinguish from farmer tokens
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
    throw new Error(error.message);
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
      throw new Error('FDO not found or already logged out');
    }

    return {
      success: true,
      message: 'Logout successful'
    };

  } catch (error) {
    throw new Error(error.message);
  }
};