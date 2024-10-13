const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/authenticateToken');

// Payments
// router.get('/payments', authenticateToken, paymentController.getPaymentHistory);
// router.get('/payments/:paymentId', authenticateToken, paymentController.getPaymentDetails);

// Stripe connect
router.post('/stripe/connect', authenticateToken, paymentController.stripeConnect);

module.exports = router;
