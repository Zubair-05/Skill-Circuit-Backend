const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');
const passport = require('../config/passport');

// Google OAuth routes
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), authController.googleAuthCallback);


// Auth status and logout routes
router.get('/auth/status', authenticateToken, authController.authStatus);
router.get('/stripe/status', authenticateToken, authController.stripeStatus);
router.get('/profile', authenticateToken, authController.profile);
router.get('/logout', authController.logout);

// Auth with Email and password
router.post('/auth/signin', authController.signin);
router.post('/auth/signup', authController.signup);
module.exports = router;
