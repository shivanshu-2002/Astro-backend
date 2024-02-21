import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import stripe from "stripe";

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

export const processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripeInstance.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "astro",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

export const sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
