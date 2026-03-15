'use strict';

const { WorkflowOrchestrator } = require('./workflow-orchestrator');

describe('WorkflowOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  // ---- Routing to correct handlers ----------------------------------------

  test('routes support_ticket to Zendesk', async () => {
    const result = await orchestrator.route('support_ticket', { subject: 'Login issue' });
    expect(result.handler).toBe('Zendesk');
    expect(result.status).toBe('completed');
    expect(result.details).toContain('Zendesk');
  });

  test('routes sales_lead to Salesforce', async () => {
    const result = await orchestrator.route('sales_lead', { contact: 'john@example.com' });
    expect(result.handler).toBe('Salesforce');
    expect(result.status).toBe('completed');
    expect(result.details).toContain('john@example.com');
  });

  test('routes billing to Stripe', async () => {
    const result = await orchestrator.route('billing', { amount: 49.99 });
    expect(result.handler).toBe('Stripe');
    expect(result.status).toBe('completed');
    expect(result.details).toContain('49.99');
  });

  test('routes technical_issue to Jira', async () => {
    const result = await orchestrator.route('technical_issue', { priority: 'high' });
    expect(result.handler).toBe('Jira');
    expect(result.status).toBe('completed');
    expect(result.details).toContain('high');
  });

  test('routes general_inquiry to General Inbox', async () => {
    const result = await orchestrator.route('general_inquiry', { topic: 'hours' });
    expect(result.handler).toBe('General Inbox');
    expect(result.status).toBe('completed');
  });

  test('routes unknown classification to Default Queue', async () => {
    const result = await orchestrator.route('something_unknown', { foo: 'bar' });
    expect(result.handler).toBe('Default Queue');
    expect(result.status).toBe('completed');
  });

  // ---- Error handling ------------------------------------------------------

  test('returns failed status when handler throws', async () => {
    const broken = new WorkflowOrchestrator({
      billing: async () => { throw new Error('Stripe is down'); },
    });
    const result = await broken.route('billing', {});
    expect(result.status).toBe('failed');
    expect(result.details).toContain('Stripe is down');
  });

  // ---- Execution log -------------------------------------------------------

  test('getExecutionLog accumulates entries', async () => {
    await orchestrator.route('billing', {});
    await orchestrator.route('sales_lead', {});
    const log = orchestrator.getExecutionLog();
    expect(log).toHaveLength(2);
    expect(log[0].classification).toBe('billing');
    expect(log[1].classification).toBe('sales_lead');
  });

  test('log entries contain duration and timestamp', async () => {
    await orchestrator.route('billing', {});
    const entry = orchestrator.getExecutionLog()[0];
    expect(entry).toHaveProperty('durationMs');
    expect(entry).toHaveProperty('timestamp');
    expect(typeof entry.durationMs).toBe('number');
  });

  // ---- Stats ---------------------------------------------------------------

  test('getStats returns correct breakdown', async () => {
    await orchestrator.route('billing', {});
    await orchestrator.route('billing', {});
    await orchestrator.route('sales_lead', {});
    const stats = orchestrator.getStats();
    expect(stats.totalProcessed).toBe(3);
    expect(stats.successCount).toBe(3);
    expect(stats.failureCount).toBe(0);
    expect(stats.successRate).toBe(1);
    expect(stats.classificationBreakdown).toEqual({ billing: 2, sales_lead: 1 });
  });

  test('getStats counts failures correctly', async () => {
    const broken = new WorkflowOrchestrator({
      billing: async () => { throw new Error('fail'); },
    });
    await broken.route('billing', {});
    await broken.route('sales_lead', {});
    const stats = broken.getStats();
    expect(stats.failureCount).toBe(1);
    expect(stats.successCount).toBe(1);
  });

  // ---- clearLog ------------------------------------------------------------

  test('clearLog resets execution log and stats', async () => {
    await orchestrator.route('billing', {});
    orchestrator.clearLog();
    expect(orchestrator.getExecutionLog()).toHaveLength(0);
    expect(orchestrator.getStats().totalProcessed).toBe(0);
  });
});
