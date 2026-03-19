# Data Model

## Entity Relationship

```
Request (1) ──── (N) Workflow
Request (1) ──── (N) AutomationLog
```

---

## Request

The core entity representing an incoming request from any source.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | No | Primary key |
| sourceType | SourceType | No | Origin channel |
| sourceRef | TEXT | No | External reference ID (e.g., TICKET-4821) |
| title | TEXT | No | Short summary |
| rawContent | TEXT | No | Full request content |
| extractedData | TEXT (JSON) | No | Structured fields extracted by AI |
| category | Category | Yes | AI-assigned category |
| priority | Priority | Yes | AI-assigned priority level |
| confidence | REAL | Yes | Classification confidence (0.0 - 1.0) |
| routeDestination | TEXT | Yes | Target system name |
| status | RequestStatus | No | Current processing status |
| createdAt | TEXT (ISO) | No | Creation timestamp |
| updatedAt | TEXT (ISO) | No | Last update timestamp |

## Workflow

Tracks workflow execution for a processed request.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | No | Primary key |
| requestId | TEXT (UUID) | No | Foreign key → requests.id |
| workflowType | TEXT | No | Workflow category (e.g., "Support Ticket Processing") |
| assignedQueue | TEXT | No | Target team (e.g., "Zendesk") |
| actionTaken | TEXT | No | Description of action performed |
| status | WorkflowStatus | No | Execution status |
| createdAt | TEXT (ISO) | No | Creation timestamp |
| updatedAt | TEXT (ISO) | No | Last update timestamp |

## AutomationLog

Event-level audit trail for every step in the automation pipeline.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | No | Primary key |
| requestId | TEXT (UUID) | No | Foreign key → requests.id |
| eventType | EventType | No | Event category |
| message | TEXT | No | Human-readable description |
| metadata | TEXT (JSON) | No | Additional structured data |
| createdAt | TEXT (ISO) | No | Event timestamp |

---

## Enums

### SourceType
`email` | `web_form` | `slack` | `api` | `upload` | `support_portal`

### Category
`support_ticket` | `sales_lead` | `billing` | `technical_issue` | `general_inquiry` | `onboarding` | `document_review` | `urgent_escalation`

### Priority
`low` | `medium` | `high` | `critical`

### RequestStatus
`pending` | `classified` | `routed` | `in_progress` | `completed` | `failed`

### WorkflowStatus
`pending` | `in_progress` | `completed` | `failed`

### EventType
`request_received` | `classification_started` | `classification_completed` | `routing_started` | `routing_completed` | `workflow_created` | `workflow_updated` | `action_triggered` | `error` | `retry_requested`

---

## Database Indexes

| Index | Table | Column(s) |
|-------|-------|-----------|
| idx_requests_status | requests | status |
| idx_requests_category | requests | category |
| idx_requests_priority | requests | priority |
| idx_requests_createdAt | requests | createdAt |
| idx_workflows_requestId | workflows | requestId |
| idx_workflows_status | workflows | status |
| idx_logs_requestId | automation_logs | requestId |
| idx_logs_eventType | automation_logs | eventType |
| idx_logs_createdAt | automation_logs | createdAt |
