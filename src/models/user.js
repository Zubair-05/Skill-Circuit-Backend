const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    googleId: { type: String}, // For Google OAuth
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Only required if using email/password sign in
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String },
    isInstructor: { type: Boolean, default: false }, // Field to check if the user is also an instructor
    connectedStripeId: { type: String },
    stripeConnectLinked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});


const User =  mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
