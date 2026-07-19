const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route
router.post('/', orderController.createOrder);

// Admin only routes
router.get('/', protect, adminOnly, orderController.getOrders);
router.get('/:id', protect, adminOnly, orderController.getOrder);
router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);
router.delete('/:id', protect, adminOnly, orderController.deleteOrder);

module.exports = router;
