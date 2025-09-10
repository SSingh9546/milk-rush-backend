const fdoAuthService = require('../../../services/auth/fdo-login/fdoLoginService');

exports.fdoLogin = async (req, res) => {
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
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

exports.fdoLogout = async (req, res) => {
  try {
    // fdoId is available from JWT middleware
    const result = await fdoAuthService.logout(req.fdo.fdoId);

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};