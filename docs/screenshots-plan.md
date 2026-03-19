# Screenshots Plan

Screenshots to capture for the portfolio. These images will be used in the README, Upwork profile, and any case study or presentation materials.

All screenshots should be captured at **1440x900** browser resolution with the sidebar visible and the application fully seeded with demo data.

---

## Preparation

1. Run `npm run dev`
2. Navigate to `/demo` and click **Seed Demo Data**
3. Set your browser window to 1440x900 (use browser DevTools to set exact viewport, or resize manually)
4. Ensure the sidebar is visible in all captures
5. Use browser DevTools screenshot or OS screen capture for clean output
6. Save as PNG with the naming convention: `screenshot-01-dashboard.png`, `screenshot-02-requests.png`, etc.

---

## Screenshot 1: Dashboard Overview

**Page:** `/dashboard`

**State:** Fully seeded with 25 records. All stats cards populated, category breakdown showing distribution across all 8 categories, recent activity table showing 10 requests with various categories, priorities, and statuses.

**What to highlight:**
- The 4 stats cards at the top (Total Requests: 25, Success Rate: ~64%, Avg Confidence: ~90%, Active Workflows)
- The category breakdown bar chart on the right showing all 8 categories
- The recent activity table with color-coded badges for category, priority, and status
- The priority and status summary sections at the bottom

**Browser width:** 1440px

**Why this matters:** This is the hero screenshot. It demonstrates the analytical dashboard capability and shows the system handling real-world volume with diverse categorizations. This is the first image a viewer will see.

---

## Screenshot 2: Requests List with Filters Active

**Page:** `/requests`

**State:** Apply a filter -- either select "Billing" from the category dropdown or "High" from the priority dropdown. The filtered table should show 4-8 results.

**What to highlight:**
- The filter bar at the top with the active filter visually selected
- The table columns: Title, Source, Category badge, Priority badge, Confidence bar, Status badge, Date
- The variety of source types (email, web_form, support_portal, slack)
- Pagination controls at the bottom

**Browser width:** 1440px

**Why this matters:** Demonstrates the filterable, searchable data management interface. Shows that the system handles real data with structured classification results.

---

## Screenshot 3: Request Detail Page with AI Classification Result

**Page:** `/requests/[id]` -- Choose the "Production database is down - all services affected" request (urgent_escalation, critical priority, 97% confidence)

**State:** Full detail page loaded. Scroll position should show the header, raw content, and AI classification result card all visible.

**What to highlight:**
- The header with title, status badge (completed), category badge (urgent_escalation), priority badge (critical)
- The AI Classification Result card showing: Category, Priority, Confidence Score bar (97% in green), Route Destination (Incident Response)
- The extracted fields grid showing severity, service name, impact percentage, failover status
- The "Reclassify" button in the top right

**Browser width:** 1440px

**Why this matters:** This is the most impressive page. It shows the full output of the AI classification pipeline: what category was assigned, how confident the system is, what structured data was extracted, and where the request was routed. The high confidence and critical priority make this a compelling example.

---

## Screenshot 4: Workflows Page

**Page:** `/workflows`

**State:** Fully seeded, no filters applied. Show the full list of 25 workflows.

**What to highlight:**
- The table columns: Request title, Workflow Type, Queue (badge), Action Taken, Status, Date
- The variety of workflow types (Support Ticket Processing, Sales Lead Routing, Billing Processing, Technical Issue Triage, etc.)
- The variety of assigned queues (Zendesk, Salesforce, Jira, Stripe, Incident Response, Legal Review, Onboarding Team)
- Color-coded status badges showing a mix of completed, in_progress, and pending

**Browser width:** 1440px

**Why this matters:** Shows the automated routing system routing to multiple real-world destination systems. Demonstrates that the workflow engine handles different categories differently.

---

## Screenshot 5: Activity Log Page

**Page:** `/logs`

**State:** Fully seeded, no filters applied. The log should show 85+ events.

**What to highlight:**
- Timestamp column with exact times
- Color-coded event type dots (green for classification_completed/routing_completed, red for error, amber for retry_requested)
- Event type labels (Request Received, Classification Completed, Routing Completed, Error, Retry Requested)
- Request title links
- Message descriptions

**Browser width:** 1440px

**Why this matters:** Demonstrates the comprehensive audit trail. Every automation step is logged with timestamps and metadata -- critical for compliance, debugging, and operational visibility.

---

## Screenshot 6: Demo and Testing Page

**Page:** `/demo`

**State:** After submitting a test request. The manual submission form should show the green success result with classification details (category badge, priority badge, confidence bar, route destination). The form fields can be empty (cleared after submission).

**What to highlight:**
- The manual submission form on the left (title, content, source type fields)
- The green success card showing the classification result: Category, Priority, Confidence, Route, "View Full Details" link
- The webhook test panel on the right with the JSON editor
- The Seed Demo Data button at the bottom right

**Browser width:** 1440px

**Why this matters:** Shows the interactive testing capability. A user can submit any text and immediately see how the AI classifies it -- this is the "wow moment" of the demo.

---

## Screenshot 7: Settings Page

**Page:** `/settings`

**State:** Default mock mode. The health check should show "healthy" with a green dot.

**What to highlight:**
- System Status card: green health dot, "mock" classifier mode badge, uptime
- AI Classification Engine card: descriptions of Mock Mode and OpenAI Mode
- Environment Variables card: CLASSIFIER_MODE, OPENAI_API_KEY, DATABASE_PATH with defaults
- Supported Categories card: all 8 categories in a grid with their route destinations

**Browser width:** 1440px

**Why this matters:** Shows the configurability of the system. Demonstrates that the AI mode can be switched between mock and OpenAI, and shows the complete category-to-route mapping.

---

## Screenshot Order and Usage

| # | Screenshot | Primary Use |
|---|-----------|-------------|
| 1 | Dashboard Overview | README hero image, portfolio thumbnail, first impression |
| 2 | Requests List (filtered) | Feature showcase, data management capability |
| 3 | Request Detail with AI Results | Technical depth, AI capability demonstration |
| 4 | Workflows Page | Automation and routing capability |
| 5 | Activity Log | Audit trail and operational monitoring |
| 6 | Demo Page (with result) | Interactive demo, "wow moment" |
| 7 | Settings Page | Configuration and system architecture |

---

## Additional Tips

- **Clean browser:** Use incognito mode or a clean browser profile to avoid extension icons or other distractions
- **No personal data:** Ensure no personal bookmarks, tabs, or identifiers are visible
- **Consistent timing:** Seed the data fresh before capturing so timestamps look recent and realistic
- **High quality:** Capture at 2x resolution (Retina) if possible for sharp portfolio images
- **Crop carefully:** Include the full sidebar and page content, but crop out the browser chrome (address bar, tabs) for a cleaner look
