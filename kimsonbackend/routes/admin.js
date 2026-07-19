const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalCustomers = await User.countDocuments({ role: 'user' });
        
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        res.json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalCustomers,
                pendingOrders,
                processingOrders,
                completedOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get recent orders
// @route   GET /api/admin/recent-orders
// @access  Private/Admin
router.get('/recent-orders', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
