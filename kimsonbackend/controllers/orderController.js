const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, customerAddress, items, paymentMethod } = req.body;
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 2000;
        const total = subtotal + deliveryFee;
        
        const order = await Order.create({
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            deliveryFee,
            total,
            paymentMethod,
            paymentReference: req.body.paymentReference || ''
        });
        
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
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
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        
        let order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        
        await order.save();
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        await order.deleteOne();
        
        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
