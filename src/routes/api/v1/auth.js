const express = require('express');
const router = express.Router();
// Auth-farmer login controllers
const {farmerLogin, logout} = require('../../../controllers/auth/farmer-login/farmerLoginController');
const {verifyOTP} = require('../../../controllers/auth/farmer-login/verifyOtpController');
const { authenticateFarmerToken } = require('../../../middleware/validateFarmerToken');
// Auth-Fdo login controllers
const fdoLoginController = require('../../../controllers/auth/fdo-login/fdoLoginController');
const { authenticateFdoToken } = require('../../../middleware/validateFdoToken');
// Auth-Admin login controllers
const adminLoginController = require('../../../controllers/auth/admin-login/adminLoginController');
const { authenticateAdminToken } = require('../../../middleware/validateAdminToken');

// Routes for Farmer Login
router.post('/farmer-login', farmerLogin);
router.post('/verify-otp', verifyOTP);
router.post('/farmer-logout', authenticateFarmerToken, logout);

// Routes for FDO Login
router.post('/fdo-login', fdoLoginController.fdoLogin);
router.post('/fdo-logout', authenticateFdoToken, fdoLoginController.fdoLogout);

// Routes for Admin Login
router.post('/admin-login', adminLoginController.adminLogin);
router.post('/admin-password-change', authenticateAdminToken, adminLoginController.adminPasswordChange);
router.post('/get-admin-profile', authenticateAdminToken, adminLoginController.getAdminProfile);
router.post('/admin-logout', authenticateAdminToken, adminLoginController.adminLogout);

router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Auth routes working'
    });
});

module.exports = router;