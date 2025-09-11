const adminAuthService = require('../../../services/auth/admin-login/adminLoginService');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const result = await adminAuthService.login(username, password);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        authToken: result.authToken,
        admin: result.admin
      }
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

const adminLogout = async (req, res) => {
  try {
    console.log(req.admin.adminId)
    const result = await adminAuthService.logout(req.admin.adminId);

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { adminLogin, adminLogout };