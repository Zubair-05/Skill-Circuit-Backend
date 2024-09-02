const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const User = require('./src/models/user');
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find the user in the database based on their googleId
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // If user exists, return the user
                return done(null, user);
            } else {
                // If user does not exist, create a new user
                user = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    profilePicture: profile.photos[0].value
                });

                await user.save();
                return done(null, user);
            }
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie:{maxAge:160000},
    })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(cookieParser());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:5174/courses')
    }
);

app.get('/profile', (req, res) => {
    if(req.isAuthenticated()) res.send(`<h1>Profile</h1><pre>${JSON.stringify(req.user, null, 2)}</pre>`)
    else res.redirect("/")
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        console.log(`logging out error`,err);
        req.session.destroy((err) => {
            if(err){
                console.error(err);
                return res.status(500).send('Internal server error');
            }
            res.clearCookie('connect.cid');
            res.status(200).send("user is loggedout successfully");
        })
    });
})

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('Mongo connection error:', err));

app.get('/', (req, res) => {
    res.send('Something error has happened');
})

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
})