const {Cart} = require('../models/cart'); // Assuming Cart model is in the models directory
const {Course} = require('../models/course'); // Assuming Course model is in the models directory

// Get Cart Details
const getCart = async (req, res) => {
    console.log(req.user.id);
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.course',
                select: 'title price thumbnail teacher',
                populate: {
                    path: 'teacher', // Populating the `teacher` field inside `course`
                    select: 'name profilePicture email',
                },
            })


        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const baseUrl = process.env.S3_BASE_URL;
        // Update the thumbnail paths
        const updatedItems = cart.items.map((item) => ({
            ...item.toObject(),
            course: {
                ...item.course.toObject(),
                thumbnail: `${baseUrl}${item.course.thumbnail}`, // Prepend the base URL to the thumbnail path
            },
        }));

        return res.status(200).json({
            message: 'Cart fetched successfully',
            cart: {
                ...cart.toObject(),
                items: updatedItems, // Use the updated items with full thumbnail paths
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add Course to Cart
const addToCart = async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        console.log(req.user.id);
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Check if the course already exists in the cart
        const courseExists = cart.items.some((item) => item.course.toString() === courseId);
        if (courseExists) {
            return res.status(400).json({ message: 'Course already in cart' });
        }

        cart.items.push({ course: course._id });
        await cart.save();

        return res.status(200).json({
            message: 'Course added to cart successfully',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove Course from Cart
const removeFromCart = async (req, res) => {
    const { courseId } = req.params;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => item.course.toString() !== courseId);

        if (cart.items.length === initialLength) {
            return res.status(400).json({ message: 'Course not found in cart' });
        }

        await cart.save();

        return res.status(200).json({
            message: 'Course removed from cart successfully',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Clear Cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({
            message: 'Cart cleared successfully',
            cart,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Checkout Cart
const checkoutCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.course',
            select: 'price',
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // Calculate the total price again in case it has been changed
        const totalPrice = cart.items.reduce((sum, item) => sum + item.course.price, 0);

        // Simulate successful checkout (You can add actual payment logic here)
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({
            message: 'Checkout successful. Your cart has been cleared.',
            totalAmountPaid: totalPrice,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Exporting All Functions
module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutCart,
};
