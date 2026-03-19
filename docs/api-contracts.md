# API Contracts

All endpoints are served by Next.js API Route Handlers under the `/api` prefix. Request and response bodies are JSON. The base URL for local development is `http://localhost:3000`.

---

## POST /api/webhook

Ingest an external request, classify it with AI, execute a workflow, and return the completed request.

This is the primary integration point for external systems (monitoring tools, email parsers, CRM platforms, Slack bots) to submit data into the automation pipeline.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The request content to classify |
| `title` | string | No | Request title (auto-generated from text if omitted) |
| `source` | string | No | Source reference ID (e.g., "monitoring_alert") |
| `sourceType` | string | No | Channel origin: `email`, `web_form`, `slack`, `api`, `upload`, `support_portal`. Defaults to `api` |

Any additional fields in the body are stored as `extractedData` metadata.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "sourceType": "api",
    "sourceRef": "monitoring_alert",
    "title": "Server is returning 500 errors on the login endpoint",
    "rawContent": "Server is returning 500 errors on the login endpoint...",
    "extractedData": "{}",
    "category": "technical_issue",
    "priority": "high",
    "confidence": 0.81,
    "routeDestination": "Jira Engineering Board",
    "status": "routed",
    "createdAt": "2026-03-19T15:30:00.000Z",
    "updatedAt": "2026-03-19T15:30:00.150Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "text is required"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT: Production database is completely unresponsive. All services returning 503 errors. Immediate action required.",
    "title": "Production DB Outage",
    "source": "monitoring_alert",
    "sourceType": "api"
  }'
```

---

## GET /api/requests

List requests with optional filtering, search, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | -- | Filter by category (e.g., `billing`, `support_ticket`) |
| `status` | string | -- | Filter by status (e.g., `completed`, `routed`) |
| `priority` | string | -- | Filter by priority (e.g., `high`, `critical`) |
| `search` | string | -- | Search in title and rawContent (case-insensitive LIKE) |
| `page` | number | `1` | Page number (minimum 1) |
| `limit` | number | `20` | Items per page (minimum 1, maximum 100) |

**Response (200):**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "sourceType": "email",
      "sourceRef": "EM-9932",
      "title": "Cannot reset password - token expired",
      "rawContent": "I have been trying to reset my password...",
      "extractedData": "{\"email\":\"sarah@globalcorp.com\",\"company\":\"Global Corp\"}",
      "category": "support_ticket",
      "priority": "medium",
      "confidence": 0.91,
      "routeDestination": "Zendesk",
      "status": "completed",
      "createdAt": "2026-03-14T08:30:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**Examples:**

```bash
# List all requests (default pagination)
curl "http://localhost:3000/api/requests"

# Filter by category and status
curl "http://localhost:3000/api/requests?category=billing&status=completed"

# Search with pagination
curl "http://localhost:3000/api/requests?search=database&page=1&limit=10"

# Filter by priority
curl "http://localhost:3000/api/requests?priority=critical"
```

---

## POST /api/requests

Create a new request through the classification pipeline. Used by the manual submission form on the demo page.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Request title |
| `content` | string | Yes | Full request content to classify |
| `sourceType` | string | No | Channel origin. Defaults to `web_form` |
| `sourceRef` | string | No | External reference ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "sourceType": "web_form",
    "sourceRef": "",
    "title": "Cannot access billing portal after payment",
    "rawContent": "I made a payment yesterday but still cannot access the billing portal...",
    "extractedData": "{\"amount\":\"$299.99\"}",
    "category": "billing",
    "priority": "medium",
    "confidence": 0.73,
    "routeDestination": "Stripe Billing Team",
    "status": "routed",
    "createdAt": "2026-03-19T16:00:00.000Z",
    "updatedAt": "2026-03-19T16:00:00.120Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "title and content are required"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot access billing portal after payment",
    "content": "I made a payment yesterday but still cannot access the billing portal. My invoice number is INV-2024-001 and I was charged $299.99.",
    "sourceType": "web_form"
  }'
```

---

## GET /api/requests/[id]

