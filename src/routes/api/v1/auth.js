const express = require('express');
const router = express.Router();
// Auth-farmer login controllers
const {farmerLogin, logout} = require('../../../controllers/auth/farmer-login/farmerLoginController');
const {verifyOTP} = require('../../../controllers/auth/farmer-login/verifyOtpController');
const { authenticateFarmerToken } = require('../../../middleware/validateFarmerToken');
// Auth-Fdo login controllers
const fdoLoginController = require('../../../controllers/auth/fdo-login/fdoLoginController');
const { authenticateFdoToken } = require('../../../middleware/validateFdoToken');

// Routes for Farmer Login
router.post('/farmer-login', farmerLogin);
router.post('/verify-otp', verifyOTP);
router.post('/farmer-logout', authenticateFarmerToken, logout);

// Routes for FDO Login
router.post('/fdo-login', fdoLoginController.fdoLogin);
router.post('/fdo-logout', authenticateFdoToken, fdoLoginController.fdoLogout);

router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Auth routes working'
    });
});

module.exports = router;