const {Course} = require('../models/course');
const User = require('../models/user');
const stripe = require('../config/stripe');

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
            payment_intent_data:{
              application_fee_amount:(Math.round(course.price*100))*0.1,
              transfer_data:{
                  destination: instructor.connectedStripeId,
              }
            },
            success_url: `${process.env.REDIRECT_URI}/payment/success`,
            cancel_url: `${process.env.REDIRECT_URI}/payment/failure`,
        })
        console.log(`session info is`, session);
        res.status(200).json({ sessionUrl: session.url });
    } catch (err){
        console.log(err);
    }
}

module.exports = {enrollInCourse};