import express from "express";
import dotenv from "dotenv";
import { initDb } from "./config/db.js";

// Import Stripe, Webhook, and AI route handlers
import stripeRoutes from "./routes/stripeRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Load environment variables from the .env file (PORT, API keys, etc.)
dotenv.config();

// Initialize the Express application
const app = express();

// ARCHITECTURE NOTE: The webhook route must be mounted BEFORE express.json()
// This ensures the endpoint receives the raw binary bytes needed by Stripe to validate the signature.
app.use("/api/webhook", webhookRoutes);

// Enable JSON parsing middleware for all subsequent routes (req.body)
app.use(express.json());

// Basic CORS middleware setup to accept requests from any origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Mount Stripe checkout and AI Agent routes
app.use("/api/stripe", stripeRoutes);
app.use("/api/agent", aiRoutes);

// Health check endpoint to verify that the API is alive and running
app.get("/", (req, res) => {
  res.json({ message: "AI Billing Agent API running" });
});

// Configure the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await initDb();
    console.log(`Server successfully running on port ${PORT}`);
  } catch (error) {
    console.error("Critical: Could not connect to PostgreSQL database orchestration engine.");
    console.error(error.message);
  }
});
