# Product Specification

## Problem Statement

Organizations that receive high volumes of incoming requests -- support tickets, sales inquiries, billing questions, technical issue reports -- across multiple channels (email, web forms, Slack, APIs, support portals) face a consistent set of operational challenges:

1. **Manual classification is slow.** Human operators must read each request, determine its category, and decide where to route it. This creates bottlenecks and delays response times.

2. **Routing is inconsistent.** Different operators may route similar requests to different teams, leading to misassignment, duplicated effort, and dropped handoffs.

3. **There is no structured audit trail.** Without automated logging, it is difficult to track how a request was handled, when it was routed, or why a particular decision was made.

4. **Scaling requires more headcount.** As request volume grows, the only option is to hire more people to triage -- a linear cost increase with no efficiency gains.

5. **Valuable data goes unextracted.** Emails and free-text requests contain structured information (email addresses, dollar amounts, dates, company names) that could accelerate handling if automatically extracted.

---

## Solution

An AI-powered automation platform that:

1. **Ingests** requests from any source (webhooks, web forms, APIs)
2. **Classifies** them using AI into one of 8 business categories with confidence scoring
3. **Assigns priority** based on category defaults and content intensity analysis
4. **Extracts** structured data (emails, dollar amounts, dates, company names) from unstructured text
5. **Routes** each request to the appropriate team or downstream system
6. **Executes workflows** with tracked actions, assigned queues, and completion status
7. **Logs every event** in an immutable audit trail with timestamps and metadata
8. **Displays results** in a polished admin dashboard with analytics, filtering, and detail views

---

## Target Users

### Operations Teams
Teams responsible for triaging incoming requests across support, sales, and billing channels. They need automation to reduce manual effort and ensure consistent, repeatable classification and routing.

### Customer Success Managers
Professionals who need visibility into how customer requests are being handled. They benefit from the dashboard overview, confidence scoring, and request-level activity timelines.

### Engineering / DevOps Teams
Technical teams that want to integrate automated request processing into their existing toolchains via the webhook API, or who need to monitor technical issue triage through the workflows view.

### Business Stakeholders
Leaders who want to understand request volumes, category distributions, priority breakdowns, and routing efficiency through the analytics dashboard.

---

## Use Cases

### Email Triage
Incoming emails are submitted via the webhook endpoint. The system classifies each email as a support ticket, sales lead, billing inquiry, or other category and routes it to the appropriate queue (Zendesk for support, Salesforce for sales, Stripe billing team for billing, etc.).

### Support Ticket Routing
Support requests from web forms, support portals, or Slack messages are automatically categorized by issue type (general support, technical issue, urgent escalation) and assigned to the correct support tier or engineering team.

### Sales Lead Classification
Inbound interest from contact forms, emails, and API integrations is classified by intent. High-value enterprise leads with large seat counts or partnership inquiries are routed to strategic accounts, while mid-market inquiries go to the appropriate sales queue.

### Technical Issue Triage
Bug reports, infrastructure alerts, and performance issues from monitoring systems or Slack channels are classified by severity and routed to the correct engineering team (platform, mobile, backend, database, infrastructure).

### Billing Inquiry Handling
Billing-related messages -- duplicate charges, invoice discrepancies, plan upgrades, refund requests -- are routed to the billing support team with extracted financial details (transaction IDs, dollar amounts, account references).

### Compliance and Document Review
Contract reviews, compliance audit requests, and legal inquiries are routed to the legal review queue with extracted metadata (deal value, contract terms, deadlines).

### Incident Escalation
Messages containing urgency indicators (outage, breach, critical, emergency) are automatically assigned critical priority and routed to the incident response team for immediate action.

---

## Feature Requirements

### Core Features (Implemented)

| Feature | Description |
|---------|-------------|
| AI Classification | Classify incoming text into 8 categories with confidence scoring (0.65 -- 0.97 range) |
| Priority Assignment | Automatically assign priority (low/medium/high/critical) based on category defaults and content intensity keywords |
| Structured Data Extraction | Extract emails, dollar amounts, dates, and company names from unstructured text using regex patterns |
| Route Recommendation | Map each category to a destination system (Zendesk, Salesforce, Jira, Stripe, Incident Response, etc.) |
| Workflow Execution | Create and complete workflow records for every classified request with type, queue, and action tracking |
| Automation Logging | Record every event (received, classified, routed, errors, retries) with contextual metadata |
| Dashboard Analytics | Stats cards (total requests, success rate, avg confidence, active workflows), category breakdown chart, priority/status summaries, recent activity table |
| Request List | Searchable, filterable (category, status, priority) request table with pagination |
| Request Detail View | Full view with raw content, classification results, confidence bar, extracted fields, workflow history, and event timeline |
| Reclassification | One-click retry of AI classification on any request, creating a fresh workflow |
| Webhook API | Accept external requests via `POST /api/webhook` with full pipeline execution |
| Manual Submission | Submit test requests through a form on the demo page |
| Webhook Tester | JSON editor for testing the webhook endpoint directly from the UI |
| Demo Data Seeding | One-click database reset and population with 25 realistic records across all categories |
| System Settings | Health status display, classifier mode indicator, environment variable reference, category-to-route mapping |
| Dual AI Modes | Switch between keyword-based mock classification and OpenAI GPT-4o-mini |
| Empty States | Informative placeholders with contextual calls to action when no data is present |

### Nice-to-Have (Future Enhancements)

