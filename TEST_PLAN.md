# Test Plan — AI Automation Workflow System

> **Purpose:** Verify all features work correctly before showcasing this app as an Upwork portfolio demo.
> **Test Mode:** Manual (no automated test framework installed)
> **Base URL:** `http://localhost:3000`

---

## Prerequisites

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` (defaults are fine — mock classifier mode)
3. Start the dev server: `npm run dev`
4. Confirm the app is running at http://localhost:3000

---

## 1. App Startup & Health

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 1.1 | App boots without errors | Run `npm run dev`, watch terminal | No errors in console, server starts on port 3000 |
| 1.2 | Home redirects to dashboard | Navigate to `/` | Redirected to `/dashboard` |
| 1.3 | Health endpoint responds | `curl http://localhost:3000/api/health` | 200 OK with JSON: status "ok", classifierMode "mock" |
| 1.4 | Database auto-creates | Delete `data/automation.db`, restart server, hit any API | DB file recreated, tables exist, no errors |

---

## 2. Demo Data Seeding

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 2.1 | Seed via Demo page | Go to `/demo`, click "Seed Demo Data" | Success message, 25+ requests created |
| 2.2 | Seed via API | `curl -X POST http://localhost:3000/api/seed` | 200 OK, response confirms records created |
| 2.3 | Seeded data appears everywhere | After seeding, check Dashboard, Requests, Workflows, Logs pages | All pages populated with data |
| 2.4 | Re-seed is safe | Click "Seed Demo Data" again | No duplicate errors, data is re-created cleanly |

---

## 3. Dashboard (`/dashboard`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 3.1 | Stats cards render | Navigate to `/dashboard` after seeding | 4 cards visible: Total Requests, Success Rate, Avg Confidence, Active Workflows — all with non-zero values |
| 3.2 | Category breakdown chart | Scroll to charts section | Bar/pie chart showing distribution across 8 categories |
| 3.3 | Priority distribution chart | Scroll to charts section | Chart showing low/medium/high/critical counts |
| 3.4 | Status breakdown | Check charts area | Chart showing pending/classified/routed/completed counts |
| 3.5 | Recent activity list | Scroll down | 10 most recent requests with titles, badges, and timestamps |
| 3.6 | Recent activity links work | Click any request in recent activity | Navigates to `/requests/[id]` detail page |
| 3.7 | Auto-refresh | Wait 10+ seconds on dashboard | Stats update without manual page refresh |
| 3.8 | Empty dashboard | Clear DB, visit dashboard before seeding | Cards show 0 values, empty states render cleanly |

---

## 4. Request List (`/requests`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 4.1 | Request table renders | Navigate to `/requests` | Table with columns: title, source, category, status, priority, confidence, date |
| 4.2 | Pagination | Scroll to bottom of list | Page controls shown; clicking next/prev loads different requests (15 per page) |
| 4.3 | Filter by category | Select "billing" from category dropdown | Only billing requests shown |
| 4.4 | Filter by status | Select "routed" from status dropdown | Only routed requests shown |
| 4.5 | Filter by priority | Select "high" from priority dropdown | Only high-priority requests shown |
| 4.6 | Search by text | Type a keyword from a known request title | Matching requests shown |
| 4.7 | Combined filters | Apply category + status filter simultaneously | Results match both filters |
| 4.8 | Clear filters | Remove all filters | Full unfiltered list restored |
| 4.9 | Row click navigation | Click any request row | Navigates to `/requests/[id]` |
| 4.10 | Badges display correctly | Look at category, status, and priority columns | Color-coded badges render for each value |
| 4.11 | Confidence bar | Check confidence column | Visual progress bar with percentage shown |
| 4.12 | Empty state | Clear filters to show no results (if possible) | Friendly empty state message displayed |

---

## 5. Request Detail (`/requests/[id]`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 5.1 | Detail page loads | Click a request from the list | Full detail page renders with all sections |
| 5.2 | Request content displayed | Check main content area | Title, raw content, source type, source ref, created/updated timestamps |
| 5.3 | AI Classification panel | Check classification section | Category badge, priority badge, confidence bar with score |
| 5.4 | Extracted fields | Check classification section | Any extracted emails, amounts, dates, or company names shown |
| 5.5 | Workflow history | Scroll to workflows section | List of workflows: type, assigned queue, action taken, status |
| 5.6 | Automation timeline | Scroll to timeline section | Chronological event log: request_received → classification → routing events |
| 5.7 | Reclassify button | Click "Reclassify" button | Request is re-classified, page updates with new (or same) classification results |
| 5.8 | Invalid request ID | Navigate to `/requests/nonexistent-id` | 404 or friendly error message, no crash |

