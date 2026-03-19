# Portfolio Description

## Project Title

**AI Automation Workflow System**

## One-Line Summary

A production-grade AI-powered platform that automatically classifies, routes, and tracks incoming business requests across multiple channels using intelligent classification and workflow automation.

---

## The Problem

Organizations receive high volumes of incoming requests from multiple channels -- emails, web forms, Slack messages, support portals, API calls -- and must manually read, classify, prioritize, and route each one to the correct team. This manual triage process creates several critical problems:

- **Slow response times** -- Requests sit in shared inboxes waiting for human review
- **Inconsistent routing** -- Different operators classify the same type of request differently
- **No audit trail** -- There is no systematic record of how or why a request was handled a particular way
- **Linear scaling cost** -- The only way to handle more volume is to hire more people

---

## The Solution

I built an AI automation platform that handles the entire request lifecycle:

1. **Receives** requests from any source (webhooks, web forms, APIs, email, Slack, support portals)
2. **Classifies** them using AI into 8 business categories (support tickets, sales leads, billing, technical issues, onboarding, document review, urgent escalations, general inquiries)
3. **Extracts** structured data (emails, dollar amounts, dates, company names) from unstructured text
4. **Assigns** priority levels (low, medium, high, critical) based on category defaults and content intensity
5. **Routes** automatically to the appropriate team or system (Zendesk, Salesforce, Stripe, Jira, Incident Response, Legal Review, etc.)
6. **Executes workflows** with tracked actions, assigned queues, and completion status
7. **Logs every event** in an immutable audit trail with timestamps and metadata
8. **Displays** results in a polished admin dashboard with analytics, filtering, and detail views

---

## Technical Highlights

- **Next.js 15 App Router** -- Full-stack monolith using the latest Next.js architecture with server-side API route handlers and client-side React pages in a single deployable unit
- **React 19 with TypeScript** -- End-to-end type safety from database queries through API responses to UI components, with modern hooks and efficient re-rendering patterns
- **Dual-mode AI classification** -- Strategy pattern supporting keyword-based mock classification (zero external dependencies) and OpenAI GPT-4o-mini (production-grade), with automatic fallback on error
- **SQLite with better-sqlite3** -- Embedded database with WAL journal mode for concurrent reads, foreign key enforcement, and 9 performance indexes across 3 normalized tables
- **Tailwind CSS 4** -- Professional enterprise UI with a consistent slate/blue design system, color-coded badges, confidence visualization bars, and event timelines
- **RESTful API** -- 11 endpoints with proper pagination, multi-dimension filtering, search, consistent error responses, and audit logging
- **Workflow engine** -- Category-based routing to 8 destination systems with configurable handlers, automatic workflow creation, and event logging
- **25-record seed dataset** -- Realistic business scenarios across all categories with matching workflows and 85+ audit log entries, seeded with one click

---

## Key Features

- Real-time analytics dashboard with stats cards, category breakdown chart, priority/status summaries, and auto-refreshing recent activity feed
- Filterable request management with search, category/status/priority dropdown filters, and pagination
- Detailed request view with AI classification results, confidence score visualization, extracted fields grid, workflow history table, and automation event timeline
- Automated workflow routing to 8 destination systems (Zendesk, Salesforce, Jira, Stripe, Incident Response, Legal Review, Onboarding Team, General Inbox)
- Complete automation event audit trail with timestamps, event types, and contextual metadata
- Webhook API endpoint for external system integration (monitoring tools, email parsers, CRM systems)
- Manual request submission form with inline classification result display
- Webhook JSON tester with editable payload and raw response display
- One-click reclassification triggering fresh AI analysis and new workflow execution
- One-click database seeding with 25 realistic demo records
- System settings page with health monitoring, classifier mode display, and configuration reference
- Loading skeletons, error states, and empty states with contextual calls to action

---

## Technologies Used

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via better-sqlite3 |
| AI | OpenAI GPT-4o-mini + keyword-based mock classifier |
| IDs | uuid v4 |

---

## Architecture Decisions

- **Monolith over microservices** -- The original prototype used Flask + Express + Vite as separate services. Consolidating into Next.js eliminates cross-service communication, shares TypeScript types, and simplifies deployment to a single `npm run dev` command
- **SQLite over PostgreSQL** -- Zero-configuration embedded database that runs anywhere Node.js runs. No server to install, no connection strings, no Docker containers. The 3-table schema performs well within SQLite capabilities
- **App Router over Pages Router** -- Latest Next.js architecture with file-based routing, React Server Components compatibility, and route handlers (replacing separate API framework)
- **Mock classifier as default** -- The system works completely offline with no API keys. The mock classifier is not a placeholder -- it includes confidence scoring, priority escalation, and structured data extraction. OpenAI integration is a one-variable upgrade
- **Service layer pattern** -- Clean separation between API routes (request handling), AI service (classification logic), workflow engine (routing and actions), and database access (queries and schema). Each module has a single responsibility and well-defined interface

---

## What This Demonstrates

### Full-Stack Development
Complete application from database schema design to REST API implementation to polished frontend, with consistent TypeScript types flowing through every layer.

### AI Integration
Practical AI integration with a well-defined abstraction layer. The mock/OpenAI dual-mode pattern shows how to build AI features that work without vendor lock-in and degrade gracefully when external services are unavailable.

### System Design
Clean service layer architecture with single-responsibility modules. The separation between AI classification, workflow execution, database access, and API routing demonstrates enterprise-grade code organization.

### API Design
11 REST endpoints with consistent error handling, pagination, multi-dimension filtering, search, and standardized response formats. The webhook endpoint demonstrates external integration capability.

### Data Modeling
Normalized relational schema with appropriate foreign keys, indexes, and typed enums. The 25-record seed dataset demonstrates realistic business scenarios across all categories.

### UI/UX Design
Professional admin interface with analytics dashboard, filterable tables, detail views, confidence visualizations, event timelines, loading skeletons, error states, and empty states. The design system uses consistent spacing, typography, and color coding throughout.

### Automation Engineering
End-to-end automation pipeline: multi-channel ingestion, AI classification, priority assignment, structured data extraction, workflow routing, and immutable audit logging.

### Documentation
Comprehensive technical documentation including architecture diagrams, API contracts with curl examples, data model specifications, build phase summaries, demo scripts, and screenshot capture guides.

---

## Client Relevance

This project demonstrates the ability to build:

- **AI automation systems** -- Request classification, structured data extraction, intelligent routing
- **Business workflow software** -- Multi-step processing pipelines with status tracking and audit trails
- **OpenAI / LLM integrations** -- Abstracted AI service with production fallback modes
- **Webhook and API-based automations** -- RESTful endpoints for external system integration
- **Internal admin dashboards** -- Real-time analytics with filtering, search, and drill-down capabilities
- **SaaS-style applications** -- Clean architecture, professional UI, and comprehensive documentation
