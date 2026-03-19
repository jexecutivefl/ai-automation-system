# Demo Script

A step-by-step guide for demonstrating the AI Automation Workflow System.

## Prerequisites

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Step 1: Seed Demo Data

1. Navigate to **Demo** page (`/demo`)
2. Click the **Seed Demo Data** button
3. You should see: "Database seeded with 25 requests, 25 workflows, and 85 log entries"

---

## Step 2: Dashboard Overview

Navigate to **Dashboard** (`/dashboard`):

1. **Stats Cards** — Show total requests (25+), success rate (~64%), average confidence (~90%), active workflows
2. **Recent Activity** — Table showing the latest 10 processed requests with categories, priorities, and confidence scores
3. **Classification Breakdown** — Bar chart showing distribution across all 8 categories
4. **By Priority** — Visual breakdown of low/medium/high/critical requests
5. **By Status** — Visual breakdown of pending/classified/routed/in_progress/completed

**Key talking point:** "The dashboard gives operations teams an at-a-glance view of how the automation system is performing."

---

## Step 3: Request List

Navigate to **Requests** (`/requests`):

1. Show the full list of 25+ requests with titles, sources, categories, priorities, confidence scores, and statuses
2. **Filter by category** — Select "Billing" to show only billing-related requests
3. **Filter by priority** — Select "Critical" to show urgent items
4. **Search** — Type "database" to find the database timeout request
5. **Pagination** — Show next/previous page controls

**Key talking point:** "Teams can quickly filter and find specific requests using any combination of filters."

---

## Step 4: Request Detail

Click on any request (e.g., "Production database is down"):

1. **Header** — Title, status badge, category badge, priority badge, timestamp
2. **Request Content** — Full original request text with source type
3. **AI Classification Result** — Shows category, priority, confidence score bar, and route destination
4. **Extracted Fields** — Structured data pulled from the request (emails, amounts, companies, etc.)
5. **Workflows** — Table showing workflow type, assigned queue, action taken, status
6. **Automation Timeline** — Chronological event log (received → classified → routed)
7. **Reclassify Button** — Click to re-run AI classification

**Key talking point:** "Every request has a complete audit trail showing exactly what the AI decided and why."

---

## Step 5: Live Classification

Navigate to **Demo** page (`/demo`):

1. In the **Manual Request Submission** form:
   - Title: "Cannot access billing portal after payment"
   - Content: "I made a payment yesterday but still cannot access the billing portal. My invoice number is INV-2024-001 and I was charged $299.99. Please help."
   - Source: "Email"
2. Click **Submit & Classify**
3. Show the result: category (billing), priority, confidence, route destination
4. Click "View Full Details" to see the complete request page

---

## Step 6: Webhook Test

Still on the **Demo** page:

1. In the **Webhook Test** panel, use this JSON:
```json
{
  "text": "URGENT: Security vulnerability detected in production API. Unauthorized access from IP 10.0.0.1. Immediate action required.",
  "source": "security_scanner",
  "title": "Security Alert - Unauthorized Access"
}
```
2. Click **Send Webhook**
3. Show the response with classification: `urgent_escalation`, priority: `critical`, routed to `Incident Response Team`

**Key talking point:** "External systems can integrate via the webhook API — monitoring tools, email parsers, CRM systems — anything that can send JSON."

---

## Step 7: Workflows

Navigate to **Workflows** (`/workflows`):

1. Show the complete list of workflow executions
2. Each row shows: request title, workflow type, assigned queue, action taken, status
3. Filter by status to show "In Progress" workflows

**Key talking point:** "The workflow engine handles routing automatically — each category maps to a specific team and system."

---

## Step 8: Activity Log

Navigate to **Activity Log** (`/logs`):

1. Show the full event timeline across all requests
2. Each event has a colored dot, event type, request link, message, and timestamp
3. Filter by event type (e.g., "Classification Completed" or "Error")

**Key talking point:** "The audit trail captures every step — from ingestion to classification to routing. Essential for compliance and debugging."

---

## Step 9: Settings

Navigate to **Settings** (`/settings`):

1. **System Status** — Health indicator, classifier mode, uptime
2. **AI Classification Engine** — Mock mode vs OpenAI mode descriptions
3. **Environment Variables** — Configuration overview
4. **Supported Categories** — All 8 categories with their routing destinations

**Key talking point:** "The system works out of the box with mock classification. Drop in an OpenAI API key to upgrade to GPT-4o-mini."

---

## Closing Points

- **Built with:** Next.js 15, React 19, TypeScript, Tailwind CSS, SQLite, OpenAI
- **Key capabilities demonstrated:** AI integration, workflow automation, webhook handling, real-time dashboards, full-stack development
- **Production-ready patterns:** Service layer architecture, typed APIs, database indexing, error handling, audit logging
