const axios = require('axios');
const Order = require('../models/Order');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// @desc    Initialize payment
// @route   POST /api/payment/initialize
// @access  Public
exports.initializePayment = async (req, res) => {
    try {
        const { email, amount, orderId, customerName, customerPhone } = req.body;

        if (!email || !amount || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Email, amount, and order ID are required'
            });
        }

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: Math.round(amount * 100),
                reference: `KIN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                metadata: {
                    orderId,
                    customerName,
                    customerPhone
                },
                callback_url: `${process.env.FRONTEND_URL}/payment-callback.html`
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status) {
            res.json({
                success: true,
                data: response.data.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data.message || 'Payment initialization failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Payment initialization failed'
        });
    }
};

// @desc    Verify payment
// @route   GET /api/payment/verify/:reference
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        if (response.data.status && response.data.data.status === 'success') {
            const paymentData = response.data.data;
            const orderId = paymentData.metadata?.orderId;
            
            if (orderId) {
                const order = await Order.findById(orderId);
                
                if (order) {
                    order.paymentStatus = 'paid';
                    order.paymentMethod = 'card';
                    order.paymentReference = reference;
                    order.status = 'processing';
                    await order.save();
                }
            }

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    reference: paymentData.reference,
                    amount: paymentData.amount / 100,
                    status: paymentData.status,
                    paidAt: paymentData.paid_at
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Payment verification failed'
        });
    }
};
