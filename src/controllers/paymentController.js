const {Course} = require('../models/course');
const User = require('../models/user');
const stripe = require('../config/stripe');


const stripeConnect = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let account;
        if (!user.connectedStripeId) {
            account = await stripe.accounts.create({
                email: user.email,
                controller: {
                    losses: {
                        payments: "application",
                    },
                    fees: {
                        payer: "application",
                    },
                    stripe_dashboard: {
                        type: "express"
                    }
                }
            })
            console.log(account);
            await User.findByIdAndUpdate(req.user.id, {
                connectedStripeId: account.id
            })
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.connectedStripeId,
            refresh_url: `${process.env.REDIRECT_URI}/stripe/connected/`,
            return_url: `${process.env.REDIRECT_URI}/billing`,
            type: "account_onboarding"
        })
        console.log(accountLink);
        res.status(200).json({linkUrl: accountLink.url});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

const stripeDashboardLink = async (req, res) => {
    const userId = req.user.id;
    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const loginLink = await stripe.accounts.createLoginLink(user.connectedStripeId)
        console.log(loginLink);
        res.status(200).json({loginUrl: loginLink.url});
    } catch (err){
        console.log(err)
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

module.exports = {
    stripeConnect,
    stripeDashboardLink
}