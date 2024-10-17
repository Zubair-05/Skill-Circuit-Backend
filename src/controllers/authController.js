const passport = require('passport');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const googleAuth = passport.authenticate('google',
    {
        scope: ['profile', 'email'],
        // prompt: 'select_account'
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token as an HttpOnly cookie
    res.cookie('jwt', token, {
        httpOnly: true,    // Prevents JavaScript access to the cookie
        secure: true,  // Ensures it's sent only over HTTPS in production
        sameSite: 'None', // Prevents CSRF attacks
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

        createTokenAndSendAsCookie(user, res);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const signin = async (req, res) => {
    const { email, password } = req.body;
    console.log(`email : ${ email }, password: ${ password }`);
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
        console.log(error)
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const authStatus = (req, res) => {
    res.json({ isAuthenticated: true, user: req.user });
};

const stripeStatus = async (req, res) => {
    try{
        console.log(req.user);
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if(user.stripeConnectLinked) return res.json({isActivated:true})
        else return res.status(200).json({isActivated:false})
    } catch (err){
        console.log(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true, // Secure only in production
        // sameSite: 'None', // Must be 'None' to allow cross-site cookie
        // domain: process.env.REDIRECT_URI, // Ensure the domain matches where the cookie is set
        // path: '/', // Use the same path as where the cookie is set
    });
    // res.clearCookie('jwt');
    return res.status(200).json({ message: 'Logged out' });
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
    stripeStatus,
    logout,
    profile
};
