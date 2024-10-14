const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/authenticateToken');

// Payments
// router.get('/payments', authenticateToken, paymentController.getPaymentHistory);
// router.get('/payments/:paymentId', authenticateToken, paymentController.getPaymentDetails);

// Stripe connect
router.post('/stripe/connect', authenticateToken, paymentController.stripeConnect);
router.get('/stripe/login/link', authenticateToken, paymentController.stripeDashboardLink);
router.post('/webhooks', express.raw({ type: 'application/json' }), paymentController.stripeWebhooks);
module.exports = router;
