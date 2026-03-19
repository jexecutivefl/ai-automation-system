# Build Plan

## Overview

The AI Automation Workflow System was built in 8 phases, transforming a multi-service prototype (React/Vite + Express + Flask) into a unified Next.js 15 monolith with a complete frontend, REST API, AI classification service, workflow engine, and embedded SQLite database.

---

## Phase 0: Project Scaffolding

**Objective:** Replace the old multi-service architecture with a clean Next.js project foundation.

**Deliverables:**
- `package.json` with Next.js 15, React 19, TypeScript, Tailwind CSS 4, better-sqlite3, openai, uuid, recharts
- `tsconfig.json` with path aliases (`@/*` maps to `./src/*`)
- `next.config.ts` with server-side external packages configuration for better-sqlite3
- `postcss.config.mjs` for Tailwind CSS integration
- `.env.example` with `CLASSIFIER_MODE`, `OPENAI_API_KEY`, and `DATABASE_PATH`
- Directory scaffold: `src/app/`, `src/lib/`, `src/components/`, `data/`, `docs/`

**Key Decision:** Consolidate from 3 separate services (Flask on port 5001, Express on port 3001, Vite on port 5173) into a single Next.js application on port 3000. This eliminates cross-service communication overhead, simplifies deployment, and removes the Python dependency.

---

## Phase 1: Data Layer

**Objective:** Build persistent storage with typed data models and realistic seed data.

**Deliverables:**
- `src/lib/types.ts` -- TypeScript interfaces for Request, Workflow, AutomationLog, ClassificationResult, DashboardStats, ApiResponse, PaginationParams, and 6 type unions (SourceType, Category, Priority, RequestStatus, WorkflowStatus, EventType)
- `src/lib/db.ts` -- SQLite singleton connection with auto-directory creation, WAL journal mode, foreign key enforcement, 3-table schema initialization, and 9 performance indexes
- `src/lib/seed.ts` -- 25 realistic demo records spanning all 8 categories with matched workflows, 75-100 log entries, staggered timestamps across 7 days, and a mix of lifecycle statuses

**Key Decision:** Use better-sqlite3 (synchronous API) rather than async SQLite drivers. Synchronous access simplifies the codebase, avoids callback complexity, and performs well for a single-user demo application.

---

## Phase 2: AI and Workflow Services

**Objective:** Implement the AI classification engine and workflow routing logic.

**Deliverables:**
- `src/lib/ai-service.ts` -- Dual-mode classifier supporting:
  - Mock mode: keyword matching against 7 category keyword lists, confidence calculation (0.65 base + 0.08 per match, capped at 0.97), priority determination with intensity keyword upgrades, regex-based data extraction (email, amount, date, company), summary generation
  - OpenAI mode: GPT-4o-mini with structured JSON system prompt, response validation and normalization, automatic fallback to mock on error
- `src/lib/workflow-engine.ts` -- Category-to-handler mapping for 8 destination systems, workflow record creation with in_progress/completed lifecycle, automation event logging (workflow_created, routing_completed), simulated processing delay (50-150ms)

**Key Decision:** The AI service abstraction uses a strategy pattern where both mock and OpenAI classifiers return the same `ClassificationResult` interface. This makes them fully interchangeable without any changes to calling code, and the fallback from OpenAI to mock is seamless.

---

## Phase 3: API Routes

**Objective:** Build the complete REST API using Next.js App Router route handlers.

**Deliverables (9 route files, 11 endpoints):**
- `POST /api/webhook` -- External ingestion with full classify-route-workflow pipeline
- `GET /api/requests` -- List with category/status/priority/search filters and pagination
- `POST /api/requests` -- Manual submission with full pipeline execution
- `GET /api/requests/[id]` -- Detail view with JOIN to workflows and automation_logs
- `PATCH /api/requests/[id]` -- Status and priority updates with audit logging
- `POST /api/requests/[id]/retry` -- Reclassification with new workflow creation
- `GET /api/workflows` -- Workflow list with status/requestId filters, joined with request title
- `GET /api/logs` -- Log list with eventType/requestId filters, joined with request title
- `GET /api/stats` -- Dashboard aggregations (totals, category/priority/status breakdowns, recent activity)
- `GET /api/health` -- Health check with classifier mode and uptime
- `POST /api/seed` -- Database reset and seeding

**Key Decision:** Use Next.js App Router conventions (route.ts files with exported HTTP method functions) rather than a separate Express server. This keeps API and frontend in the same process, enables shared TypeScript types, and simplifies deployment.

---

## Phase 4: Frontend Pages

**Objective:** Build a polished, portfolio-grade admin UI.

