# Demo Script

A step-by-step walkthrough for demonstrating the AI Automation Workflow System. Follow these steps in order to showcase the full feature set.

---

## Prerequisites

```bash
npm install
npm run dev
# Open http://localhost:3000
```

The application starts in mock classification mode by default. No API keys are required.

---

## Step 1: Start the App

1. Run `npm run dev` in the project root
2. Open [http://localhost:3000](http://localhost:3000) in your browser
3. You will be redirected to the Dashboard page
4. If this is a fresh install, the dashboard will show empty states

---

## Step 2: Seed Demo Data

1. Navigate to the **Demo** page by clicking "Demo" in the left sidebar (or go to `/demo`)
2. Scroll down to the **Demo Data Management** section
3. Click the **Seed Demo Data** button
4. You should see the success message: *"Database seeded with 25 requests, 25 workflows, and 85 log entries"*

This populates the database with 25 realistic requests covering all 8 categories, along with matching workflows and automation log entries spread across the past 7 days.

---

## Step 3: Explore the Dashboard

Navigate to **Dashboard** (click the first item in the sidebar, or go to `/dashboard`).

**What to show:**

1. **Stats Cards** (top row) -- Point out:
   - Total Requests: 25
   - Success Rate: approximately 64% (requests that are completed or routed)
   - Average Confidence: approximately 90%
   - Active Workflows: number of pending/in-progress workflows

2. **Recent Activity** (left panel) -- A table showing the 10 most recent requests with:
   - Title (clickable link to detail page)
   - Category badge (color-coded)
   - Priority badge
   - Confidence bar (visual percentage)
   - Status badge

3. **Classification Breakdown** (right panel) -- Horizontal progress bars showing the distribution of requests across all 8 categories with counts and percentages

4. **By Priority** (bottom left) -- Counts for low, medium, high, and critical priorities

5. **By Status** (bottom right) -- Counts for each lifecycle status

**Talking point:** "The dashboard gives operations teams an at-a-glance view of how the automation system is performing -- volume, accuracy, and distribution."

---

## Step 4: Browse the Request List

Navigate to **Requests** (`/requests`).

**What to show:**

1. **Full table** -- 25 requests with title, source, category, priority, confidence, status, and date
2. **Category filter** -- Select "Billing" from the category dropdown to show only the 4 billing requests
3. **Priority filter** -- Change to "Critical" to show the 4 critical-priority items (urgent escalations and critical technical issues)
4. **Search** -- Clear the filters and type "database" in the search box to find the database-related requests
5. **Pagination** -- If more than 15 results are showing, demonstrate the page navigation controls

**Talking point:** "Teams can quickly filter and find specific requests using any combination of search, category, status, and priority filters."

---

## Step 5: View a Request Detail

Click on a request title -- a good choice is **"Production database is down - all services affected"** (an urgent escalation).

**What to show:**

1. **Header** -- Title, status badge (completed), category badge (urgent_escalation), priority badge (critical), and timestamp

2. **Request Content** -- The full original text showing the urgency of the message, with source type (Slack) and reference ID

3. **AI Classification Result** -- A card showing:
   - Category: Urgent Escalation
   - Priority: Critical
   - Confidence: 97% (high confidence bar in green)
   - Route: Incident Response

4. **Extracted Fields** -- Structured data pulled from the text: severity P0, service name, start time, impact percentage, failover status

5. **Workflows** -- Table showing the incident_response workflow was assigned to the Incident Commander queue, with the action taken ("Manual failover executed...")

6. **Automation Timeline** (right sidebar) -- Chronological event log showing: request_received, classification_completed, routing_completed (and possibly error/retry events for some requests)

7. **Reclassify Button** -- Click the "Reclassify" button in the top right to trigger a fresh AI classification. The page will reload with updated results.

**Talking point:** "Every request has a complete audit trail showing exactly what the AI decided, the confidence level, what data was extracted, and how it was routed."

---

## Step 6: View Workflows

Navigate to **Workflows** (`/workflows`).

**What to show:**

1. **Full table** -- All 25+ workflows with request title, workflow type, assigned queue, action taken, status, and date
2. **Status filter** -- Select "In Progress" to see workflows still being worked on
3. **Request links** -- Click a request title to navigate to its detail page
4. **Queue variety** -- Point out the different assigned queues: Zendesk, Salesforce, Jira, Stripe, Incident Response, Legal Review, Onboarding Team, etc.

**Talking point:** "The workflow engine handles routing automatically. Each category maps to a specific team and system, with a description of the action taken."

---

## Step 7: View the Activity Log

Navigate to **Activity Log** (`/logs`).

**What to show:**

1. **Full event timeline** -- 85+ events across all requests
2. **Color-coded dots** -- Green for successful events (classification_completed, routing_completed), red for errors, amber for retries and updates
3. **Event type filter** -- Select "Error" to see only error events, then "Classification Completed" to see classification results
4. **Request links** -- Each event links back to its parent request

**Talking point:** "The audit trail captures every step of the automation pipeline -- from ingestion to classification to routing. Essential for compliance, debugging, and performance analysis."

---

## Step 8: Submit a Live Request

Navigate back to **Demo** (`/demo`).

**Manual Submission:**

1. In the **Manual Request Submission** form, enter:
   - **Title:** "Cannot access billing portal after payment"
   - **Content:** "I made a payment yesterday but still cannot access the billing portal. My invoice number is INV-2024-001 and I was charged $299.99. Please help resolve this issue."
   - **Source Type:** Email
2. Click **Submit & Classify**
3. Show the inline result:
   - Category: billing
   - Priority: medium
   - Confidence: ~73%
   - Route: Stripe Billing Team
4. Click **View Full Details** to see the complete request page with extracted fields ($299.99 amount, etc.)

**Webhook Test:**

1. In the **Webhook Test** panel, replace the JSON with:
   ```json
   {
     "text": "URGENT: Security vulnerability detected in production API. Unauthorized access attempts from IP 10.0.0.1. WAF rules bypassed. Immediate action required.",
     "title": "Security Alert - Unauthorized Access",
     "source": "security_scanner",
     "sourceType": "api"
   }
   ```
2. Click **Send Webhook**
3. Show the response: classified as `urgent_escalation`, priority `critical`, routed to `Incident Response Team`

**Talking point:** "External systems can integrate via the webhook API -- monitoring tools, email parsers, CRM systems, Slack bots -- anything that can send a JSON POST request."

---

## Step 9: Review Settings

Navigate to **Settings** (`/settings`).

**What to show:**

1. **System Status** -- Green dot indicating "healthy", classifier mode showing "mock", uptime counter
2. **AI Classification Engine** -- Descriptions of mock mode (keyword-based, no API key needed) and OpenAI mode (GPT-4o-mini, requires API key)
3. **Environment Variables** -- `CLASSIFIER_MODE`, `OPENAI_API_KEY`, `DATABASE_PATH` with descriptions
4. **Supported Categories** -- All 8 categories with their route destinations displayed in a grid

**Talking point:** "The system works out of the box with the mock classifier. Set `CLASSIFIER_MODE=openai` and add an API key to upgrade to GPT-4o-mini for production-grade classification."

---

## Closing Summary

When wrapping up the demo, highlight these key points:

- **Full-stack implementation:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, SQLite -- a production-grade monolith architecture
- **AI integration:** Dual-mode classification with seamless fallback from OpenAI to mock
- **Automation pipeline:** Request ingestion, AI classification, priority assignment, workflow routing, and audit logging -- all automated
- **Professional UI:** Dashboard analytics, filterable tables, detail views with confidence visualization, event timelines, and empty states
- **Developer experience:** One command to start (`npm run dev`), one click to seed data, no external dependencies in mock mode
- **Extensibility:** Clean service layer architecture makes it straightforward to add new categories, routing destinations, or classification providers
