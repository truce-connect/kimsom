const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/updatedetails', protect, authController.updateDetails);

module.exports = router;
