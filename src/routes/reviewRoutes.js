const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middlewares/authenticateToken');

// Course Reviews
router.post('/courses/:courseId/review', authenticateToken, reviewController.addCourseReview);
router.get('/courses/:courseId/reviews', reviewController.getCourseReviews);

module.exports = router;