Get a single request with its associated workflows and automation logs.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Request UUID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "sourceType": "support_portal",
    "sourceRef": "SP-4821",
    "title": "Login page returns 500 error after update",
    "rawContent": "Hi, after the latest update our login page is returning a 500 internal server error...",
    "extractedData": "{\"email\":\"admin@techstartup.io\",\"company\":\"TechStartup Inc\"}",
    "category": "support_ticket",
    "priority": "high",
    "confidence": 0.94,
    "routeDestination": "Zendesk",
    "status": "completed",
    "createdAt": "2026-03-13T10:00:00.000Z",
    "updatedAt": "2026-03-14T12:00:00.000Z",
    "workflows": [
      {
        "id": "w1x2y3z4-a5b6-7890-cdef-012345678901",
        "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "workflowType": "support_resolution",
        "assignedQueue": "Tier 2 Support",
        "actionTaken": "Escalated to engineering, hotfix deployed within 2 hours",
        "status": "completed",
        "createdAt": "2026-03-13T10:00:00.000Z",
        "updatedAt": "2026-03-14T12:00:00.000Z"
      }
    ],
    "logs": [
      {
        "id": "l1m2n3o4-p5q6-7890-rstu-vwxyz1234567",
        "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "eventType": "request_received",
        "message": "Request received from support_portal: \"Login page returns 500 error after update\"",
        "metadata": "{\"sourceType\":\"support_portal\",\"sourceRef\":\"SP-4821\"}",
        "createdAt": "2026-03-13T10:00:00.000Z"
      },
      {
        "id": "l2m3n4o5-p6q7-8901-rstu-vwxyz2345678",
        "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "eventType": "classification_completed",
        "message": "Classified as support_ticket with 94% confidence",
        "metadata": "{\"category\":\"support_ticket\",\"priority\":\"high\",\"confidence\":0.94}",
        "createdAt": "2026-03-13T10:00:01.000Z"
      },
      {
        "id": "l3m4n5o6-p7q8-9012-rstu-vwxyz3456789",
        "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "eventType": "routing_completed",
        "message": "Routed to Zendesk - Tier 2 Support",
        "metadata": "{\"destination\":\"Zendesk\",\"queue\":\"Tier 2 Support\"}",
        "createdAt": "2026-03-13T10:00:02.000Z"
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Request not found"
}
```

**Example:**

```bash
curl "http://localhost:3000/api/requests/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

## PATCH /api/requests/[id]

Update a request's status and/or priority. Logs a `workflow_updated` event.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Request UUID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | No | New status: `pending`, `classified`, `routed`, `in_progress`, `completed`, `failed` |
| `priority` | string | No | New priority: `low`, `medium`, `high`, `critical` |

At least one field must be provided.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "completed",
    "priority": "high",
    "updatedAt": "2026-03-19T16:30:00.000Z"
  }
}
```

**Error Responses:**

- 400: `"No fields to update"`
- 404: `"Request not found"`

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/requests/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "priority": "high"}'
```

---

## POST /api/requests/[id]/retry

Reclassify a request using the AI service. This re-runs the full classification pipeline on the stored `rawContent` and `title`, creates a new workflow, and updates the request status.

