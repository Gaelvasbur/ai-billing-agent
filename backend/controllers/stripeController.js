import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';
import { pool } from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { email, amount } = req.body;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    // 1. Correctly read the first matching record using rows[0]
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0]; 

    // 2. If the user does not exist, insert them into the relational schema
    if (!user) {
      const newUserResult = await pool.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING *',
        [email]
      );
      user = newUserResult.rows[0];
    }

    // 3. Provision a Stripe customer if missing, ensuring data persistence sync
    if (!user.stripe_customer_id) {
      const customer = await stripe.customers.create({ email: email });
      
      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customer.id, user.id]
      );
      
      user.stripe_customer_id = customer.id;
    }

    // 4. Provision the Stripe Checkout Session seamlessly
    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      payment_method_types: ['card'],
      locale: 'en', 
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Smart Subscription MVP',
            },
            unit_amount: amount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment', 
      success_url: `${FRONTEND_URL}/?success=true`, 
      cancel_url: `${FRONTEND_URL}/?canceled=true`, 
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ error: 'Internal server error while processing the payment' });
  }
};
