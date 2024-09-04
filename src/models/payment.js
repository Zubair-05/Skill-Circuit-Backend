const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'crypto'], required: true }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