---

## 6. Workflows Page (`/workflows`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 6.1 | Workflows table renders | Navigate to `/workflows` | Table showing: request ID/title, workflow type, assigned queue, action, status, date |
| 6.2 | Pagination works | Navigate between pages | Different workflow records shown per page |
| 6.3 | Status display | Check status column | Correct status badges (in_progress, completed) |
| 6.4 | Empty state | Visit before seeding data | Empty state message shown |

---

## 7. Activity Log (`/logs`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 7.1 | Log table renders | Navigate to `/logs` | Table with: event type, message, request link, timestamp |
| 7.2 | Event type filter | Filter by "classification_completed" | Only classification events shown |
| 7.3 | Request link | Click a request link in the log | Navigates to correct request detail page |
| 7.4 | Chronological order | Check timestamps | Events listed in most-recent-first order |

---

## 8. Settings Page (`/settings`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 8.1 | Settings page loads | Navigate to `/settings` | Page renders with system configuration |
| 8.2 | Classifier mode shown | Check settings display | Shows "mock" as current classifier mode |
| 8.3 | Health status | Check health section | Shows system health as "ok" |

---

## 9. Demo Page (`/demo`)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 9.1 | Manual request form | Fill in title + content, select source type, submit | Request created, confirmation shown |
| 9.2 | Request appears in list | After submitting, go to `/requests` | New request visible at top of list with classification results |
| 9.3 | Webhook tester | Use the webhook test panel with example JSON | Request created via webhook, confirmation shown |
| 9.4 | Form validation | Submit form with empty fields | Appropriate validation message shown |
| 9.5 | Seed demo data button | Click seed button | Success message, data populated |

---

## 10. API Endpoints (curl tests)

Run these from a terminal while the dev server is running.

### 10.1 — Health Check
```bash
curl -s http://localhost:3000/api/health | jq .
```
**Expected:** `{ "status": "ok", "classifierMode": "mock", ... }`

### 10.2 — Seed Data
```bash
curl -s -X POST http://localhost:3000/api/seed | jq .
```
**Expected:** 200 OK with confirmation of seeded records.

### 10.3 — List Requests
```bash
curl -s "http://localhost:3000/api/requests?limit=5" | jq .
```
**Expected:** JSON with `requests` array (5 items) and `pagination` object.

### 10.4 — List Requests with Filters
```bash
curl -s "http://localhost:3000/api/requests?category=billing&status=routed" | jq .
```
**Expected:** Only billing + routed requests returned.

### 10.5 — Create Request via API
```bash
curl -s -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"title":"Test from API","content":"I need help with my invoice #12345 for $500","sourceType":"api"}' | jq .
```
**Expected:** 201 Created with full request object including classification (category: billing), confidence score, and route destination.

### 10.6 — Get Request Detail
```bash
# Use an ID from the list response above
curl -s http://localhost:3000/api/requests/{id} | jq .
```
**Expected:** Full request with nested `workflows` and `logs` arrays.

### 10.7 — Update Request
```bash
curl -s -X PATCH http://localhost:3000/api/requests/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}' | jq .
```
**Expected:** Updated request with new status.

### 10.8 — Reclassify Request
```bash
curl -s -X POST http://localhost:3000/api/requests/{id}/retry | jq .
```
**Expected:** Request re-classified, new classification results returned.

### 10.9 — Webhook Ingestion
```bash
curl -s -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"source":"email","sourceRef":"ticket-9999","title":"Urgent: Server down","content":"Our production server has been unresponsive for 30 minutes. This is critical and needs immediate attention."}' | jq .
```
**Expected:** 201 Created, classified as `urgent_escalation` or `technical_issue` with high/critical priority.

### 10.10 — List Workflows
```bash
curl -s "http://localhost:3000/api/workflows?limit=5" | jq .
```
**Expected:** JSON with `workflows` array and pagination.

