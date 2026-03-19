# Architecture

## System Overview

The AI Automation Workflow System is a **Next.js 15 monolith** using the App Router architecture. It combines server-side API routes, a SQLite database, an AI classification service, and a React frontend into a single deployable application.

```
┌─────────────────────────────────────────────────────┐
│                    Next.js Application               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Frontend  │  │ API      │  │ Service Layer    │  │
│  │ (React)   │→ │ Routes   │→ │                  │  │
│  │ Dashboard │  │ /api/*   │  │ ai-service.ts    │  │
│  │ Requests  │  │          │  │ workflow-engine   │  │
│  │ Workflows │  │ webhook  │  │ db.ts (SQLite)   │  │
│  │ Logs      │  │ requests │  │ seed.ts          │  │
│  │ Settings  │  │ stats    │  │                  │  │
│  │ Demo      │  │ health   │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                      │               │
│                               ┌──────┴──────┐       │
│                               │   SQLite    │       │
│                               │ automation  │       │
│                               │    .db      │       │
│                               └─────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Data Flow

```
External Source (email, webhook, form, API)
    │
    ▼
POST /api/webhook or POST /api/requests
    │
    ├── 1. Create Request record (status: pending)
    ├── 2. Log "request_received" event
    │
    ▼
AI Classification Service (ai-service.ts)
    │
    ├── Mock mode: keyword matching + confidence scoring
    └── OpenAI mode: GPT-4o-mini structured classification
    │
    ├── 3. Log "classification_completed" event
    ├── 4. Update Request (category, priority, confidence, extractedData)
    │
    ▼
Workflow Engine (workflow-engine.ts)
    │
    ├── 5. Create Workflow record (status: in_progress)
    ├── 6. Route to appropriate handler (Zendesk, Salesforce, etc.)
    ├── 7. Update Workflow (status: completed, actionTaken)
    ├── 8. Log "routing_completed" event
    │
    ▼
Request status → "routed" → visible in Dashboard
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router (pages + API)
│   ├── layout.tsx          # Root layout with sidebar navigation
│   ├── globals.css         # Tailwind CSS imports + base styles
│   ├── dashboard/          # Analytics overview page
│   ├── requests/           # Request list + detail pages
│   ├── workflows/          # Workflow execution history
│   ├── logs/               # Activity event log
│   ├── settings/           # System configuration display
│   ├── demo/               # Testing tools + seed data management
│   └── api/                # REST API endpoints (9 routes)
├── lib/                    # Server-side business logic
│   ├── types.ts            # TypeScript interfaces + enums
│   ├── db.ts               # SQLite connection singleton + schema
│   ├── seed.ts             # 25+ realistic demo records
│   ├── ai-service.ts       # AI classification (mock + OpenAI)
│   └── workflow-engine.ts  # Workflow routing + logging
└── components/             # Shared React components
    ├── layout/             # Sidebar navigation
    └── shared/             # Badge, card, timeline, etc.
```

## Service Layer

### db.ts — Database
- Singleton `better-sqlite3` connection with WAL journal mode
- Auto-creates tables and indexes on first access
- Three tables: `requests`, `workflows`, `automation_logs`
- Foreign key constraints between tables

### ai-service.ts — AI Classification
- **Mock mode** (default): Keyword map matching across 8 categories with confidence formula: `base 0.65 + (matches - 1) * 0.08, max 0.97`
- **OpenAI mode**: GPT-4o-mini with structured JSON prompt, falls back to mock on failure
- Extracts structured data (emails, amounts, dates, company names) from request text
- Determines priority based on category + intensity keywords
- Generates route recommendations and summaries

### workflow-engine.ts — Routing
- Maps categories to destination systems (Zendesk, Salesforce, Stripe, Jira, etc.)
- Creates Workflow records in database
- Logs all events to automation_logs table
- Simulates realistic processing delays

### seed.ts — Demo Data
- 25 realistic business requests across all 8 categories
- Matching Workflow records per request
- 3-4 AutomationLog entries per request (received, classified, routed + extras)
- Timestamps spread across 7 days
- Mixed statuses (pending, classified, routed, in_progress, completed)

## Database Schema

### requests
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| sourceType | TEXT | email, web_form, slack, api, upload, support_portal |
| sourceRef | TEXT | External reference ID |
| title | TEXT | Request title |
| rawContent | TEXT | Full request content |
| extractedData | TEXT | JSON of extracted fields |
| category | TEXT | AI-assigned category |
| priority | TEXT | low, medium, high, critical |
| confidence | REAL | 0.0 - 1.0 confidence score |
| routeDestination | TEXT | Target system name |
| status | TEXT | pending, classified, routed, in_progress, completed, failed |
| createdAt | TEXT | ISO timestamp |
| updatedAt | TEXT | ISO timestamp |

### workflows
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| requestId | TEXT FK | References requests.id |
| workflowType | TEXT | Workflow category name |
| assignedQueue | TEXT | Target team/system |
| actionTaken | TEXT | Description of action |
| status | TEXT | pending, in_progress, completed, failed |
| createdAt | TEXT | ISO timestamp |
| updatedAt | TEXT | ISO timestamp |

### automation_logs
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| requestId | TEXT FK | References requests.id |
| eventType | TEXT | Event category |
| message | TEXT | Human-readable description |
| metadata | TEXT | JSON payload |
| createdAt | TEXT | ISO timestamp |

## Frontend Architecture

All pages are client-side rendered (`'use client'`) and fetch data from the API routes. Components use Tailwind CSS for styling with a professional slate/gray color palette.

### Pages
- **Dashboard** — Stats cards, category chart, priority/status breakdown, recent activity
- **Requests** — Paginated table with category/status/priority/search filters
- **Request Detail** — Full content, AI classification panel, extracted fields, workflow history, automation timeline
- **Workflows** — Filterable workflow table with request links
- **Logs** — Activity event log with event type filter
- **Settings** — System status, classifier mode, environment info, category routing map
- **Demo** — Manual submission form, webhook tester, seed data button

### Shared Components
- `badge.tsx` — Color-coded badges for categories, priorities, statuses
- `card.tsx` — Consistent card wrapper with title/subtitle
- `confidence-bar.tsx` — Visual confidence score with color-coded progress bar
- `empty-state.tsx` — Placeholder for empty data views
- `timeline.tsx` — Vertical event timeline with icons and timestamps
