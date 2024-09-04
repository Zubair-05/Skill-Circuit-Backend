const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Only required if using email/password sign in
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String },
    isInstructor: { type: Boolean, default: false }, // Field to check if the user is also an instructor
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
