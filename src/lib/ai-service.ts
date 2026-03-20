/**
 * AI Classification Service
 *
 * Ported from the Python classification API (api/classification-api.py).
 * Supports two modes:
 *   - mock  : keyword-based classification (default)
 *   - openai: uses OpenAI gpt-4o-mini for classification
 */

import type { Category, ClassificationResult, Priority } from './types';

// ---------------------------------------------------------------------------
// Category keyword definitions
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  support_ticket: [
    'help', 'issue', 'problem', 'broken', 'not working', 'complaint',
    'refund', 'support', 'bug report', 'assistance',
  ],
  sales_lead: [
    'interested', 'pricing', 'quote', 'demo', 'buy', 'purchase',
    'plan', 'enterprise', 'proposal', 'partnership',
  ],
  billing: [
    'invoice', 'payment', 'charge', 'subscription', 'billing',
    'receipt', 'refund', 'upgrade', 'downgrade', 'renewal',
  ],
  technical_issue: [
    'error', 'bug', 'crash', 'server', 'api', 'timeout', '500',
    'database', 'memory', 'ssl', 'latency', 'deployment',
  ],
  onboarding: [
    'onboard', 'setup', 'new team', 'access', 'configure', 'sso',
    'integration', 'getting started',
  ],
  document_review: [
    'contract', 'compliance', 'document', 'review', 'legal', 'terms',
    'agreement', 'audit',
  ],
  urgent_escalation: [
    'urgent', 'emergency', 'critical', 'down', 'breach', 'outage',
    'security', 'incident', 'immediately',
  ],
};

const DEFAULT_CATEGORY: Category = 'general_inquiry';

const SUPPORTED_CATEGORIES = [
  ...Object.keys(CATEGORY_KEYWORDS),
  DEFAULT_CATEGORY,
];

// ---------------------------------------------------------------------------
// Route recommendation mapping
// ---------------------------------------------------------------------------

const ROUTE_MAP: Record<string, string> = {
  support_ticket: 'Zendesk Support Queue',
  sales_lead: 'Salesforce CRM Pipeline',
  billing: 'Stripe Billing Team',
  technical_issue: 'Jira Engineering Board',
  general_inquiry: 'General Inbox',
  onboarding: 'Onboarding Team Queue',
  document_review: 'Legal Review Queue',
  urgent_escalation: 'Incident Response Team',
};

// ---------------------------------------------------------------------------
// Priority mapping
// ---------------------------------------------------------------------------

const PRIORITY_MAP: Record<string, string> = {
  urgent_escalation: 'critical',
  technical_issue: 'high',
  support_ticket: 'medium',
  billing: 'medium',
  sales_lead: 'low',
  onboarding: 'low',
  document_review: 'low',
  general_inquiry: 'low',
};

const INTENSITY_KEYWORDS = [
  'urgent', 'emergency', 'critical', 'immediately', 'asap',
  'down', 'outage', 'breach', 'security',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractData(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  const amountMatch = text.match(/\$[\d,]+(?:\.\d{2})?/);
  if (amountMatch) result.amount = amountMatch[0];

  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/);
  if (dateMatch) result.date = dateMatch[0];

  // Simple company name heuristic: look for capitalized multi-word sequences
  // after "company", "from", "at"
  const companyMatch = text.match(
    /(?:company|from|at)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/
  );
  if (companyMatch) result.company = companyMatch[1];

  return result;
}

function generateSummary(text: string, category: string): string {
  const truncated = text.length > 80 ? text.slice(0, 80).trim() + '...' : text;
  const categoryLabel = category.replace(/_/g, ' ');
  return `${categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)} request: ${truncated}`;
}

function determinePriority(category: string, text: string): Priority {
  const levels: Priority[] = ['low', 'medium', 'high', 'critical'];
  let priority: Priority = (PRIORITY_MAP[category] as Priority) || 'low';

  // Upgrade priority if intensity keywords are present
  const textLower = text.toLowerCase();
  const intensityCount = INTENSITY_KEYWORDS.filter((kw) => textLower.includes(kw)).length;

  if (intensityCount >= 2 && priority !== 'critical') {
    const currentIdx = levels.indexOf(priority);
    if (currentIdx < levels.length - 1) {
      priority = levels[currentIdx + 1];
    }
  }

  return priority;
}

// ---------------------------------------------------------------------------
// Mock classifier
// ---------------------------------------------------------------------------

