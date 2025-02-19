// functions/fetchProducts.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event, context) => {
  try {
    // Expand each product’s default_price
    const products = await stripe.products.list({
      limit: 10,
      expand: ['data.default_price'],
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        data: products.data, // array of product objects
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
