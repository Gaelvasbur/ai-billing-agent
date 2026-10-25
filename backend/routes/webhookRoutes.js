import express from 'express';
import Stripe from 'stripe';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// WE USE express.raw to capture the raw binary bytes without alteration for security verification
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Validate that the event is legitimately from Stripe using the Webhook Signing Secret
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event when the checkout session completes successfully
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the user in PostgreSQL matching the stripe_customer_id
      const userResult = await pool.query(
        'SELECT id FROM users WHERE stripe_customer_id = $1',
        [session.customer]
      );
      const user = userResult.rows[0];

      if (user) {
        // Insert the successful payment record into the 'subscriptions' table
        await pool.query(
          'INSERT INTO subscriptions (user_id, stripe_subscription_id, status, amount) VALUES ($1, $2, $3, $4)',
          [
            user.id,
            session.id, 
            'active',
            session.amount_total / 100 // Convert Stripe cents back into dollars
          ]
        );
        console.log(`Payment successfully saved in PostgreSQL asynchronously for user ID: ${user.id}`);
      }
    } catch (dbError) {
      console.error('Error inserting subscription into PostgreSQL:', dbError);
    }
  }

  // Acknowledge receipt of the event by immediately returning a 200 OK response to Stripe
  res.json({ received: true });
});

export default router;
