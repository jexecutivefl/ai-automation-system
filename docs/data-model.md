# Data Model

## Overview

The AI Automation Workflow System uses SQLite (via better-sqlite3) with three tables. The database is stored as a single file at `./data/automation.db` (configurable via the `DATABASE_PATH` environment variable). WAL journal mode is enabled for concurrent read performance, and foreign key constraints are enforced.

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│   Request    │       │   Workflow   │
│              │1     N│              │
│  id (PK)     │───────│  id (PK)     │
│  sourceType  │       │  requestId   │──── FK → requests.id
│  sourceRef   │       │  workflowType│
│  title       │       │  assignedQueue│
│  rawContent  │       │  actionTaken │
│  extractedData│      │  status      │
│  category    │       │  createdAt   │
│  priority    │       │  updatedAt   │
│  confidence  │       └──────────────┘
│  routeDest.  │
│  status      │       ┌──────────────┐
│  createdAt   │       │AutomationLog │
│  updatedAt   │1     N│              │
│              │───────│  id (PK)     │
└──────────────┘       │  requestId   │──── FK → requests.id
                       │  eventType   │
                       │  message     │
                       │  metadata    │
                       │  createdAt   │
                       └──────────────┘
```

**Relationships:**
- A Request has many Workflows (1:N)
- A Request has many AutomationLogs (1:N)
- Workflows and AutomationLogs reference their parent Request via `requestId` foreign key

---

## Request

The core entity representing an incoming item from any source channel.

| Field | SQLite Type | Nullable | Default | Description |
|-------|------------|----------|---------|-------------|
| `id` | TEXT | No (PK) | -- | UUID v4 primary key |
| `sourceType` | TEXT | No | -- | Channel the request originated from (see SourceType enum) |
| `sourceRef` | TEXT | No | `''` | External reference ID (e.g., `SP-4821`, `EM-9932`, `SL-alerts-1182`) |
| `title` | TEXT | No | -- | Short summary or subject line |
| `rawContent` | TEXT | No | -- | Full unstructured text of the request |
| `extractedData` | TEXT | No | `'{}'` | JSON string containing structured fields extracted by the AI (emails, amounts, dates, companies, etc.) |
| `category` | TEXT | Yes | `NULL` | AI-assigned classification category (see Category enum). NULL before classification. |
| `priority` | TEXT | Yes | `NULL` | AI-assigned priority level (see Priority enum). NULL before classification. |
| `confidence` | REAL | Yes | `NULL` | Classification confidence score between 0.0 and 1.0. NULL before classification. |
| `routeDestination` | TEXT | Yes | `NULL` | Recommended routing destination (e.g., "Zendesk Support Queue", "Salesforce CRM Pipeline"). NULL before classification. |
| `status` | TEXT | No | `'pending'` | Current lifecycle status (see RequestStatus enum) |
| `createdAt` | TEXT | No | -- | ISO 8601 creation timestamp |
| `updatedAt` | TEXT | No | -- | ISO 8601 last-update timestamp |

---

## Workflow

Tracks automated workflow executions linked to classified requests. A request may have multiple workflows if it has been reclassified.

| Field | SQLite Type | Nullable | Default | Description |
|-------|------------|----------|---------|-------------|
| `id` | TEXT | No (PK) | -- | UUID v4 primary key |
| `requestId` | TEXT | No (FK) | -- | Foreign key referencing `requests.id` |
| `workflowType` | TEXT | No | -- | Human-readable workflow label (e.g., "Support Ticket Processing", "Sales Lead Routing") |
| `assignedQueue` | TEXT | No | -- | Destination system or team (e.g., "Zendesk", "Salesforce", "Jira", "Incident Response") |
| `actionTaken` | TEXT | No | `''` | Description of the automated action performed. Empty while in progress. |
| `status` | TEXT | No | `'pending'` | Workflow execution status (see WorkflowStatus enum) |
| `createdAt` | TEXT | No | -- | ISO 8601 creation timestamp |
| `updatedAt` | TEXT | No | -- | ISO 8601 last-update timestamp |

---

## AutomationLog

Immutable audit trail of every automation event in the system. Events are append-only and never updated or deleted during normal operation.

| Field | SQLite Type | Nullable | Default | Description |
|-------|------------|----------|---------|-------------|
| `id` | TEXT | No (PK) | -- | UUID v4 primary key |
| `requestId` | TEXT | No (FK) | -- | Foreign key referencing `requests.id` |
| `eventType` | TEXT | No | -- | Event classification (see EventType enum) |
| `message` | TEXT | No | -- | Human-readable description of the event |
| `metadata` | TEXT | No | `'{}'` | JSON string with contextual data (classification results, error details, workflow IDs, etc.) |
| `createdAt` | TEXT | No | -- | ISO 8601 event timestamp |

---

## Enum Values

### SourceType

The channel through which a request was received.

| Value | Description |
|-------|-------------|
| `email` | Email message |
| `web_form` | Web form submission |
| `slack` | Slack message or alert |
| `api` | Direct API call |
| `upload` | File upload |
| `support_portal` | Support portal submission |

### Category

AI classification categories. Each maps to a specific route destination.

| Value | Display Name | Route Destination |
|-------|-------------|-------------------|
| `support_ticket` | Support Ticket | Zendesk Support Queue |
| `sales_lead` | Sales Lead | Salesforce CRM Pipeline |
| `billing` | Billing | Stripe Billing Team |
| `technical_issue` | Technical Issue | Jira Engineering Board |
| `general_inquiry` | General Inquiry | General Inbox |
| `onboarding` | Onboarding | Onboarding Team Queue |
| `document_review` | Document Review | Legal Review Queue |
| `urgent_escalation` | Urgent Escalation | Incident Response Team |

### Priority

Priority levels assigned by the AI classifier based on category defaults and content intensity.

| Value | Description |
|-------|-------------|
| `low` | Standard priority, no urgency indicators |
| `medium` | Moderate priority, common for support and billing |
| `high` | Elevated priority, typical for technical issues and important requests |
| `critical` | Highest priority, reserved for urgent escalations and outages |

### RequestStatus

Lifecycle status of a request as it moves through the automation pipeline.

| Value | Description |
|-------|-------------|
| `pending` | Received but not yet classified |
| `classified` | AI classification complete, awaiting routing |
| `routed` | Workflow executed and routing complete |
| `in_progress` | Being actively worked on |
| `completed` | Fully resolved |
| `failed` | Processing failed at some stage |

### WorkflowStatus

Execution status of a workflow.

| Value | Description |
|-------|-------------|
| `pending` | Created but not yet started |
| `in_progress` | Currently executing |
| `completed` | Successfully finished |
| `failed` | Execution failed |

### EventType

Types of automation events recorded in the audit log.

| Value | Description |
|-------|-------------|
| `request_received` | A new request was ingested into the system |
| `classification_started` | AI classification began |
| `classification_completed` | AI classification finished with results |
| `routing_started` | Workflow routing began |
| `routing_completed` | Request was successfully routed to its destination |
| `workflow_created` | A new workflow record was created |
| `workflow_updated` | A request's status or priority was manually updated |
| `action_triggered` | An automated action was executed |
| `error` | An error occurred during processing |
| `retry_requested` | A reclassification was requested |

---

## Database Indexes

Nine indexes are created for performant filtering, sorting, and lookups across the application's query patterns.

| Index Name | Table | Column | Purpose |
|-----------|-------|--------|---------|
| `idx_requests_status` | requests | status | Filter requests by lifecycle status |
| `idx_requests_category` | requests | category | Filter requests by AI category |
| `idx_requests_priority` | requests | priority | Filter requests by priority level |
| `idx_requests_createdAt` | requests | createdAt | Sort requests by creation date |
| `idx_workflows_requestId` | workflows | requestId | Look up workflows for a specific request |
| `idx_workflows_status` | workflows | status | Filter workflows by execution status |
| `idx_logs_requestId` | automation_logs | requestId | Look up logs for a specific request |
| `idx_logs_eventType` | automation_logs | eventType | Filter logs by event type |
| `idx_logs_createdAt` | automation_logs | createdAt | Sort logs by timestamp |

---

## SQL Schema

```sql
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  sourceType TEXT NOT NULL,
  sourceRef TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  rawContent TEXT NOT NULL,
  extractedData TEXT NOT NULL DEFAULT '{}',
  category TEXT,
  priority TEXT,
  confidence REAL,
  routeDestination TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL,
  workflowType TEXT NOT NULL,
  assignedQueue TEXT NOT NULL,
  actionTaken TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (requestId) REFERENCES requests(id)
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL,
  eventType TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (requestId) REFERENCES requests(id)
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_createdAt ON requests(createdAt);
CREATE INDEX IF NOT EXISTS idx_workflows_requestId ON workflows(requestId);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_logs_requestId ON automation_logs(requestId);
CREATE INDEX IF NOT EXISTS idx_logs_eventType ON automation_logs(eventType);
CREATE INDEX IF NOT EXISTS idx_logs_createdAt ON automation_logs(createdAt);
```
