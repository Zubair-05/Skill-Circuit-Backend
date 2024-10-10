const passport = require('passport');
const User = require('../models/user')
const jwt = require('jsonwebtoken');

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

const createTokenAndSendAsCookie = (user, res) => {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token as an HttpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,    // Prevents JavaScript access to the cookie
        secure: process.env.NODE_ENV === 'production',  // Ensures it's sent only over HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 3600000     // 1 hour
    });

    return res.status(200).json({ message: 'Authenticated', token });
};


const signup = async (req, res) => {
    console.log(`hehe got a request for signup`)
    const { name, email, password } = req.body;
    console.log(`name is ${name} and email is ${email}`);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        createTokenAndSendAsCookie(user, res);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token and send as cookie
        createTokenAndSendAsCookie(user, res);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

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
    signin,
    signup,
    googleAuth,
    googleAuthCallback,
    authStatus,
    logout,
    profile
};
