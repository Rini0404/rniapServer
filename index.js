require("dotenv").config();
const express = require('express');
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

console.log("SECRETS", process.env.PUBLISH_KEY, "TEST", process.env.STRIPE_SECRET)

const stripe = require('stripe')(process.env.STRIPE_SECRET);


app.get('/', (req, res) => {
  res.send('Hello, world!');
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


app.post('/payment-sheet', async function(req, res) {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2022-11-15' }
  );

  const { body } = req;

  const { items } = body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(items.amount * 100), // Convert to cents
    currency: "usd",
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.PUBLISH_KEY
  });
});