**Deliverables (7 pages + 6 shared components):**

Pages:
- `/dashboard` -- Stats cards (total, success rate, avg confidence, active workflows), category breakdown bars, recent activity table with auto-refresh, priority and status summaries
- `/requests` -- Searchable table with category/status/priority dropdown filters, pagination (15 per page), click-through to detail
- `/requests/[id]` -- Full detail: raw content block, AI classification card, extracted fields grid, workflow history table, automation event timeline sidebar, request metadata, reclassify button
- `/workflows` -- Workflow table with status filter, request title links, pagination (20 per page)
- `/logs` -- Activity log with color-coded event type dots, event type filter, pagination (25 per page)
- `/settings` -- Health status indicator, classifier mode badge, environment variable reference, category-to-route mapping
- `/demo` -- Manual submission form, webhook JSON editor with send button, seed data button

Shared Components:
- `Sidebar` -- Fixed 240px navigation with SVG icons, active route highlighting, classifier mode indicator
- `Card` -- Rounded container with optional title/subtitle header
- `Badge` -- Color-coded pill badges for categories, statuses, and priorities (3 components)
- `ConfidenceBar` -- Progress bar with percentage, color-coded green/amber/red by threshold
- `EmptyState` -- Centered placeholder with title, description, and optional action
- `Timeline` -- Vertical event timeline for automation log entries

---

## Phase 5: Polish

**Objective:** Refine the UI presentation and user experience.

**Deliverables:**
- Confidence score visualization with color thresholds (green at 85%+, blue at 70%+, amber at 50%+, red below 50%)
- Extracted fields displayed in a structured key-value grid
- Route destination display with system name
- Automation timeline with color-coded event icons (green for success, red for errors, amber for retries/updates)
- Loading skeletons (animated pulse placeholders) for all pages
- Error states with retry buttons for failed API calls
- Empty states with contextual calls to action (e.g., "Go to Demo Page" on empty dashboard)
- Inline classification result display on the demo page after submission
- Mock mode indicator in the sidebar footer

---

## Phase 6: Documentation

**Objective:** Create complete, portfolio-ready documentation.

**Deliverables:**
- `README.md` -- Project overview, features, tech stack, quick start, env vars, project structure, API table, AI modes, data model overview, architecture diagram
- `docs/architecture.md` -- System overview, directory structure, data flow, service layer details, API layer, frontend pages and components, database schema, AI service abstraction
- `docs/product-spec.md` -- Problem statement, target users, use cases, core and future feature requirements, page responsibilities, AI classification behavior
- `docs/api-contracts.md` -- All 11 endpoints with request/response schemas, field descriptions, error formats, and curl examples
- `docs/data-model.md` -- Entity definitions, field types and descriptions, all 6 enum types with values, relationships, database indexes, raw SQL schema
- `docs/build-plan.md` -- This document: phased execution summary with key decisions
- `docs/demo-script.md` -- 9-step walkthrough for live demonstrations
- `docs/screenshots-plan.md` -- 7 screenshots with state, highlights, and browser width specifications
- `docs/portfolio-description.md` -- Professional summary for Upwork portfolios
- `.env.example` -- Environment variable template with descriptions

---

## Phase 7: QA and Cleanup

**Objective:** Ensure stability, remove legacy artifacts, and verify all features.

**Deliverables:**
- Removed legacy directories: `frontend/`, `backend/`, `api/`, `automation/` (preserved as reference only)
- Verified `next build` compiles with no TypeScript errors
- Tested all 11 API endpoints with expected inputs and edge cases
- Verified seed data populates correctly (25 requests, 25 workflows, 75-100 logs)
- End-to-end pipeline test: webhook submission through classification, routing, workflow creation, and log entry
- Verified all 7 frontend pages render correctly with seeded data
- Verified empty states display correctly with no data
- Confirmed mock mode works without any API keys
- Confirmed OpenAI mode activates with proper environment configuration

---

## Summary

| Phase | Focus | Key Output |
|-------|-------|------------|
| 0 | Scaffolding | Next.js project structure, dependencies, configuration |
| 1 | Data Layer | Types, SQLite schema, 25-record seed data |
| 2 | AI and Workflow | Dual-mode classifier, workflow engine with 8 handlers |
| 3 | API Routes | 11 REST endpoints with filtering, pagination, error handling |
| 4 | Frontend | 7 pages, 6 shared components, sidebar navigation |
| 5 | Polish | Loading states, empty states, error handling, visual refinements |
| 6 | Documentation | 9 documentation files, README, env template |
| 7 | QA and Cleanup | Testing, legacy removal, build verification |
