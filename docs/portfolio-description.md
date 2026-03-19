# Portfolio Description

## AI Automation Workflow System

**One-line:** A full-stack AI-powered platform that automatically classifies, routes, and tracks business requests from any source.

---

## The Problem

Businesses receive hundreds of incoming requests daily from multiple channels — support emails, web forms, Slack messages, API calls, uploaded documents. Manually reading, categorizing, prioritizing, and routing each request to the right team is slow, inconsistent, and doesn't scale.

## The Solution

I built an AI automation platform that handles the entire request lifecycle:

1. **Receives** requests from any source (webhooks, forms, APIs)
2. **Classifies** them using AI into 8 business categories (support, sales, billing, technical, etc.)
3. **Extracts** structured data (emails, amounts, company names, dates)
4. **Assigns** priority levels based on content analysis
5. **Routes** automatically to the right team or system (Zendesk, Salesforce, Stripe, Jira)
6. **Tracks** every step with a complete audit trail
7. **Displays** results in a polished admin dashboard

---

## Technical Highlights

- **Next.js 15 App Router** — Modern React server components architecture with API routes
- **TypeScript** — End-to-end type safety from database to UI
- **AI Service Abstraction** — Dual-mode classifier supporting mock (keyword-based) and OpenAI GPT-4o-mini
- **SQLite** — Zero-config persistent storage with better-sqlite3, WAL mode, foreign keys, and indexed queries
- **Tailwind CSS 4** — Professional enterprise UI with consistent design system
- **RESTful API** — 11 endpoints with pagination, filtering, and proper error handling
- **Workflow Engine** — Category-based routing with configurable handlers and event logging

## Key Features

- Real-time analytics dashboard with category, priority, and status breakdowns
- Filterable request management with search and multi-dimension filters
- Detailed request view with AI classification results, confidence visualization, and extracted fields
- Automated workflow routing to 8 destination systems
- Complete automation event timeline with audit trail
- Webhook endpoint for external system integration
- Manual request submission and classification testing
- One-click reclassification
- Demo data seeding (25+ realistic business records)

## Technologies Used

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15, React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Database | SQLite (better-sqlite3) |
| AI | OpenAI GPT-4o-mini, keyword classifier |
| Charts | Recharts |
| Runtime | Node.js |

## Architecture Decisions

- **Monolith over microservices** — Simpler deployment, lower operational overhead, perfect for a SaaS MVP
- **SQLite over PostgreSQL** — Zero-config development, single-file database, easy to demo and distribute
- **App Router over Pages Router** — Latest Next.js patterns with server components and file-based API routes
- **Mock classifier as default** — Demo works without any API keys; drop-in OpenAI upgrade available
- **Service layer pattern** — Clean separation between API routes, business logic, and data access

## What This Demonstrates

- Full-stack application development (frontend + backend + database)
- AI/ML integration in production applications
- Webhook and API design for external system integration
- Clean, modular code architecture
- Professional UI/UX design for internal tools
- Database schema design with proper indexing and relationships
- TypeScript best practices with strict typing
- Documentation and project organization

---

## Client Relevance

This project demonstrates the ability to build:
- **AI automation systems** — Request classification, data extraction, intelligent routing
- **Business workflow software** — Multi-step processing pipelines with status tracking
- **OpenAI / Claude integrations** — Abstracted AI service with fallback modes
- **Webhook and API-based automations** — RESTful endpoints for external system integration
- **Internal dashboards** — Real-time analytics with filtering and drill-down capabilities
- **Scalable SaaS-style applications** — Clean architecture ready for production deployment
