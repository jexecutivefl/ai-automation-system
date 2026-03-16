# Testing Use Cases — AI Automation System

This document lists all use cases to manually test across the three services:
- **Classification API** (Python/Flask) — Port 5001
- **Automation Engine** (Node.js/Express) — Port 3001
- **Dashboard UI** (React/Vite) — Port 5173

---

## 1. Classification API

### 1.1 POST /classify — Text Classification

| # | Use Case | Input | Expected Result |
|---|----------|-------|-----------------|
| 1 | Support ticket classification | `{"text": "I need help with a refund"}` | `classification: "support_ticket"`, confidence ~0.65–0.73 |
| 2 | Sales lead classification | `{"text": "We are interested in your pricing and a demo"}` | `classification: "sales_lead"`, confidence ~0.65–0.81 |
| 3 | Billing classification | `{"text": "I was charged twice on my invoice"}` | `classification: "billing"`, confidence ~0.65–0.73 |
| 4 | Technical issue classification | `{"text": "API returning 500 error on POST requests"}` | `classification: "technical_issue"`, confidence ~0.65–0.81 |
| 5 | General inquiry (no keyword match) | `{"text": "Hello world"}` | `classification: "general_inquiry"`, confidence 0.65 |
| 6 | Multiple keyword matches | `{"text": "help issue problem broken"}` | Higher confidence (~0.81–0.89) as matches accumulate |
| 7 | Missing `text` field | `{"data": "test"}` | 400 — "Missing required field: text" |
| 8 | Empty `text` field | `{"text": ""}` | 400 — "Field 'text' must be a non-empty string" |
| 9 | Non-string `text` field | `{"text": 123}` | 400 error |
| 10 | Invalid JSON body | `{invalid}` | Graceful error |
| 11 | Very long text (1000+ chars) | Long paragraph | Classifies normally |
| 12 | Special characters / unicode | `{"text": "émojis 🚀 spëcial çhars"}` | Classifies normally |
| 13 | Whitespace-only text | `{"text": "   "}` | 400 or falls back to general_inquiry |

### 1.2 GET /health

| # | Use Case | Expected Result |
|---|----------|-----------------|
| 1 | Health check (no API key) | `{"status": "healthy", "classifier": "mock"}` |
| 2 | Health check (with OPENAI_API_KEY) | `{"status": "healthy", "classifier": "openai"}` |

### 1.3 GET /categories

| # | Use Case | Expected Result |
|---|----------|-----------------|
| 1 | List all categories | Array of 5 categories: support_ticket, sales_lead, billing, technical_issue, general_inquiry |

---

## 2. Automation Engine

### 2.1 POST /webhook — Webhook Ingestion

| # | Use Case | Input | Expected Result |
|---|----------|-------|-----------------|
| 1 | Basic billing webhook | `{"text": "I need a refund", "source": "email"}` | Returns record with UUID, timestamp, classification, confidence, workflowResult, status=completed |
| 2 | Support ticket webhook | `{"text": "My account is locked", "source": "web_form"}` | Classified as support_ticket, routed to Zendesk handler |
| 3 | Sales lead webhook | `{"text": "Can we schedule a demo?", "source": "contact_form"}` | Classified as sales_lead, routed to Salesforce handler |
| 4 | Technical issue webhook | `{"text": "API returning 500 errors", "source": "slack"}` | Classified as technical_issue, routed to Jira handler |
| 5 | General inquiry webhook | `{"text": "Hello there"}` | Classified as general_inquiry, routed to General Inbox |
| 6 | Missing `text` field | `{"source": "email"}` | 400 — "Missing required field: text" |
| 7 | Missing `source` field | `{"text": "Help needed"}` | Processes with source = "unknown" |
| 8 | Extra fields in payload | `{"text": "Help", "source": "email", "customer_id": "123"}` | Processes normally, extra fields preserved |
| 9 | Classification API unavailable | Stop classification API, then POST | 503 — "Classification service is unavailable" |
| 10 | Very long text | 10,000+ characters | Processes successfully |
| 11 | Special characters | Emojis, accented chars | Processes successfully |
| 12 | Multiple rapid requests | Send 5+ in quick succession | All get unique UUIDs, all processed |
| 13 | Response structure | Any valid request | Response includes: id, timestamp, text, source, classification, confidence, workflowResult (handler, status, processedAt, details), status |

### 2.2 Workflow Routing (verify via /api/logs)

