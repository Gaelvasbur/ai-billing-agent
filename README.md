# AI-Powered Billing & Subscription Agent MVP

An advanced Full-Stack decentralized architecture designed to simulate an enterprise-level Fintech analytics loop. This monorepo demonstrates live asynchronous payment capture using **Stripe Webhooks**, strict relational persistence in **PostgreSQL (Dockerized)**, a clean **Node.js/Express REST API**, a decoupled **React frontend**, and an intelligent server-side database orchestrator emulating **AI Function Calling (Tool Agents)**.

## 🚀 Key Architectural Features

*   **Decoupled Architecture:** Clean separation of concerns with a standalone React visual user interface and a robust Express.js API.
*   **Fintech Integration (Stripe API):** Seamless customer registration, programmatic checkout session provisioning, and secure webhook event parsing utilizing cryptographic signature validation.
*   **Relational Storage (PostgreSQL & Docker):** Fully containerized database infrastructure implementing strict foreign key constraints, robust indexing, and transaction logging.
*   **AI Function Calling Orchestration:** An automated server-side routing mechanism that evaluates user prompts and dynamically executes SQL queries to generate real-time financial reporting.
*   **Production-Ready Standards:** Written 100% using JavaScript ES Modules (`import/export`), asynchronous lifecycle handlers, strict error boundaries (`try/catch`), and fully documented clean code practices.

---

## 📂 Project Structure

```text
ai-billing-agent/
├── backend/                  # Express.js REST API Server
│   ├── config/               # Database connection pool configurations
│   ├── controllers/          # Stripe checkout & AI routing controller handlers
│   ├── routes/               # API endpoint path orchestrators (REST & Webhooks)
│   ├── services/             # OpenAI SDK setup and local system tool abstractions
│   ├── docker-compose.yml    # PostgreSQL container orchestration blueprint
│   └── server.js             # Main server execution and middleware mounting entry-point
└── frontend/                 # React.js SPA User Interface
    ├── src/
    │   ├── components/       # UI dashboard layout and custom CSS modules
    │   ├── App.jsx           # Main application root mounting wrapper
    │   └── main.jsx          # Vite client compilation entry-point
    └── package.json
```

---

## 🛠️ Tech Stack & Dependencies

### Backend
*   **Runtime:** Node.js (v22+)
*   **Framework:** Express.js
*   **Database Client:** `pg` (PostgreSQL connection pool management)
*   **Integrations:** `stripe` SDK, `openai` SDK
*   **Infrastructure:** Docker & Docker Compose
*   **Dev Tools:** `nodemon`, `dotenv`

### Frontend
*   **Library:** React.js (SPA architecture)
*   **Build Tool:** Vite (Ultra-fast development server)
*   **Styling:** Pure Native CSS3 variables and Flexbox/Grid systems

---

## ⚡ Quick Start & Installation

### Prerequisites
*   Node.js installed locally.
*   Docker Desktop running on your machine.
*   Stripe CLI configured and authorized.

### 1. Clone and Navigate to the Workspace
```bash
git clone https://github.com
cd ai-billing-agent
```

### 2. Configure the Backend Server
Navigate into the backend directory, install the server-side modules, and instantiate your environment configurations:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory using the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=ai_billing_db
STRIPE_SECRET_KEY=sk_test_your_real_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_listen_secret_here
OPENAI_API_KEY=sk-test-ia-ficticia-para-el-paso-3
```

### 3. Spin Up the Database Container
With Docker running, orchestrate your PostgreSQL engine in detached background mode:
```bash
docker compose up -d
```

### 4. Execute the Application Environments
Open two distinct terminal tabs inside your workspace to run both layers simultaneously:

*   **In Terminal 1 (Backend Service):**
    ```bash
    cd backend
    npm run dev
    ```
*   **In Terminal 2 (Stripe Live Webhook Bridge):**
    ```bash
    stripe listen --all-snapshot --forward-to localhost:5000/api/webhook
    ```
*   **In Terminal 3 (React Client Interface):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

Open your browser and navigate to the application environment hosted at: **`http://localhost:5173`**.

---

## 🧪 How to Simulate the Fintech & AI Analytics Loop

1.  **Launch the Checkout Form:** In the left panel of the React application interface, input a testing developer email address, select a subscription plan tier, and click **"Launch Stripe Secure Checkout"**.
2.  **Execute a Sandbox Payment:** You will be securely redirected to Stripe's officially hosted payment interface. Input Stripe's global test card credentials:
    *   **Card Number:** `4242 4242 4242 4242`
    *   **Expiry Date:** Any future calendar date (e.g., `12/30`)
    *   **CVC:** Any 3 randomized digits (e.g., `987`)
3.  **Webhook Triggering:** Click **Pay**. Stripe will instantly fire an asynchronous JSON event. The local `stripe listen` terminal bridge will catch the event data and push it into the Express `/api/webhook` route, executing a secure query that persists the subscription model as `active` inside your local container database.
4.  **Query the AI Assistant:** Return to the React UI dashboard. In the **AI Analytics Console**, execute a plain English query (e.g., *"What is our total revenue right now?"* or *"Check the database and report on active subscriptions"*). 
5.  **Behold the Orchestration:** The backend service logs will reflect the smart tool agent intercepting the string routing, running the relational analytical code, and delivering a perfectly compiled financial report on your user interface.
