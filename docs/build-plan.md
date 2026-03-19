# Build Plan

## Overview

The AI Automation Workflow System was built in 7 phases, transforming a multi-service prototype (React + Express + Flask) into a unified Next.js monolith.

---

## Phase 0: Project Scaffolding

**Objective:** Replace the old multi-service architecture with a Next.js project foundation.

**Completed:**
- Created `package.json` with Next.js 15, React 19, Tailwind CSS 4, better-sqlite3, recharts, openai
- Set up `tsconfig.json` with path aliases (`@/*` → `./src/*`)
- Created `next.config.ts`, `postcss.config.mjs`
- Created `.env.example` with classifier mode, OpenAI key, database path
- Built complete directory scaffold under `src/`

---

## Phase 1: Data Layer

**Objective:** Persistent storage with typed data models and seed data.

**Completed:**
- `src/lib/types.ts` — TypeScript interfaces for Request, Workflow, AutomationLog, ClassificationResult, DashboardStats + enums
- `src/lib/db.ts` — SQLite singleton with auto-schema creation, WAL mode, foreign keys, 9 indexes
- `src/lib/seed.ts` — 25 realistic demo records spanning all 8 categories with matching workflows and 85+ log entries

---

## Phase 2: AI & Workflow Services

**Objective:** Classification engine and workflow routing logic.

**Completed:**
- `src/lib/ai-service.ts` — Dual-mode classifier (mock keyword matching + OpenAI GPT-4o-mini), priority determination, structured data extraction, route recommendation
- `src/lib/workflow-engine.ts` — Category-based routing to 8 destination systems, Workflow record creation, automation event logging

---

## Phase 3: API Routes

**Objective:** REST API endpoints for all CRUD and automation operations.

**Completed (9 endpoints):**
- `POST /api/webhook` — External request ingestion with full pipeline
- `GET/POST /api/requests` — List with filters + manual submission
- `GET/PATCH /api/requests/[id]` — Detail with workflows/logs + status updates
- `POST /api/requests/[id]/retry` — Reclassification
- `GET /api/workflows` — Workflow list with joins
- `GET /api/logs` — Activity log with joins
- `GET /api/stats` — Dashboard aggregates
- `GET /api/health` — Health check
- `POST /api/seed` — Database seeding

---

## Phase 4: Frontend Pages

**Objective:** Build polished, portfolio-grade UI.

**Completed (7 pages):**
- `/dashboard` — Stats cards, category breakdown, priority/status summaries, recent activity table
- `/requests` — Filterable table with search, category/status/priority filters, pagination
- `/requests/[id]` — Full detail: content, AI results, extracted fields, workflow history, automation timeline, reclassify button
- `/workflows` — Workflow table with status filter and request links
- `/logs` — Activity event log with event type filter
- `/settings` — System status, classifier modes, environment config, routing map
- `/demo` — Manual submission form, webhook tester, seed data button

**Shared Components:**
- Sidebar navigation with active state highlighting
- Badge components (category, priority, status) with color coding
- Card wrapper with title/subtitle
- Confidence bar with color-coded progress
- Empty state placeholder
- Vertical event timeline with icons

---

## Phase 5: Polish

**Objective:** Refine AI presentation and automation experience.

**Completed:**
- Confidence score visualization with color thresholds (green ≥85%, blue ≥70%, amber ≥50%, red <50%)
- Extracted fields panel with structured key-value display
- Route destination display with system name
- Automation timeline with color-coded event icons
- Retry/reclassify button on request detail page
- Mock mode indicator in sidebar
- Loading skeletons for all pages
- Error states for failed API calls
- Empty states with action prompts

---

## Phase 6: Documentation

**Objective:** Complete portfolio-ready documentation.

**Completed:**
- `README.md` — Setup, features, tech stack, API reference, project structure
- `docs/architecture.md` — System diagram, data flow, service layer, schema
- `docs/product-spec.md` — Problem statement, use cases, feature requirements
- `docs/api-contracts.md` — All 11 endpoints with request/response examples
- `docs/data-model.md` — Entity definitions, enums, indexes
- `docs/build-plan.md` — Phased execution summary
- `docs/demo-script.md` — Step-by-step demo walkthrough
- `docs/screenshots-plan.md` — Screenshot capture guide
- `docs/portfolio-description.md` — Upwork portfolio writeup
- `.env.example` — Environment variable template

---

## Phase 7: QA & Cleanup

**Objective:** Ensure stability and remove legacy code.

**Completed:**
- Removed old directories: `frontend/`, `backend/`, `api/`, `automation/`
- `next build` compiles successfully with no TypeScript errors
- All API endpoints tested and verified
- Seed data populates correctly (25 requests, 25 workflows, 85 logs)
- Full classification pipeline verified (webhook → classify → route → log)
- All pages render correctly
- Mock mode works without API keys
