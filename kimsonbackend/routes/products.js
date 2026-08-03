const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// Admin only routes
router.get('/admin/all', protect, adminOnly, productController.getAllProducts);
router.post('/', protect, adminOnly, upload.single('image'), productController.createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
