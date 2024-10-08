const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the student
    items: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to the course
            addedAt: { type: Date, default: Date.now }
        }
    ],
    totalPrice: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total price
cartSchema.pre('save', function (next) {
    this.totalPrice = this.items.reduce((sum, item) => sum + item.course.price, 0);
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = {Cart};
