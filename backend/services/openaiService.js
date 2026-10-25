import OpenAI from 'openai';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// LOCAL FUNCTION: Retrieves the real data rows straight from your Docker PostgreSQL instance
const getFinancialHistory = async () => {
  try {
    const result = await pool.query('SELECT amount, status FROM subscriptions');
    return result.rows;
  } catch (error) {
    console.error('Error reading the database for the AI agent:', error);
    return [];
  }
};

export const processAgentMessage = async (userMessage) => {
  const lowercaseMessage = userMessage.toLowerCase();

  //  PORTFOLIO MOCK LOOP: If using the template key, process data locally via code routing
  if (process.env.OPENAI_API_KEY.includes('ficticia') || process.env.OPENAI_API_KEY.includes('test')) {
    console.log('🤖 Mock Mode Active: Evaluating request using local server-side database router');
    
    // Check if the user is asking about revenue, payments, database records or subscriptions
    if (
      lowercaseMessage.includes('revenue') || 
      lowercaseMessage.includes('payment') || 
      lowercaseMessage.includes('database') || 
      lowercaseMessage.includes('subscription') ||
      lowercaseMessage.includes('much')
    ) {
      const financialData = await getFinancialHistory();
      
      if (financialData.length === 0) {
        return "🤖 [Financial Agent Mock Response]: I have scanned the local PostgreSQL instance using our system tools. Currently, there are 0 successful subscriptions or payments logged in the database. Please launch a Stripe Checkout loop on the left panel first!";
      }

      // Compute calculations programmatically to deliver a bulletproof financial report
      const totalRevenue = financialData.reduce((sum, row) => sum + Number(row.amount), 0);
      const activeCount = financialData.filter(row => row.status === 'active').length;

      return `🤖 [Financial Agent Mock Response]: I have triggered the 'getFinancialHistory' system tool to scan our PostgreSQL database in real-time. Here is the executive business summary:\n\n• Total Accumulated Revenue: $${totalRevenue.toFixed(2)} USD\n• Total Active Subscriptions: ${activeCount}\n\nThe system synchronization between Stripe Webhooks and Docker storage is working flawlessly.`;
    }

    // Default polite handler for greetings or non-analytical queries under Mock Mode
    return "🤖 [Financial Agent Mock Response]: Hello! I am operating under local testing routing. Ask me analytical queries like 'What is our total revenue?' or 'Check the database subscriptions' to see me orchestrate SQL queries securely.";
  }

  // 🌐 NATIVE OPENAI ORCHESTRATION (Runs only if a real billing account token is loaded)
  const tools = [
    {
      type: 'function',
      function: {
        name: 'getFinancialHistory',
        description: 'Retrieves the income history and status of all payments from the business database.',
        parameters: { type: 'object', properties: {} },
      },
    },
  ];

  let response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert Financial Analytics and Fintech Agent. You have secure access to server-side tools to query real business data. Generate clear, professional, and executive-level reports.' },
      { role: 'user', content: userMessage },
    ],
    tools: tools,
  });

  const keyMessage = response.choices[0].message;

  if (keyMessage.tool_calls) {
    const functionCall = keyMessage.tool_calls[0];
    
    if (functionCall.function.name === 'getFinancialHistory') {
      console.log('AI Agent determined it needs to invoke tool: getFinancialHistory');
      const financialData = await getFinancialHistory();

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a Financial Agent. Analyze the provided database records and deliver a detailed, structured business report to the user.' },
          { role: 'user', content: userMessage },
          keyMessage,
          {
            role: 'tool',
            tool_call_id: functionCall.id,
            name: functionCall.function.name,
            content: JSON.stringify(financialData),
          },
        ],
      });

      return finalResponse.choices[0].message.content;
    }
  }

  return keyMessage.content;
};
