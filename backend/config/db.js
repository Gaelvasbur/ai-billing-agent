import dotenv from "dotenv";
import pg from "pg";

// Loads .env variables (DB_USER, DB_PASSWORD, etc.)
dotenv.config();

const { Pool } = pg;

// Hybrid Pool configuration: prioritizes production URL connection string, falls back to local distinct envs.
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for secure cloud cloud databases like Neon or Supabase
      },
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

// Creates the MVP tables if not existing yet
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR UNIQUE,
      stripe_customer_id VARCHAR UNIQUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      stripe_subscription_id VARCHAR UNIQUE,
      status VARCHAR,
      amount NUMERIC
    );
  `);

  console.log("Database tables are ready");
}
