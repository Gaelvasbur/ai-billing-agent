import dotenv from 'dotenv';
// Load environment variables at the very top to avoid initialization errors
dotenv.config();

import Stripe from 'stripe';
import { pool } from '../config/db.js';

// Initialize Stripe with the secret key from the environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { email, amount } = req.body;

  // Fallback configuration ensuring seamless navigation transitions between cloud environments
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    // 1. Check if the user already exists in our PostgreSQL database
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];

    // 2. If the user does not exist, insert them into the database
    if (!user) {
      const newUserResult = await pool.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING *',
        [email]
      );
      user = newUserResult.rows[0];
    }

    // 3. If the user does not have a stripe_customer_id, create it in Stripe and update the DB
    if (!user.stripe_customer_id) {
      const customer = await stripe.customers.create({ email: email });
      
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customer.id, user.id]
      );
      
      // Sync the local memory reference with the newly created ID
      user.stripe_customer_id = customer.id;
    }

    // 4. Create a Stripe Checkout Session (Stripe's hosted secure payment page)
    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      payment_method_types: ['card'],
      locale: 'en', // Enforces strict English localization across Checkout overlays and Link authentication forms
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Smart Subscription MVP',
            },
            unit_amount: amount * 100, // Stripe processes amounts in cents (e.g., $15 USD = 1500 cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment', 
      success_url: `${FRONTEND_URL}/?success=true`, // Dynamic production routing injection
      cancel_url: `${FRONTEND_URL}/?canceled=true`, 
    });

    // Return the secure Stripe checkout URL back to the client/frontend
    res.json({ url: session.url });

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ error: 'Internal server error while processing the payment' });
  }
};
