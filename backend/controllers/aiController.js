import { processAgentMessage } from '../services/openaiService.js';

export const chatWithAgent = async (req, res) => {
  const { message } = req.body;

  // Validate that the user message is present in the request body
  if (!message) {
    return res.status(400).json({ error: 'The message field is required' });
  }

  try {
    // Forward the message to the OpenAI orchestration service
    const agentResponse = await processAgentMessage(message);
    res.json({ response: agentResponse });
  } catch (error) {
    console.error('Error in aiController:', error);
    res.status(500).json({ error: 'An internal error occurred while processing your request with the AI agent' });
  }
};
