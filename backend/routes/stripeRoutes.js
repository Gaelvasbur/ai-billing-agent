import express from 'express';
import { createCheckoutSession } from '../controllers/stripeController.js';

const router = express.Router();

// Define the POST route to run the payment process
router.post('/checkout', createCheckoutSession);

export default router;
