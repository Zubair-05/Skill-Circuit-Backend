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
            return_url: `${process.env.REDIRECT_URI}/teacher/billing`,
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

const stripeConnectWebhooks = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;
    console.log(`request body is`, req.body);
    try{
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err){
        console.error('Webhook error:', err.message);
        return res.status(400).json({ message: 'Webhook error', error: err.message });
    }
    console.log(event?.type);
    switch (event?.type) {
        case "account.updated" : {
            const account = event.data.object;
            console.log(`and the account is`, account);
            try{
                const user = await User.findOneAndUpdate({
                    connectedStripeId: account.id
                }, {
                    stripeConnectLinked: !(account.capabilities?.transfers === "pending" ||
                        account.capabilities?.transfers === "inactive"),
                })
            } catch (err){
                console.error('Error updating user:', error);
                return res.status(500).json({ message: 'Error updating user' });
            }
            break;
        }
        default : {
            console.log(`Unhandled event type: ${event.type}`);
            return res.status(200).json({ received: true });
        }
    }
    return res.status(200).json({ received: true });
}

module.exports = {
    stripeConnect,
    stripeDashboardLink,
    stripeConnectWebhooks
}