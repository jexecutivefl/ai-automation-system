# AI Automation Workflow System - Demo Script

## Prerequisites

Before running the demo, ensure the following tools are installed on your machine:

- **Node.js** 18+ (verify with `node --version`)
- **Python** 3.10+ (verify with `python3 --version`)
- **npm** (bundled with Node.js; verify with `npm --version`)
- **pip** (bundled with Python; verify with `pip --version`)

## Setup Instructions

Open three separate terminal windows and start each service in the order listed below.

### Terminal 1 - AI Classification Engine

```bash
cd ai-classifier
pip install -r requirements.txt
python app.py
```

You should see output indicating the Flask server is running on `http://localhost:5001`.

### Terminal 2 - Automation Engine

```bash
cd automation-engine
npm install
node server.js
```

You should see output indicating the Express server is running on `http://localhost:3001`.

### Terminal 3 - Monitoring Dashboard

```bash
cd dashboard
npm install
npm run dev
```

You should see output from Vite indicating the development server is available at `http://localhost:5173`.

## Demo Flow

Work through the following steps in order. Each step builds on the previous one to demonstrate the full processing pipeline.

### Step 1: Health Check

Verify the classification engine is running and responsive.

```bash
curl http://localhost:5001/health
```

**Expected Output:**

```json
{
  "status": "healthy",
  "service": "ai-classifier",
  "timestamp": "2026-03-12T10:00:00.000Z"
}
```

This confirms the AI Classification Engine is online and ready to accept requests.

### Step 2: Classify Text

Send a text sample directly to the classification engine to see how it categorizes input.

```bash
curl -X POST http://localhost:5001/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I need help with a refund for my recent purchase"}'
```

**Expected Output:**

```json
{
  "category": "billing",
  "confidence": 0.85,
  "action": "route_to_billing",
  "timestamp": "2026-03-12T10:01:00.000Z"
}
```

The engine identifies this as a billing-related request due to the presence of the keyword "refund" and returns a confidence score along with the recommended routing action.

### Step 3: Process via Webhook

Submit a payload through the full automation pipeline via the webhook endpoint.

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "I need help with a refund", "source": "email"}'
```

**Expected Output:**

```json
{
  "status": "processed",
  "id": "wh-1678-abc123",
  "classification": {
    "category": "billing",
    "confidence": 0.85,
    "action": "route_to_billing"
  },
  "action_taken": "Routed to billing queue"
}
```

This demonstrates the complete pipeline: the automation engine receives the webhook, forwards the text to the classifier, processes the result through the orchestrator, and returns the final outcome.

### Step 4: Check Stats

Query the aggregated processing statistics to see a summary of all items handled so far.

```bash
curl http://localhost:3001/api/stats
```

**Expected Output:**

```json
{
  "total_processed": 1,
  "categories": {
    "billing": 1
  },
  "avg_confidence": 0.85
}
```

The stats endpoint provides a running tally of how many items have been processed, broken down by category, along with the average classification confidence.

### Step 5: View Logs

Retrieve the detailed processing log for all items that have passed through the system.

```bash
curl http://localhost:3001/api/logs
```

**Expected Output:**

```json
{
  "logs": [
    {
      "id": "wh-1678-abc123",
      "text": "I need help with a refund",
      "source": "email",
      "category": "billing",
      "confidence": 0.85,
      "action_taken": "Routed to billing queue",
      "timestamp": "2026-03-12T10:02:00.000Z"
    }
  ]
}
```

Each log entry contains the full processing record including the original text, source, classification result, and the action taken by the orchestrator.

## Additional Test Scenarios

After completing the primary demo flow, submit these additional payloads to demonstrate the system's ability to handle different categories of input.

### Support Ticket

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "My account is locked and I cannot log in. Please help me reset my password.", "source": "web_form"}'
```

**Expected Result:** Classified as `support` with routing to the ticketing system.

### Sales Lead

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "We are interested in your enterprise plan. Can we schedule a demo for our team of 50?", "source": "contact_form"}'
```

**Expected Result:** Classified as `sales` with routing to the CRM system.

### Billing Inquiry

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "I was charged twice on my last invoice. Please issue a credit for the duplicate payment.", "source": "email"}'
```

**Expected Result:** Classified as `billing` with routing to the billing queue.

### Technical Issue

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "The API is returning 500 errors when I send POST requests to the /users endpoint.", "source": "slack"}'
```

**Expected Result:** Classified as `technical` with routing to the engineering team.

---

After submitting all test scenarios, run `curl http://localhost:3001/api/stats` again to see the updated category distribution and overall processing count.

## Monitoring Dashboard

Open your browser and navigate to **http://localhost:5173** to view the Monitoring Dashboard. The dashboard provides:

- **Real-time statistics** showing total items processed and average confidence scores
- **Category distribution charts** rendered with Recharts, visualizing how incoming items are distributed across categories
- **Activity log table** displaying the most recent processing events with their classification details

The dashboard automatically polls the automation engine API for updates, so new items submitted via the webhook will appear in the interface without requiring a manual refresh.