| # | Classification | Expected Handler | Expected Details Pattern |
|---|---------------|------------------|--------------------------|
| 1 | support_ticket | Zendesk | "Support ticket routed to Zendesk…" |
| 2 | sales_lead | Salesforce | "Sales lead routed to Salesforce CRM…" |
| 3 | billing | Stripe | "Billing item routed to Stripe…" |
| 4 | technical_issue | Jira | "Technical issue routed to Jira…" |
| 5 | general_inquiry | General Inbox | "General inquiry routed to shared inbox…" |
| 6 | Unknown category | Default Queue | "Unrecognised classification routed to default queue…" |

### 2.3 GET /api/stats

| # | Use Case | Setup | Expected Result |
|---|----------|-------|-----------------|
| 1 | Empty stats | Fresh start, no requests processed | totalProcessed=0, successRate=0, averageConfidence=0, empty breakdown |
| 2 | Stats after single request | Process 1 webhook | totalProcessed=1, breakdown has 1 category |
| 3 | Stats after mixed requests | Process webhooks of different types | Correct breakdown counts per category |
| 4 | Success rate | Process 10 successful webhooks | successRate=100% |
| 5 | Average confidence | Process requests with varying confidence | averageConfidence = arithmetic mean |
| 6 | Recent activity capped at 10 | Process 15+ webhooks | recentActivity shows only last 10, newest first |

### 2.4 GET /api/logs

| # | Use Case | Query | Expected Result |
|---|----------|-------|-----------------|
| 1 | All logs | (none) | Array of all processed requests |
| 2 | Limited logs | `?limit=5` | Last 5 entries |
| 3 | Limit = 1 | `?limit=1` | Single-element array |
| 4 | Non-numeric limit | `?limit=abc` | Returns all logs |
| 5 | Log entry structure | Any | Each entry has: id, timestamp, text, source, classification, confidence, workflowResult, status |

### 2.5 GET /api/health

| # | Use Case | Condition | Expected Result |
|---|----------|-----------|-----------------|
| 1 | All services healthy | Classification API running | status=healthy, services.classificationAPI=healthy |
| 2 | Classification API down | Classification API stopped | status=degraded, services.classificationAPI=unavailable |
| 3 | Response fields | Any | Includes uptime (seconds) and ISO-8601 timestamp |

---

## 3. Dashboard UI

### 3.1 Initial Load & Connection

| # | Use Case | Condition | Expected Result |
|---|----------|-----------|-----------------|
| 1 | Dashboard loads successfully | Backend running | Page displays, stats cards visible |
| 2 | Backend unavailable | Backend not running | Error: "Connection Error — Could not connect to backend" |
| 3 | Auto-poll | Wait 5+ seconds | Stats refresh automatically every 5 seconds |

### 3.2 Statistics Cards

| # | Use Case | Data State | Expected Display |
|---|----------|-----------|------------------|
| 1 | Total Processed (empty) | totalProcessed=0 | Shows "0" |
| 2 | Total Processed (populated) | totalProcessed=42 | Shows "42" |
| 3 | Success Rate (0%) | successRate=0 | Shows "0.0%" |
| 4 | Success Rate (100%) | successRate=100 | Shows "100.0%" |
| 5 | Success Rate (decimal) | successRate=66.666 | Shows "66.7%" |
| 6 | Avg Confidence (empty) | averageConfidence=0 | Shows "0.0%" |
| 7 | Avg Confidence (populated) | averageConfidence=0.85 | Shows "85.0%" |
| 8 | Classifications count | 3 unique categories | Shows "3" |

### 3.3 Recent Activity Table

| # | Use Case | Expected Result |
|---|----------|-----------------|
| 1 | Empty state | Message: "No activity yet. Use the test panel below to send a request." |
| 2 | Table columns | Time, Input, Classification, Confidence, Status |
| 3 | Time formatting | Localized time string (e.g. "12:34:56 PM") |
| 4 | Long input text truncation | First 50 chars + "…", full text in title attribute |
| 5 | Classification badge | Blue badge styling |
| 6 | Confidence display | Shown as percentage (e.g. "85.0%") |
| 7 | Status = completed | Green dot + "completed" |
| 8 | Status = failed | Red dot + "failed" |
| 9 | Row ordering | Newest first |

### 3.4 Classification Breakdown (Pie Chart)

| # | Use Case | Expected Result |
|---|----------|-----------------|
| 1 | No data | "No data available" message |
| 2 | Single category | Pie chart shows 1 segment |
| 3 | Multiple categories | Pie chart shows segments with distinct colors |
| 4 | Legend | Each category with matching color dot and count |
| 5 | Tooltip on hover | Shows category name and count |

### 3.5 Manual Test Panel

