const passport = require('passport');

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = (req, res) => {
    res.cookie('jwt', req.user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 hour
    });
    res.redirect('http://localhost:5173/');
};

const authStatus = (req, res) => {
    res.json({ isAuthenticated: true, user: req.user });
};

const logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).send('User is logged out successfully');
};

const profile = (req, res) => {
    res.render('profile');
}

// Export all functions at once
module.exports = {
    googleAuth,
    googleAuthCallback,
    authStatus,
    logout,
    profile
};