### 10.11 — List Logs
```bash
curl -s "http://localhost:3000/api/logs?limit=5" | jq .
```
**Expected:** JSON with `logs` array, each with eventType, message, requestId.

### 10.12 — Logs Filtered by Event Type
```bash
curl -s "http://localhost:3000/api/logs?eventType=classification_completed" | jq .
```
**Expected:** Only classification_completed events returned.

---

## 11. AI Classification Accuracy (Mock Mode)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 11.1 | Support ticket classification | Submit: "I can't log in to my account, please help" | Category: `support_ticket`, Route: Zendesk |
| 11.2 | Sales lead classification | Submit: "We're interested in purchasing your enterprise plan for our company" | Category: `sales_lead`, Route: Salesforce |
| 11.3 | Billing classification | Submit: "I was charged twice on my invoice, need a refund of $200" | Category: `billing`, Route: Stripe |
| 11.4 | Technical issue classification | Submit: "Getting error 500 when calling the API endpoint" | Category: `technical_issue`, Route: Jira |
| 11.5 | Urgent escalation | Submit: "URGENT: Production server is down, critical outage affecting all customers" | Category: `urgent_escalation`, Priority: critical, Route: Incident Response Team |
| 11.6 | General inquiry | Submit: "What are your business hours?" | Category: `general_inquiry`, Route: General Inbox |
| 11.7 | Confidence score range | Check confidence on multiple requests | All scores between 0.65 and 0.97 |
| 11.8 | Field extraction — email | Submit content containing "contact me at user@example.com" | Extracted fields include the email address |
| 11.9 | Field extraction — amount | Submit content containing "$1,500" | Extracted fields include the dollar amount |
| 11.10 | Field extraction — date | Submit content containing "by 2026-03-25" | Extracted fields include the date |

---

## 12. Navigation & Layout

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 12.1 | Sidebar renders | Load any page | Fixed left sidebar with 6 navigation icons |
| 12.2 | All nav links work | Click each sidebar item | Each navigates to correct page: Dashboard, Requests, Workflows, Logs, Settings, Demo |
| 12.3 | Active nav state | Navigate to each page | Current page's nav icon is visually highlighted |
| 12.4 | Layout consistency | Visit every page | Consistent sidebar + main content layout on all pages |
| 12.5 | No console errors | Open browser DevTools console, navigate through all pages | No JavaScript errors in console |

---

## 13. Edge Cases & Error Handling

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 13.1 | Invalid request ID | `curl http://localhost:3000/api/requests/fake-id` | 404 response, no server crash |
| 13.2 | Missing required fields | `curl -X POST http://localhost:3000/api/webhook -H "Content-Type: application/json" -d '{}'` | 400 error with descriptive message |
| 13.3 | Empty content classification | Submit request with empty content body | Handled gracefully — defaults to `general_inquiry` or returns error |
| 13.4 | Large payload | Submit request with very long content (5000+ chars) | Processed without timeout or error |
| 13.5 | Concurrent requests | Send 5 webhook requests simultaneously | All processed correctly, no DB locking errors |
| 13.6 | Invalid filter values | `curl "http://localhost:3000/api/requests?category=nonexistent"` | Empty results, no error |
| 13.7 | SQL injection attempt | Submit title containing `'; DROP TABLE requests; --` | Request created normally, no DB damage |
| 13.8 | XSS in request content | Submit content containing `<script>alert('xss')</script>` | Content displayed as text, script does not execute |

---

## 14. Production Build

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| 14.1 | Build succeeds | Run `npm run build` | Build completes with no errors |
| 14.2 | Production mode works | Run `npm start` after build | App serves correctly on port 3000 |
| 14.3 | All pages render in prod | Navigate through all pages in production mode | No hydration errors, all pages functional |

---

## Quick Smoke Test (5-minute demo check)

If you're short on time, run through this minimal checklist:

- [ ] `npm run dev` — app starts
- [ ] Visit `/demo` — click "Seed Demo Data"
- [ ] Visit `/dashboard` — stats and charts populated
- [ ] Visit `/requests` — list shows requests, click one
- [ ] On detail page — classification, workflows, and timeline visible
- [ ] On detail page — click "Reclassify", see it update
- [ ] Visit `/demo` — submit a manual request with: "Urgent billing issue, charged $500 twice"
- [ ] Visit `/requests` — new request appears with correct classification
- [ ] `npm run build` — builds without errors
