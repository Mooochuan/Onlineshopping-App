// functions/createCharge.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event, context) => {
  try {
    const requestBody = JSON.parse(event.body);

    // Token returned by old Stripe Checkout popup
    const token = requestBody.token.id;
    const email = requestBody.token.email;

    // Order details from the frontend
    const { order } = requestBody;
    // For example: order = { amount: 999, currency: 'eur', shipping: { ... } }

    // In production, you'd typically re-check the price on your server
    // to avoid tampering. For now, we trust `order.amount`.
    const amount = order.amount;
    const currency = order.currency || 'eur';

    // 1. Create an unconfirmed PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: email,
      shipping: order.shipping, // optional
      description: 'Serverless Shop Payment',
      // Possibly store line-item info in metadata, e.g.:
      // metadata: { items: JSON.stringify(order.items || []) },
    });

    // 2. Confirm it using the token
    const confirmedIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method_data: {
            type: 'card',
            card: { token },
          },
        }
    );

    // Return success
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Payment Intent created and confirmed successfully!',
        paymentIntent: confirmedIntent,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
