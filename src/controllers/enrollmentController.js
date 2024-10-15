const {Course} = require('../models/course');
const User = require('../models/user');
const stripe = require('../config/stripe');
const Enrollment = require('../models/enrollment');

const enrollInCourse = async (req, res) => {
    const {courseId} = req.body;
    try{
        const course = await Course.findById(courseId);
        console.log(course);
        if (!course) {
            return res.status(404).json({message: 'Course does not exist'});
        }
        const instructor = await User.findOne({_id: course.teacher})
        const session = await stripe.checkout.sessions.create({
            mode:"payment",
            line_items: [
                {
                    price_data:{
                        currency:"INR",
                        unit_amount:Math.round(course.price*100),
                        product_data:{
                            name: course.title,
                            description: course.description,
                            images: [`${process.env.S3_BASE_URL}${course.thumbnail}`]
                        },
                    },
                    quantity:1,
                }
            ],
            metadata:{
                courseId:courseId,
                userId: req.user.id,
                instructorId: course.teacher.toString()
            },
            payment_intent_data:{
              application_fee_amount:(Math.round(course.price*100))*0.1,
              transfer_data:{
                  destination: instructor.connectedStripeId,
              }
            },
            success_url: `${process.env.REDIRECT_URI}/payment/success`,
            cancel_url: `${process.env.REDIRECT_URI}/payment/failure`,
        })
        // console.log(`session info is`, session);
        res.status(200).json({ sessionUrl: session.url });
    } catch (err){
        console.log(err);
    }
}

const stripeCheckoutWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try{
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_CHECKOUT_WEBHOOK
        )
    } catch (err){
        console.error('Webhook error:', err.message);
        return res.status(400).json({ message: 'Webhook error', error: err.message });
    }
    console.log(`event is`,event?.type);
    switch (event?.type) {
        case "checkout.session.completed" : {
            const session = event.data.object;
            console.log(`and the session is`, session);
            const {courseId, userId, instructorId} = session.metadata;
            try{
                await enrollStudentInCourse(courseId, userId, instructorId);
            } catch (err){
                console.error('Error updating user:', err);
                return res.status(500).json({ message: 'Error updating user' });
            }
        }
        default : {
            console.log(`Unhandled event type: ${event.type}`);
            return res.status(200).json({ received: true });
        }
    }
    return res.status(200).json({ received: true });
}

const enrollStudentInCourse = async (courseId, userId, instructorId) => {

    try {
        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            console.log(`course not fount`)
            return;
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log(`user not found`)
            return;
        }

        // Check if the user is already enrolled in the course
        const existingEnrollment = await Enrollment.findOne({
            course: courseId,
            student: userId
        });

        if (existingEnrollment) {
            console.log('User is already enrolled in this course')
        }

        // Create a new enrollment
        const enrollment = new Enrollment({
            course: courseId,
            student: userId,
            teacher: instructorId
        });

        // Save the enrollment
        await enrollment.save();

        console.log(`user enrolled successfully`)
    } catch (error) {
        console.error('Error enrolling user:', error);
        // return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    enrollInCourse,
    stripeCheckoutWebhook
};