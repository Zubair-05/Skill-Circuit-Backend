const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../middlewares/authenticateToken');

// Shopping Cart
router.get('/cart', authenticateToken, cartController.getCart);
router.post('/cart/add', authenticateToken, cartController.addToCart);
router.post('/cart/remove', authenticateToken, cartController.removeFromCart);
router.post('/cart/checkout', authenticateToken, cartController.checkoutCart);

module.exports = router;
