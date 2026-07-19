const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// @desc    Initialize payment
// @route   POST /api/payment/initialize
// @access  Public
router.post('/initialize', paymentController.initializePayment);

// @desc    Verify payment
// @route   GET /api/payment/verify/:reference
// @access  Public
router.get('/verify/:reference', paymentController.verifyPayment);

module.exports = router;
