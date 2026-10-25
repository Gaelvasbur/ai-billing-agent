import express from 'express';
import { chatWithAgent } from '../controllers/aiController.js';

const router = express.Router();

// POST endpoint to handle user interactions with the AI Agent
router.post('/chat', chatWithAgent);

export default router;
