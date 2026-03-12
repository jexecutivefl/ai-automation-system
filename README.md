# AI Automation Workflow System

An AI-powered automation system that processes incoming data, classifies it using AI models, and routes it to the correct workflow automatically. Built to eliminate manual data processing and improve operational efficiency.

---

## Architecture

```
            Incoming Data
                 |
                 v
           API Gateway         (Express — port 3001)
                 |
                 v
        AI Classification      (Flask — port 5001)
                 |
                 v
       Workflow Orchestrator   (Node.js module)
             /   |   \
            v    v    v
         CRM  Tickets  Billing
```

---

## Key Features

- **AI Classification Engine** — Categorizes incoming text into support tickets, sales leads, billing, technical issues, or general inquiries
- **Workflow Orchestration** — Automatically routes classified data to the appropriate downstream system (Zendesk, Salesforce, Stripe, Jira)
- **Webhook Ingestion** — Accepts incoming data via REST API and webhook endpoints
- **Real-time Dashboard** — React-based monitoring UI with live stats, classification breakdown charts, and a manual test panel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Classification API | Python, Flask, OpenAI API |
| Backend Engine | Node.js, Express, Axios |
| Workflow Orchestrator | Node.js |
| Frontend Dashboard | React, TypeScript, Recharts, Vite |

---

## Quick Start

The system runs as three services. Open three terminals:

**Terminal 1 — Classification API (port 5001)**
```bash
cd api
pip install -r requirements.txt
python classification-api.py
```

**Terminal 2 — Automation Engine (port 3001)**
```bash
cd backend
npm install
npm start
```

**Terminal 3 — Dashboard (port 5173)**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 to view the dashboard.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/classify` | POST | Classify text (Classification API) |
| `/health` | GET | Classification API health check |
| `/categories` | GET | List supported categories |
| `/webhook` | POST | Ingest and process data (Engine) |
| `/api/stats` | GET | Aggregated statistics |
| `/api/logs` | GET | Processed request logs |
| `/api/health` | GET | Engine health check |

---

## Example Usage

```bash
# Classify text directly
curl -X POST http://localhost:5001/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I need a refund for my recent purchase"}'

# Process through full pipeline
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"text": "I need a refund for my recent purchase", "source": "email"}'
```

---

## Project Structure

```
ai-automation-system/
├── api/
│   ├── classification-api.py      # Flask classification microservice
│   └── requirements.txt
├── backend/
│   ├── automation-engine.js       # Express API server
│   └── package.json
├── automation/
│   └── workflow-orchestrator.js   # Workflow routing module
├── frontend/
│   ├── dashboard-ui.tsx           # React dashboard component
│   ├── main.tsx                   # Entry point
│   ├── index.html                 # Vite HTML template
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json
│   └── package.json
└── docs/
    ├── architecture.md            # System architecture
    ├── demo-script.md             # Demo walkthrough
    └── portfolio-description.md   # Project description
```

---

## Configuration

The classification API uses a mock keyword-based classifier by default. To use OpenAI:

```bash
# Create api/.env
OPENAI_API_KEY=your-key-here
```

---

## Documentation

- [System Architecture](docs/architecture.md)
- [Demo Script](docs/demo-script.md)

---

## Use Cases

- Customer support ticket routing
- Sales lead qualification and CRM routing
- Billing inquiry classification
- Technical issue triage
- Document classification workflows
