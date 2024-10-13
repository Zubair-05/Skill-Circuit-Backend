const express = require('express');
const passport = require('./src/config/passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const uploadRoutes = require('./src/routes/uploadToS3Route');
const cartRoutes = require('./src/routes/cartRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
// const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();

app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.REDIRECT_URI,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization'
}));
app.use(cookieParser());

app.use(authRoutes);
app.use(courseRoutes);
app.use(uploadRoutes);
app.use(cartRoutes);
app.use(enrollmentRoutes);
app.use(paymentRoutes);
// app.use(reviewRoutes);

app.get('/', (req, res) => {
    res.send('Something error has happened');
});

module.exports = app;