function mockClassify(text: string, title?: string): ClassificationResult {
  const combined = title ? `${title} ${text}` : text;
  const textLower = combined.toLowerCase();

  const matchCounts: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const count = keywords.filter((kw) => textLower.includes(kw)).length;
    if (count > 0) {
      matchCounts[category] = count;
    }
  }

  let category: Category;
  let confidence: number;

  if (Object.keys(matchCounts).length === 0) {
    category = DEFAULT_CATEGORY;
    confidence = 0.65;
  } else {
    category = Object.entries(matchCounts).reduce((best, [cat, count]) =>
      count > (matchCounts[best] || 0) ? cat : best
    , Object.keys(matchCounts)[0]) as Category;

    const bestCount = matchCounts[category];
    confidence = Math.min(0.65 + (bestCount - 1) * 0.08, 0.97);
    confidence = Math.round(confidence * 100) / 100;
  }

  const priority = determinePriority(category, combined);
  const extractedData = extractData(combined);
  const routeRecommendation = ROUTE_MAP[category] || 'General Inbox';
  const summary = generateSummary(text, category);

  return {
    category,
    confidence,
    priority,
    extractedData,
    routeRecommendation,
    summary,
  };
}

// ---------------------------------------------------------------------------
// OpenAI classifier
// ---------------------------------------------------------------------------

async function openaiClassify(text: string, title?: string): Promise<ClassificationResult> {
  const OpenAI = (await import('openai')).default;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const combined = title ? `${title}\n\n${text}` : text;

  const systemPrompt = `You are a text classification assistant. Classify the user's message into exactly one of the following categories:
${SUPPORTED_CATEGORIES.join(', ')}

Respond with valid JSON only, using this schema:
{
  "category": "<category>",
  "confidence": <float between 0 and 1>,
  "priority": "<low|medium|high|critical>",
  "extractedData": { "email": "<string|null>", "amount": "<string|null>", "date": "<string|null>", "company": "<string|null>" },
  "routeRecommendation": "<destination>",
  "summary": "<brief summary of the request>"
}

Use these route recommendations:
- support_ticket -> "Zendesk Support Queue"
- sales_lead -> "Salesforce CRM Pipeline"
- billing -> "Stripe Billing Team"
- technical_issue -> "Jira Engineering Board"
- general_inquiry -> "General Inbox"
- onboarding -> "Onboarding Team Queue"
- document_review -> "Legal Review Queue"
- urgent_escalation -> "Incident Response Team"

Do not include any text outside the JSON object.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: combined },
    ],
    temperature: 0.0,
  });

  const raw = response.choices[0]?.message?.content?.trim() || '{}';
  const result = JSON.parse(raw);

  // Validate and normalise
  const category: Category = SUPPORTED_CATEGORIES.includes(result.category)
    ? (result.category as Category)
    : DEFAULT_CATEGORY;

  const confidence = Math.round(
    Math.max(0, Math.min(1, Number(result.confidence) || 0.85)) * 100
  ) / 100;

  const priority: Priority = (['low', 'medium', 'high', 'critical'] as Priority[]).includes(result.priority)
    ? (result.priority as Priority)
    : determinePriority(category, combined);

  return {
    category,
    confidence,
    priority,
    extractedData: result.extractedData || extractData(combined),
    routeRecommendation: result.routeRecommendation || ROUTE_MAP[category] || 'General Inbox',
    summary: result.summary || generateSummary(text, category),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Runtime override for classifier mode (resets on server restart)
let classifierModeOverride: 'mock' | 'openai' | null = null;

/**
 * Returns the active classifier mode based on runtime override or environment configuration.
 */
export function getClassifierMode(): 'mock' | 'openai' {
  if (classifierModeOverride) {
    return classifierModeOverride;
  }
  if (process.env.OPENAI_API_KEY && process.env.CLASSIFIER_MODE === 'openai') {
    return 'openai';
  }
  return 'mock';
}

/**
 * Sets the classifier mode at runtime (persists until server restart).
 */
export function setClassifierMode(mode: 'mock' | 'openai'): void {
  classifierModeOverride = mode;
}

/**
 * Classifies the given text (and optional title) into a category with
 * confidence score, priority, extracted data, route recommendation, and summary.
 */
export async function classifyRequest(
  text: string,
  title?: string,
): Promise<ClassificationResult> {
  const mode = getClassifierMode();

  if (mode === 'openai') {
    try {
      return await openaiClassify(text, title);
    } catch (error) {
      console.error('OpenAI classification failed, falling back to mock:', error);
      return mockClassify(text, title);
    }
  }

  return mockClassify(text, title);
}
