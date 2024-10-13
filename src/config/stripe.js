// import Stripe from "stripe";
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10"
});
module.exports = stripe;
