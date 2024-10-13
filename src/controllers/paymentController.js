const {Course} = require('../models/course');
const User = require('../models/user');
const stripe = require('../config/stripe');


const stripeConnect = async (req, res) => {

    try{
        const user = await User.findById(req.user.id);
        const account = await stripe.accounts.create({
            email: req.body.email,
            controller:{
                losses:{
                    payments:"application",
                },
                fees:{
                    payer:"application",
                },
                stripe_dashboard:{
                    type:"express"
                }
            }
        })
        await User.findByIdAndUpdate(req.user.id, {
            connectedStripeId: account.id,
            stripeConnectLinked: true
        })
        const accountLink = await stripe.accountLinks.create({
            account: user.connectedStripeId,
            refresh_url: `${process.env.REDIRECT_URI}/stripe/connected/`,
            return_url: `${process.env.REDIRECT_URI}/billing`,
            type: "account_onboarding"
        })

        console.log(account);
        return res.status(200).json(`Stripe account created successfully`);
    } catch (err){
        console.log(err);
    }
}

module.exports = {stripeConnect}