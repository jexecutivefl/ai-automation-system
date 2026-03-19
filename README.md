# AI Automation Workflow System

A production-grade AI-powered automation platform that intelligently classifies, routes, and manages incoming business requests. Built as a polished SaaS demo showcasing modern full-stack development with AI integration.

## Features

- **AI-Powered Classification** — Automatic categorization of incoming requests using keyword-based mock classifier or OpenAI GPT-4o-mini
- **Intelligent Routing** — Automated workflow routing to appropriate teams (Zendesk, Salesforce, Stripe, Jira, etc.)
- **Multi-Source Ingestion** — Accept requests via webhook, web forms, email, Slack, API, and file uploads
- **Real-Time Dashboard** — Analytics overview with stats cards, category breakdown, priority distribution, and recent activity
- **Request Management** — Filterable list with search, category/status/priority filters, and pagination
- **Detailed Request View** — Full request analysis with AI classification results, extracted fields, confidence scores, and automation timeline
- **Workflow Tracking** — Complete workflow execution history with status tracking
- **Activity Log** — Comprehensive event log for full audit trail
- **Reclassification** — Retry AI classification on any request with one click
- **Demo Mode** — Built-in seed data (25+ realistic records) and testing tools
- **Webhook Endpoint** — REST API for external system integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Database | SQLite (better-sqlite3) |
| AI | OpenAI GPT-4o-mini (mock fallback) |
| Charts | Recharts |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000

# Navigate to /demo and click "Seed Demo Data" to populate the database
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `CLASSIFIER_MODE` | `mock` | Classification mode: `mock` or `openai` |
| `OPENAI_API_KEY` | _(empty)_ | OpenAI API key (required for `openai` mode) |
| `DATABASE_PATH` | `./data/automation.db` | SQLite database file location |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with sidebar
│   ├── page.tsx                  # Redirect to /dashboard
│   ├── dashboard/page.tsx        # Analytics dashboard
│   ├── requests/page.tsx         # Request list with filters
│   ├── requests/[id]/page.tsx    # Request detail with AI results
│   ├── workflows/page.tsx        # Workflow execution history
│   ├── logs/page.tsx             # Activity event log
│   ├── settings/page.tsx         # System configuration
│   ├── demo/page.tsx             # Testing & demo tools
│   └── api/                      # API routes
│       ├── webhook/route.ts      # POST - ingest external requests
│       ├── requests/route.ts     # GET/POST - list/create requests
│       ├── requests/[id]/        # GET/PATCH - request detail/update
│       ├── workflows/route.ts    # GET - list workflows
│       ├── logs/route.ts         # GET - list automation logs
│       ├── stats/route.ts        # GET - dashboard statistics
│       ├── health/route.ts       # GET - health check
│       └── seed/route.ts         # POST - seed demo data
├── lib/                          # Shared server-side code
│   ├── types.ts                  # TypeScript interfaces & enums
│   ├── db.ts                     # SQLite connection & schema
│   ├── seed.ts                   # Demo data (25+ records)
│   ├── ai-service.ts             # AI classification (mock + OpenAI)
│   └── workflow-engine.ts        # Workflow routing engine
└── components/                   # React UI components
    ├── layout/sidebar.tsx        # Navigation sidebar
    └── shared/                   # Reusable UI components
        ├── badge.tsx             # Category/status/priority badges
        ├── card.tsx              # Card wrapper
        ├── confidence-bar.tsx    # Confidence score visualization
        ├── empty-state.tsx       # Empty state placeholder
        └── timeline.tsx          # Automation event timeline
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook` | Ingest and classify external requests |
| GET | `/api/requests` | List requests (filters: category, status, priority, search) |
| POST | `/api/requests` | Submit a new request manually |
| GET | `/api/requests/[id]` | Get request detail with workflows and logs |
| PATCH | `/api/requests/[id]` | Update request status or priority |
| POST | `/api/requests/[id]/retry` | Reclassify a request |
| GET | `/api/workflows` | List workflow records |
| GET | `/api/logs` | List automation log events |
| GET | `/api/stats` | Get dashboard statistics |
| GET | `/api/health` | Health check |
| POST | `/api/seed` | Seed database with demo data |

## AI Classification

### Mock Mode (Default)
Keyword-based classification with confidence scoring. Supports 8 categories:
- Support Ticket → Zendesk
- Sales Lead → Salesforce
- Billing → Stripe
- Technical Issue → Jira
- General Inquiry → General Inbox
- Onboarding → Onboarding Team
- Document Review → Legal Review
- Urgent Escalation → Incident Response

### OpenAI Mode
Set `CLASSIFIER_MODE=openai` and provide `OPENAI_API_KEY` for GPT-4o-mini powered classification with structured data extraction.

## Data Model

**Request** — Incoming items with classification results, priority, confidence scores, and routing information

**Workflow** — Execution records tracking how requests are processed and routed to downstream systems

**AutomationLog** — Event-level audit trail recording every step in the automation pipeline

## License

MIT
