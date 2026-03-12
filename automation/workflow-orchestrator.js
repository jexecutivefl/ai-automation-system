/**
 * WorkflowOrchestrator — routes classified items to the appropriate
 * downstream system and keeps an internal execution log.
 *
 * @module workflow-orchestrator
 */

'use strict';

/**
 * @typedef {Object} RouteResult
 * @property {string}  handler     - Name of the system that handled the item.
 * @property {string}  status      - "completed" or "failed".
 * @property {string}  processedAt - ISO-8601 timestamp of completion.
 * @property {string}  details     - Human-readable summary of what happened.
 */

/**
 * @typedef {Object} OrchestratorStats
 * @property {number} totalProcessed             - Total items routed.
 * @property {number} successCount               - Items that completed successfully.
 * @property {number} failureCount               - Items that failed.
 * @property {number} successRate                - Success ratio (0–1).
 * @property {Object.<string, number>} classificationBreakdown
 *   Count of items routed per classification category.
 */

/**
 * Creates a small async delay to simulate real system latency.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build the default set of routing handlers.
 *
 * Each handler is an async function that accepts arbitrary `data`,
 * simulates a short processing delay, and returns a {@link RouteResult}.
 *
 * @returns {Object.<string, function(Object): Promise<RouteResult>>}
 */
function createDefaultHandlers() {
  return {
    /**
     * Routes a support ticket to Zendesk.
     *
     * @param {Object} data - Ticket payload.
     * @returns {Promise<RouteResult>}
     */
    support_ticket: async (data) => {
      await delay(150);
      return {
        handler: 'Zendesk',
        status: 'completed',
        processedAt: new Date().toISOString(),
        details: `Support ticket routed to Zendesk. Subject: ${data.subject || 'N/A'}`,
      };
    },

    /**
     * Routes a sales lead to Salesforce CRM.
     *
     * @param {Object} data - Lead payload.
     * @returns {Promise<RouteResult>}
     */
    sales_lead: async (data) => {
      await delay(200);
      return {
        handler: 'Salesforce',
        status: 'completed',
        processedAt: new Date().toISOString(),
        details: `Sales lead routed to Salesforce CRM. Contact: ${data.contact || 'N/A'}`,
      };
    },

    /**
     * Routes a billing item to Stripe.
     *
     * @param {Object} data - Billing payload.
     * @returns {Promise<RouteResult>}
     */
    billing: async (data) => {
      await delay(100);
      return {
        handler: 'Stripe',
        status: 'completed',
        processedAt: new Date().toISOString(),
        details: `Billing item routed to Stripe. Amount: ${data.amount || 'N/A'}`,
      };
    },

    /**
     * Routes a technical issue to the Jira engineering queue.
     *
     * @param {Object} data - Issue payload.
     * @returns {Promise<RouteResult>}
     */
    technical_issue: async (data) => {
      await delay(250);
      return {
        handler: 'Jira',
        status: 'completed',
        processedAt: new Date().toISOString(),
        details: `Technical issue routed to Jira engineering queue. Priority: ${data.priority || 'normal'}`,
      };
    },

    /**
     * Routes a general inquiry to the shared inbox.
     *
     * @param {Object} data - Inquiry payload.
     * @returns {Promise<RouteResult>}
     */
    general_inquiry: async (data) => {
      await delay(120);
      return {
        handler: 'General Inbox',
        status: 'completed',
        processedAt: new Date().toISOString(),
        details: `General inquiry routed to shared inbox. Topic: ${data.topic || 'N/A'}`,
      };
    },
  };
}

/**
 * Orchestrates the routing of classified items to downstream systems.
 *
 * @example
 * const orchestrator = new WorkflowOrchestrator();
 * const result = await orchestrator.route('billing', { amount: 49.99 });
 * console.log(result);
 * // { handler: 'Stripe', status: 'completed', processedAt: '...', details: '...' }
 */
class WorkflowOrchestrator {
  /**
   * Creates a new WorkflowOrchestrator instance.
   *
   * @param {Object} [workflowRules] - Optional map of classification names to
   *   async handler functions. Provided handlers are merged on top of the
   *   built-in defaults, so you can override individual routes without
   *   losing the others.
   */
  constructor(workflowRules) {
    /** @type {Object.<string, function(Object): Promise<RouteResult>>} */
    this.handlers = {
      ...createDefaultHandlers(),
      ...(workflowRules || {}),
    };

    /** @type {Array<Object>} */
    this.executionLog = [];
  }

  /**
   * Routes an item to the handler registered for `classification`.
   *
   * If no handler matches, a default handler is used that acknowledges
   * receipt and routes to a generic queue.
   *
   * @param {string} classification - The category key (e.g. "billing").
   * @param {Object} [data={}]      - Arbitrary payload forwarded to the handler.
   * @returns {Promise<RouteResult>} The result produced by the handler.
   */
  async route(classification, data = {}) {
    const handler = this.handlers[classification] || this._defaultHandler;
    const startTime = Date.now();

    let result;
    try {
      result = await handler(data);
    } catch (err) {
      result = {
        handler: 'Unknown',
        status: 'failed',
        processedAt: new Date().toISOString(),
        details: `Handler error: ${err.message}`,
      };
    }

    const logEntry = {
      classification,
      data,
      result,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    this.executionLog.push(logEntry);
    return result;
  }

  /**
   * Fallback handler used when no registered handler matches the
   * requested classification.
   *
   * @param {Object} data - Payload forwarded from {@link route}.
   * @returns {Promise<RouteResult>}
   * @private
   */
  async _defaultHandler(data) {
    await delay(100);
    return {
      handler: 'Default Queue',
      status: 'completed',
      processedAt: new Date().toISOString(),
      details: `Unrecognised classification routed to default queue. Data keys: ${Object.keys(data).join(', ') || 'none'}`,
    };
  }

  /**
   * Returns the full execution log.
   *
   * Each entry contains the classification, input data, handler result,
   * processing duration, and timestamp.
   *
   * @returns {Array<Object>} The execution log array.
   */
  getExecutionLog() {
    return this.executionLog;
  }

  /**
   * Returns aggregate statistics about all routing operations performed
   * since the orchestrator was created (or since the last {@link clearLog}).
   *
   * @returns {OrchestratorStats}
   */
  getStats() {
    const totalProcessed = this.executionLog.length;
    const successCount = this.executionLog.filter(
      (entry) => entry.result.status === 'completed'
    ).length;
    const failureCount = totalProcessed - successCount;

    const classificationBreakdown = {};
    for (const entry of this.executionLog) {
      const key = entry.classification;
      classificationBreakdown[key] = (classificationBreakdown[key] || 0) + 1;
    }

    return {
      totalProcessed,
      successCount,
      failureCount,
      successRate: totalProcessed === 0 ? 0 : successCount / totalProcessed,
      classificationBreakdown,
    };
  }

  /**
   * Clears the execution log and resets all statistics.
   */
  clearLog() {
    this.executionLog = [];
  }
}

module.exports = { WorkflowOrchestrator };
