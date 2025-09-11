const fdoAuthService = require('../../../services/auth/fdo-login/fdoLoginService');

const fdoLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Username format validation (basic)
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    const result = await fdoAuthService.login(username, password);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        authToken: result.authToken,
        fdo: result.fdo
      }
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

const fdoLogout = async (req, res) => {
  try {
    const result = await fdoAuthService.logout(req.fdo.fdoId);

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

module.exports = { fdoLogin, fdoLogout };