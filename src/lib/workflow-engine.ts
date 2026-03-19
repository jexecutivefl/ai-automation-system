/**
 * Workflow Engine
 *
 * Ported from the JS workflow orchestrator (automation/workflow-orchestrator.js).
 * Takes a classified request, creates a Workflow record in the database,
 * routes it to the appropriate handler, and logs automation events.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Workflow } from './types';
import { getDb } from './db';

// ---------------------------------------------------------------------------
// Handler configuration
// ---------------------------------------------------------------------------

interface HandlerConfig {
  workflowType: string;
  assignedQueue: string;
  actionTaken: string;
}

const HANDLER_MAP: Record<string, HandlerConfig> = {
  support_ticket: {
    workflowType: 'Support Ticket Processing',
    assignedQueue: 'Zendesk',
    actionTaken: 'Ticket created in Zendesk and assigned to support agent for resolution.',
  },
  sales_lead: {
    workflowType: 'Sales Lead Routing',
    assignedQueue: 'Salesforce',
    actionTaken: 'Lead added to Salesforce CRM pipeline and assigned to sales representative.',
  },
  billing: {
    workflowType: 'Billing Processing',
    assignedQueue: 'Stripe',
    actionTaken: 'Billing item routed to Stripe billing team for processing.',
  },
  technical_issue: {
    workflowType: 'Technical Issue Triage',
    assignedQueue: 'Jira',
    actionTaken: 'Issue created in Jira engineering board and prioritized for review.',
  },
  general_inquiry: {
    workflowType: 'General Inquiry Handling',
    assignedQueue: 'General Inbox',
    actionTaken: 'Inquiry routed to general inbox for team review and response.',
  },
  onboarding: {
    workflowType: 'Onboarding Workflow',
    assignedQueue: 'Onboarding Team',
    actionTaken: 'Onboarding request assigned to onboarding specialist for setup assistance.',
  },
  document_review: {
    workflowType: 'Document Review Pipeline',
    assignedQueue: 'Legal Review',
    actionTaken: 'Document sent to legal review queue for compliance evaluation.',
  },
  urgent_escalation: {
    workflowType: 'Urgent Escalation Protocol',
    assignedQueue: 'Incident Response',
    actionTaken: 'Escalated to incident response team for immediate attention.',
  },
};

const DEFAULT_HANDLER: HandlerConfig = {
  workflowType: 'General Inquiry Handling',
  assignedQueue: 'General Inbox',
  actionTaken: 'Request routed to general inbox for review.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logEvent(
  db: ReturnType<typeof getDb>,
  eventType: string,
  requestId: string,
  workflowId: string,
  details: Record<string, unknown>,
): void {
  const stmt = db.prepare(`
    INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    uuidv4(),
    requestId,
    eventType,
    `${eventType} for workflow ${workflowId}`,
    JSON.stringify({ workflowId, ...details }),
    new Date().toISOString(),
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Executes a workflow for a classified request.
 *
 * 1. Determines the workflow type and assigned queue based on category
 * 2. Creates a Workflow record in SQLite (status: 'in_progress')
 * 3. Logs a 'workflow_created' event
 * 4. Simulates processing with a brief delay (50-150ms)
 * 5. Generates a human-readable actionTaken description
 * 6. Updates the Workflow to 'completed'
 * 7. Logs a 'routing_completed' event
 * 8. Returns the completed Workflow
 */
export async function executeWorkflow(
  requestId: string,
  category: string,
  data: Record<string, unknown>,
): Promise<Workflow> {
  const db = getDb();
  const handler = HANDLER_MAP[category] || DEFAULT_HANDLER;
  const workflowId = uuidv4();
  const now = new Date().toISOString();

  // Step 1: Create workflow record in 'in_progress' state
  const insertStmt = db.prepare(`
    INSERT INTO workflows (id, requestId, workflowType, assignedQueue, status, actionTaken, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    workflowId,
    requestId,
    handler.workflowType,
    handler.assignedQueue,
    'in_progress',
    '',
    now,
    now,
  );

  // Step 2: Log workflow creation
  logEvent(db, 'workflow_created', requestId, workflowId, {
    category,
    workflowType: handler.workflowType,
    assignedQueue: handler.assignedQueue,
  });

  // Step 3: Simulate processing delay (50-150ms)
  const processingTime = Math.floor(Math.random() * 100) + 50;
  await delay(processingTime);

  // Step 4: Update workflow to completed
  const completedAt = new Date().toISOString();

  const updateStmt = db.prepare(`
    UPDATE workflows
    SET status = ?, actionTaken = ?, updatedAt = ?
    WHERE id = ?
  `);

  updateStmt.run('completed', handler.actionTaken, completedAt, workflowId);

  // Step 5: Log routing completed
  logEvent(db, 'routing_completed', requestId, workflowId, {
    category,
    actionTaken: handler.actionTaken,
    processingTimeMs: processingTime,
  });

  // Step 6: Return the completed workflow
  const workflow: Workflow = {
    id: workflowId,
    requestId,
    workflowType: handler.workflowType,
    assignedQueue: handler.assignedQueue,
    status: 'completed',
    actionTaken: handler.actionTaken,
    createdAt: now,
    updatedAt: completedAt,
  };

  return workflow;
}
