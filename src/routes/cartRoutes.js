const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../middlewares/authenticateToken');

// Shopping Cart
router.get('/cart', authenticateToken, cartController.getCart);
router.post('/cart/add/:courseId', authenticateToken, cartController.addToCart);
router.post('/cart/remove/:courseId', authenticateToken, cartController.removeFromCart);
router.post('/cart/clear', authenticateToken, cartController.clearCart);
router.post('/cart/checkout', authenticateToken, cartController.checkoutCart);

module.exports = router;