| Feature | Description |
|---------|-------------|
| Real-time updates | WebSocket push for new request notifications on the dashboard |
| Bulk actions | Select and update multiple requests at once |
| Custom categories | User-defined categories and keyword mappings |
| Email integration | Direct IMAP/SMTP integration for automated email ingestion |
| Slack bot | Native Slack app for submitting requests and receiving routing notifications |
| CSV export | Download filtered request data for external reporting |
| User authentication | Login system with role-based access control |
| Multi-tenant support | Organization-level data isolation |
| Confidence thresholds | Configurable thresholds that flag low-confidence classifications for manual review |
| Analytics charts | Time-series charts for request volume, category trends, and response times |
| Dark mode | System-wide dark theme toggle |

---

## Pages and Their Responsibilities

### Dashboard (`/dashboard`)
- Display 4 stats cards: total requests, success rate (completed + routed / total), average confidence, active workflows
- Show category breakdown as horizontal progress bars with counts and percentages
- Show recent activity table (last 10 requests) with category, priority, confidence, and status badges
- Show priority count summary and status count summary
- Auto-refresh data every 10 seconds
- Empty state directs users to the demo page for seeding

### Requests (`/requests`)
- Display all requests in a table: title, source type, category, priority, confidence, status, date
- Provide filters: free-text search, category dropdown, status dropdown, priority dropdown
- Paginate at 15 results per page with page navigation
- Each row title links to the request detail page
- "New Request" button links to the demo page

### Request Detail (`/requests/:id`)
- Header with title, status/category/priority badges, created timestamp, and "Reclassify" button
- Raw content card showing source type, reference ID, and full request text
- AI classification result card with category, priority, confidence bar, and route destination
- Extracted fields grid displaying all structured data pulled from the text
- Workflow history table showing type, queue, action taken, and status for each workflow
- Automation timeline sidebar with chronological log events
- Request metadata card with ID, created/updated timestamps, and source type

### Workflows (`/workflows`)
- Display all workflows: request title, workflow type, assigned queue, action taken, status, date
- Status filter dropdown (pending, in progress, completed, failed)
- Paginate at 20 results per page
- Request title links to the parent request detail page

### Activity Log (`/logs`)
- Display all automation events: timestamp, event type (color-coded dot), request title, message
- Event type filter dropdown (11 event types)
- Paginate at 25 results per page
- Request title links to the parent request detail page

### Settings (`/settings`)
- System health card: healthy/unhealthy status dot, classifier mode badge, uptime display
- AI classification engine card: descriptions of mock and OpenAI modes
- Environment variables card: list of all config variables with descriptions and defaults
- Supported categories card: 8 categories with their route destinations

### Demo & Testing (`/demo`)
- Manual request submission form: title, content textarea, source type dropdown, submit button
- Inline classification result display after submission (category, priority, confidence, route)
- Webhook tester: JSON editor with pre-populated example payload, send button, raw response display
- Seed data management: description of demo data, seed button, success message

---

## Data Model

See [data-model.md](data-model.md) for complete entity definitions, field types, enum values, relationships, and database indexes.

---

## AI Classification Behavior

### Category Assignments

| Category | Example Keywords | Route Destination | Default Priority |
|----------|-----------------|-------------------|-----------------|
| support_ticket | help, issue, problem, broken, not working, complaint, refund, support | Zendesk Support Queue | medium |
| sales_lead | interested, pricing, quote, demo, buy, purchase, enterprise, proposal | Salesforce CRM Pipeline | low |
| billing | invoice, payment, charge, subscription, billing, receipt, refund, upgrade | Stripe Billing Team | medium |
| technical_issue | error, bug, crash, server, api, timeout, 500, database, memory, ssl | Jira Engineering Board | high |
| general_inquiry | (default fallback when no keywords match) | General Inbox | low |
| onboarding | onboard, setup, new team, access, configure, sso, integration | Onboarding Team Queue | low |
| document_review | contract, compliance, document, review, legal, terms, agreement, audit | Legal Review Queue | low |
| urgent_escalation | urgent, emergency, critical, down, breach, outage, security, incident | Incident Response Team | critical |

### Confidence Scoring (Mock Mode)

- No keyword matches: 0.65 (assigned to `general_inquiry` as default)
- 1 keyword match: 0.65
- 2 keyword matches: 0.73
- 3 keyword matches: 0.81
- 4+ keyword matches: approaches 0.97 (capped)
- Formula: `min(0.65 + (matchCount - 1) * 0.08, 0.97)`

### Priority Escalation

Base priority is determined by the winning category. If 2 or more intensity keywords are present (`urgent`, `emergency`, `critical`, `immediately`, `asap`, `down`, `outage`, `breach`, `security`), priority is upgraded by one level:

- low becomes medium
- medium becomes high
- high becomes critical
- critical remains critical

### Data Extraction

The classifier extracts structured fields from request text using regex patterns:

| Field | Pattern | Example Match |
|-------|---------|--------------|
| email | RFC-like email pattern | `user@example.com` |
| amount | Dollar sign followed by digits | `$49.99`, `$12,500` |
| date | ISO format or US date format | `2024-12-15`, `12/15/2024` |
| company | Capitalized words after "company", "from", "at" | `Acme Corp`, `MegaBank Financial` |

### Example Category Routing

| Incoming Request | Classified As | Routed To | Priority |
|-----------------|---------------|-----------|----------|
| "Login page returns 500 error after update" | support_ticket | Zendesk Support Queue | high |
| "Enterprise pricing inquiry for 500+ seats" | sales_lead | Salesforce CRM Pipeline | high |
| "Double charged on monthly subscription" | billing | Stripe Billing Team | high |
| "API rate limiting not working correctly" | technical_issue | Jira Engineering Board | high |
| "How to export data to CSV format" | general_inquiry | General Inbox | low |
| "New team setup - 15 developers need access" | onboarding | Onboarding Team Queue | medium |
| "Contract review needed for enterprise deal" | document_review | Legal Review Queue | high |
| "Production database is down - all services affected" | urgent_escalation | Incident Response Team | critical |
