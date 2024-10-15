const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/enroll', authenticateToken, enrollmentController.enrollInCourse);
router.post('/checkout/webhooks', enrollmentController.stripeCheckoutWebhook);
module.exports = router;