The previous classification and workflow records are preserved as history.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Request UUID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "category": "technical_issue",
    "priority": "high",
    "confidence": 0.89,
    "routeDestination": "Jira Engineering Board",
    "status": "routed",
    "updatedAt": "2026-03-19T16:45:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Request not found"
}
```

**Events Created:**

1. `retry_requested` -- Records previous classification details
2. `classification_completed` -- Records new classification result
3. `workflow_created` -- New workflow record
4. `routing_completed` -- Workflow completion

**Example:**

```bash
curl -X POST http://localhost:3000/api/requests/a1b2c3d4-e5f6-7890-abcd-ef1234567890/retry
```

---

## GET /api/workflows

List workflows with optional filtering and pagination. Each workflow is joined with its parent request title.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | -- | Filter by workflow status: `pending`, `in_progress`, `completed`, `failed` |
| `requestId` | string | -- | Filter by parent request ID |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page (max 100) |

**Response (200):**

```json
{
  "data": [
    {
      "id": "w1x2y3z4-a5b6-7890-cdef-012345678901",
      "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "requestTitle": "Login page returns 500 error after update",
      "workflowType": "support_resolution",
      "assignedQueue": "Tier 2 Support",
      "actionTaken": "Escalated to engineering, hotfix deployed within 2 hours",
      "status": "completed",
      "createdAt": "2026-03-13T10:00:00.000Z",
      "updatedAt": "2026-03-14T12:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**Examples:**

```bash
# List all workflows
curl "http://localhost:3000/api/workflows"

# Filter by status
curl "http://localhost:3000/api/workflows?status=in_progress"

# Filter by request
curl "http://localhost:3000/api/workflows?requestId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

## GET /api/logs

List automation log events with optional filtering and pagination. Each log entry is joined with its parent request title.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `eventType` | string | -- | Filter by event type (see EventType enum below) |
| `requestId` | string | -- | Filter by parent request ID |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page (max 100) |

**EventType Values:**

`request_received`, `classification_started`, `classification_completed`, `routing_started`, `routing_completed`, `workflow_created`, `workflow_updated`, `action_triggered`, `error`, `retry_requested`

**Response (200):**

```json
{
  "data": [
    {
      "id": "l1m2n3o4-p5q6-7890-rstu-vwxyz1234567",
      "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "requestTitle": "Login page returns 500 error after update",
      "eventType": "classification_completed",
      "message": "Classified as support_ticket with 94% confidence",
      "metadata": "{\"category\":\"support_ticket\",\"priority\":\"high\",\"confidence\":0.94}",
      "createdAt": "2026-03-13T10:00:01.000Z"
    }
  ],
  "total": 85,
  "page": 1,
  "limit": 20
}
```

**Examples:**

```bash
# List all logs
curl "http://localhost:3000/api/logs"

# Filter by event type
curl "http://localhost:3000/api/logs?eventType=error"

# Filter by request
curl "http://localhost:3000/api/logs?requestId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Paginate
curl "http://localhost:3000/api/logs?page=2&limit=25"
```

---

## GET /api/stats

Get aggregated dashboard statistics. Returns totals, breakdowns, and recent activity.

**Response (200):**

```json
{
  "totalRequests": 25,
  "successRate": 64.0,
  "averageConfidence": 0.9,
  "activeWorkflows": 15,
  "categoryBreakdown": {
    "support_ticket": 4,
    "sales_lead": 4,
    "billing": 4,
    "technical_issue": 4,
    "general_inquiry": 3,
    "onboarding": 2,
    "document_review": 2,
    "urgent_escalation": 2
  },
  "priorityBreakdown": {
    "low": 5,
    "medium": 8,
    "high": 8,
    "critical": 4
  },
  "statusBreakdown": {
    "completed": 10,
    "in_progress": 6,
    "routed": 5,
    "classified": 2,
    "pending": 0,
    "failed": 0
  },
  "recentActivity": [
    {
      "id": "...",
      "title": "General feedback on new dashboard design",
      "category": "general_inquiry",
      "priority": "low",
      "confidence": 0.77,
      "status": "classified",
      "sourceType": "web_form",
      "createdAt": "2026-03-19T10:00:00.000Z"
    }
  ]
}
```

**Field Descriptions:**

| Field | Description |
|-------|-------------|
| `totalRequests` | Count of all requests in the database |
| `successRate` | Percentage of requests with status `completed` or `routed` |
| `averageConfidence` | Mean confidence score across all classified requests |
| `activeWorkflows` | Count of workflows with status `pending` or `in_progress` |
| `categoryBreakdown` | Request count grouped by category |
| `priorityBreakdown` | Request count grouped by priority |
| `statusBreakdown` | Request count grouped by status |
| `recentActivity` | Last 10 requests ordered by `createdAt` descending |

**Example:**

```bash
curl "http://localhost:3000/api/stats"
```

---

## GET /api/health

Health check endpoint. Returns system status, active classifier mode, current timestamp, and uptime in seconds.

**Response (200):**

```json
{
  "status": "healthy",
  "classifierMode": "mock",
  "timestamp": "2026-03-19T15:00:00.000Z",
  "uptime": 3600
}
```

**Error Response (500):**

```json
{
  "status": "unhealthy",
  "error": "Unknown error"
}
```

**Field Descriptions:**

| Field | Description |
|-------|-------------|
| `status` | `healthy` or `unhealthy` |
| `classifierMode` | `mock` or `openai` based on environment configuration |
| `timestamp` | Current server time in ISO 8601 format |
| `uptime` | Seconds since the API route module was loaded |

**Example:**

```bash
curl "http://localhost:3000/api/health"
```

---

## POST /api/seed

Reset the database and populate it with 25 realistic demo records. This deletes all existing data (logs, workflows, requests) and inserts fresh seed data across all 8 categories.

**Request Body:** None required.

**Response (200):**

```json
{
  "success": true,
  "message": "Database seeded with 25 requests, 25 workflows, and 85 log entries"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/seed
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing required fields, no fields to update) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Common Headers

All requests that include a body must set:

```
Content-Type: application/json
```

All responses return:

```
Content-Type: application/json
```