| # | Use Case | Action | Expected Result |
|---|----------|--------|-----------------|
| 1 | Empty input | Leave input blank | "Process Request" button disabled |
| 2 | Whitespace-only input | Enter spaces | Button disabled |
| 3 | Valid input | Type text | Button enabled |
| 4 | Submit via button | Enter text, click button | Sends POST to /webhook with source="dashboard" |
| 5 | Submit via Enter key | Type text, press Enter | Same as button click |
| 6 | Loading state | Click submit | Button text → "Processing…", button disabled |
| 7 | Success result | Processing completes | Green result box: "Result: [classification] — Confidence: [X]%" |
| 8 | Input cleared after submit | After successful submit | Input field emptied |
| 9 | Stats refresh after submit | After successful submit | Dashboard fetches new stats |
| 10 | Error display | Backend fails | Error message shown |
| 11 | Rapid clicks | Click button multiple times | Only one request processed at a time |

### 3.6 Error States

| # | Use Case | Condition | Expected Result |
|---|----------|-----------|-----------------|
| 1 | Backend goes down mid-session | Stop backend while dashboard is open | Error message appears |
| 2 | Malformed API response | API returns invalid JSON | Error message displays |
| 3 | Large dataset | 1000+ log entries | Dashboard remains responsive |

---

## 4. End-to-End Workflows

### 4.1 Complete Pipeline Flows

| # | Scenario | Steps | Verification |
|---|----------|-------|--------------|
| 1 | Support ticket E2E | POST /webhook → check /api/logs → check dashboard | Classification=support_ticket, Handler=Zendesk, visible in dashboard |
| 2 | Sales lead E2E | POST /webhook → check /api/stats → check dashboard | Classification=sales_lead, Handler=Salesforce, stats updated |
| 3 | Billing E2E | POST /webhook → check /api/stats → check pie chart | Classification=billing, Handler=Stripe, breakdown updated |
| 4 | Technical issue E2E | POST /webhook → check response → check dashboard | Classification=technical_issue, Handler=Jira |
| 5 | General inquiry E2E | POST /webhook → check routing → check dashboard | Classification=general_inquiry, Handler=General Inbox |

### 4.2 Cross-Service Communication

| # | Scenario | Steps | Verification |
|---|----------|-------|--------------|
| 1 | Full pipeline | All 3 services running, POST /webhook | Data flows through all services correctly |
| 2 | Classification API down | Stop classification API, POST /webhook | 503 error returned |
| 3 | Service recovery | Stop classification API → restart → POST /webhook | Processing resumes normally |

### 4.3 Multi-Category Mix

| # | Scenario | Steps | Verification |
|---|----------|-------|--------------|
| 1 | Mixed batch | Send 5 support, 3 sales, 4 billing, 2 technical, 6 general | /api/stats breakdown matches, pie chart proportions correct |

### 4.4 Data Persistence

| # | Use Case | Verification |
|---|----------|--------------|
| 1 | All requests logged | Process N webhooks → GET /api/logs returns N entries |
| 2 | Stats are cumulative | Process requests in batches → stats grow, never reset |
| 3 | Unique UUIDs | Process 10 webhooks → all IDs are unique |
| 4 | Timestamp accuracy | Timestamps are ISO-8601 and match approximate request time |

---

## 5. Configuration & Environment

| # | Use Case | Setup | Expected Result |
|---|----------|-------|-----------------|
| 1 | Mock classifier (default) | No OPENAI_API_KEY set | Keyword-based classification |
| 2 | OpenAI classifier | OPENAI_API_KEY set | ChatGPT-based classification |
| 3 | Invalid OpenAI key | OPENAI_API_KEY set to bad value | 500 error |
| 4 | Default ports | No PORT env vars | Classification API: 5001, Engine: 3001, Dashboard: 5173 |
| 5 | Custom ports | Set PORT env vars | Services listen on custom ports |
| 6 | Dashboard proxy | Vite dev server running | /webhook and /api/* proxied to localhost:3001 |

---

## 6. Error Handling & Security

| # | Use Case | Input | Expected Result |
|---|----------|-------|-----------------|
| 1 | SQL injection attempt | `{"text": "'; DROP TABLE logs; --"}` | Treated as normal text, no injection |
| 2 | XSS attempt | `{"text": "<script>alert('xss')</script>"}` | Treated as normal text, dashboard escapes output |
| 3 | Null JSON body | `null` | 400 or graceful error |
| 4 | Array instead of object | `[1,2,3]` | 400 error |
| 5 | Very large payload (>1MB) | Huge text | Timeout or rejection |
| 6 | Network timeout | Slow classification API (>3s) | Engine returns 503 |
| 7 | Connection refused | Classification API port closed | 503 — "Classification service is unavailable" |
