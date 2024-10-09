const passport = require('passport');

const googleAuth = passport.authenticate('google',
    {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    });

const googleAuthCallback = (req, res) => {
    res.cookie('jwt', req.user.token, {
        httpOnly: true,
        secure: true,
        sameSite:'None',
        maxAge: 3600000 // 1 hour
    });
    res.redirect(process.env.REDIRECT_URI);
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
