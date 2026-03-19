import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db'
import type {
  SourceType,
  Category,
  Priority,
  RequestStatus,
  WorkflowStatus,
  EventType,
} from './types'

interface SeedRequest {
  title: string
  rawContent: string
  category: Category
  priority: Priority
  confidence: number
  sourceType: SourceType
  sourceRef: string
  extractedData: Record<string, string>
  routeDestination: string
  status: RequestStatus
  workflowType: string
  assignedQueue: string
  workflowStatus: WorkflowStatus
  actionTaken: string
  daysAgo: number
}

const seedRequests: SeedRequest[] = [
  // support_ticket
  {
    title: 'Login page returns 500 error after update',
    rawContent: 'Hi, after the latest update our login page is returning a 500 internal server error. This affects all users trying to sign in. We have about 200 active users who are currently locked out. Please investigate urgently.',
    category: 'support_ticket',
    priority: 'high',
    confidence: 0.94,
    sourceType: 'support_portal',
    sourceRef: 'SP-4821',
    extractedData: { email: 'admin@techstartup.io', company: 'TechStartup Inc', urgency: 'high', affected_users: '200' },
    routeDestination: 'Zendesk',
    status: 'completed',
    workflowType: 'support_resolution',
    assignedQueue: 'Tier 2 Support',
    workflowStatus: 'completed',
    actionTaken: 'Escalated to engineering, hotfix deployed within 2 hours',
    daysAgo: 6,
  },
  {
    title: 'Cannot reset password - token expired',
    rawContent: 'I have been trying to reset my password but every time I click the link in the email it says the token has expired. I have tried multiple times over the last hour. My account email is sarah@globalcorp.com.',
    category: 'support_ticket',
    priority: 'medium',
    confidence: 0.91,
    sourceType: 'email',
    sourceRef: 'EM-9932',
    extractedData: { email: 'sarah@globalcorp.com', company: 'Global Corp', issue_type: 'password_reset', attempts: '5' },
    routeDestination: 'Zendesk',
    status: 'completed',
    workflowType: 'support_resolution',
    assignedQueue: 'Tier 1 Support',
    workflowStatus: 'completed',
    actionTaken: 'Token expiry extended, manual password reset link sent to user',
    daysAgo: 5,
  },
  {
    title: 'Mobile app crashes on launch since v3.2',
    rawContent: 'After updating to version 3.2 the mobile app crashes immediately on launch. This happens on both iOS and Android. We have 50 field workers relying on this app daily. Device: iPhone 14 Pro, iOS 17.2.',
    category: 'support_ticket',
    priority: 'high',
    confidence: 0.89,
    sourceType: 'support_portal',
    sourceRef: 'SP-4835',
    extractedData: { email: 'ops@fieldservices.net', company: 'Field Services Ltd', app_version: '3.2', platform: 'iOS/Android', device: 'iPhone 14 Pro' },
    routeDestination: 'Jira',
    status: 'in_progress',
    workflowType: 'bug_report',
    assignedQueue: 'Mobile Engineering',
    workflowStatus: 'in_progress',
    actionTaken: 'Bug confirmed, regression identified in startup sequence',
    daysAgo: 2,
  },
  {
    title: 'Customer unable to access premium features',
    rawContent: 'We upgraded to the Premium plan last week but several features like advanced analytics and custom reports are still locked. Our subscription ID is SUB-88421. Please help us get access.',
    category: 'support_ticket',
    priority: 'medium',
    confidence: 0.87,
    sourceType: 'web_form',
    sourceRef: 'WF-2291',
    extractedData: { email: 'billing@mediaco.com', company: 'MediaCo', subscription_id: 'SUB-88421', plan: 'Premium' },
    routeDestination: 'Zendesk',
    status: 'routed',
    workflowType: 'support_resolution',
    assignedQueue: 'Tier 1 Support',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 1,
  },

  // sales_lead
  {
    title: 'Enterprise pricing inquiry for 500+ seats',
    rawContent: 'Hello, I am the VP of Engineering at Acme Corp. We are evaluating your platform for our entire engineering department of 500+ developers. We would like to discuss enterprise pricing, volume discounts, and dedicated support options. Please schedule a call.',
    category: 'sales_lead',
    priority: 'high',
    confidence: 0.96,
    sourceType: 'web_form',
    sourceRef: 'WF-2287',
    extractedData: { email: 'john.smith@acmecorp.com', company: 'Acme Corp', role: 'VP of Engineering', seats: '500+', interest: 'enterprise_pricing' },
    routeDestination: 'Salesforce',
    status: 'completed',
    workflowType: 'lead_qualification',
    assignedQueue: 'Enterprise Sales',
    workflowStatus: 'completed',
    actionTaken: 'Lead qualified, demo scheduled for next week, assigned to Sr. AE',
    daysAgo: 6,
  },
  {
    title: 'Request for product demo - Fortune 500 company',
    rawContent: 'My name is Lisa Chen, Head of Digital Transformation at MegaBank Financial. We are a Fortune 500 company looking to automate our internal workflows. Could you set up a demo for our team of 8 stakeholders? Our timeline is Q1 implementation.',
    category: 'sales_lead',
    priority: 'high',
    confidence: 0.97,
    sourceType: 'email',
    sourceRef: 'EM-9945',
    extractedData: { email: 'lisa.chen@megabank.com', company: 'MegaBank Financial', role: 'Head of Digital Transformation', stakeholders: '8', timeline: 'Q1' },
    routeDestination: 'Salesforce',
    status: 'in_progress',
    workflowType: 'lead_qualification',
    assignedQueue: 'Strategic Accounts',
    workflowStatus: 'in_progress',
    actionTaken: 'Initial discovery call completed, custom demo being prepared',
    daysAgo: 3,
  },
  {
    title: 'Partnership opportunity - integration with Slack',
    rawContent: 'Hi team, I am from the Slack partnerships team. We have noticed your product gaining traction and would love to explore a native integration partnership. This could be mutually beneficial for both our user bases. Let us set up a meeting.',
    category: 'sales_lead',
    priority: 'medium',
    confidence: 0.82,
    sourceType: 'email',
    sourceRef: 'EM-9951',
    extractedData: { email: 'partnerships@slack.com', company: 'Slack (Salesforce)', type: 'partnership', interest: 'native_integration' },
    routeDestination: 'Salesforce',
    status: 'classified',
    workflowType: 'partnership_evaluation',
    assignedQueue: 'Business Development',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 1,
  },
  {
    title: 'Requesting custom plan with API access',
    rawContent: 'We are a mid-size SaaS company building an internal tool and need API access with higher rate limits. Current plans do not seem to fit. We would need around 100K API calls per day and webhook support. Budget is around $5K/month.',
    category: 'sales_lead',
    priority: 'medium',
    confidence: 0.88,
    sourceType: 'api',
    sourceRef: 'API-1104',
    extractedData: { email: 'cto@buildfast.dev', company: 'BuildFast', api_calls: '100K/day', budget: '$5K/month', needs: 'api_access,webhooks' },
    routeDestination: 'Salesforce',
    status: 'routed',
    workflowType: 'lead_qualification',
    assignedQueue: 'Mid-Market Sales',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 2,
  },

  // billing
  {
    title: 'Double charged on monthly subscription',
    rawContent: 'I was charged twice for my monthly subscription on Dec 15th. Transaction IDs: TXN-44821 and TXN-44822, both for $49.99. Please refund the duplicate charge immediately. Account: PRO-8821.',
    category: 'billing',
    priority: 'high',
    confidence: 0.95,
    sourceType: 'email',
    sourceRef: 'EM-9928',
    extractedData: { email: 'accounting@designstudio.co', company: 'Design Studio Co', transactions: 'TXN-44821,TXN-44822', amount: '$49.99', account: 'PRO-8821' },
    routeDestination: 'Stripe',
    status: 'completed',
    workflowType: 'billing_resolution',
    assignedQueue: 'Billing Support',
    workflowStatus: 'completed',
    actionTaken: 'Duplicate charge confirmed, refund of $49.99 processed via Stripe',
    daysAgo: 5,
  },
  {
    title: 'Invoice discrepancy for Q4 2024',
    rawContent: 'Our finance team found a discrepancy between the Q4 2024 invoice and the agreed-upon contract rate. Invoice shows $12,500/month but our contract states $10,000/month. Invoice #INV-2024-Q4-882. Please review and issue a corrected invoice.',
    category: 'billing',
    priority: 'medium',
    confidence: 0.92,
    sourceType: 'email',
    sourceRef: 'EM-9938',
    extractedData: { email: 'finance@largecorp.com', company: 'LargeCorp Industries', invoice: 'INV-2024-Q4-882', expected: '$10,000/mo', actual: '$12,500/mo' },
    routeDestination: 'Stripe',
    status: 'in_progress',
    workflowType: 'billing_resolution',
    assignedQueue: 'Billing Support',
    workflowStatus: 'in_progress',
    actionTaken: 'Contract reviewed, discrepancy confirmed, corrected invoice being generated',
    daysAgo: 4,
  },
  {
    title: 'Need to upgrade from Pro to Enterprise plan',
    rawContent: 'We have outgrown our Pro plan and need to upgrade to Enterprise. We currently have 45 users and expect to add 30 more next quarter. Please provide upgrade pricing and any migration steps needed. Current account: PRO-7721.',
    category: 'billing',
    priority: 'low',
    confidence: 0.86,
    sourceType: 'web_form',
    sourceRef: 'WF-2295',
    extractedData: { email: 'admin@growthco.io', company: 'GrowthCo', current_plan: 'Pro', target_plan: 'Enterprise', users: '45', growth: '30 next quarter' },
    routeDestination: 'Stripe',
    status: 'routed',
    workflowType: 'plan_change',
    assignedQueue: 'Account Management',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 1,
  },
  {
    title: 'Refund request for cancelled service',
    rawContent: 'I cancelled my subscription on Nov 30th but was still charged for December. I would like a full refund for December. My cancellation confirmation number is CXL-9921. Account email: mike@freelancer.com.',
    category: 'billing',
    priority: 'medium',
    confidence: 0.93,
    sourceType: 'support_portal',
    sourceRef: 'SP-4842',
    extractedData: { email: 'mike@freelancer.com', cancellation_ref: 'CXL-9921', charge_month: 'December', type: 'refund_request' },
    routeDestination: 'Stripe',
    status: 'completed',
    workflowType: 'billing_resolution',
    assignedQueue: 'Billing Support',
    workflowStatus: 'completed',
    actionTaken: 'Cancellation verified, December charge refunded in full',
    daysAgo: 6,
  },

  // technical_issue
  {
    title: 'API rate limiting not working correctly',
    rawContent: 'We are seeing inconsistent rate limiting behavior on the /v2/data endpoint. Some requests are being throttled at 50 req/min instead of the documented 100 req/min for our plan. This started around 2 days ago. API key: ak_prod_xxxxx.',
    category: 'technical_issue',
    priority: 'high',
    confidence: 0.90,
    sourceType: 'api',
    sourceRef: 'API-1098',
    extractedData: { email: 'dev@integrations.io', company: 'Integrations.io', endpoint: '/v2/data', expected_limit: '100 req/min', actual_limit: '50 req/min' },
    routeDestination: 'Jira',
    status: 'in_progress',
    workflowType: 'bug_report',
    assignedQueue: 'Platform Engineering',
    workflowStatus: 'in_progress',
    actionTaken: 'Rate limiter configuration reviewed, caching layer identified as root cause',
    daysAgo: 3,
  },
  {
    title: 'Database connection timeout in production',
    rawContent: 'Production database connections are timing out intermittently. Error: "Connection pool exhausted after 30s". This is causing 502 errors for approximately 15% of requests. Started at 14:30 UTC today. DB cluster: prod-db-cluster-3.',
    category: 'technical_issue',
    priority: 'critical',
    confidence: 0.95,
    sourceType: 'slack',
    sourceRef: 'SL-alerts-1182',
    extractedData: { channel: '#prod-alerts', reporter: 'monitoring-bot', cluster: 'prod-db-cluster-3', error_rate: '15%', error: 'Connection pool exhausted' },
    routeDestination: 'Jira',
    status: 'completed',
    workflowType: 'incident_response',
    assignedQueue: 'Database Engineering',
    workflowStatus: 'completed',
    actionTaken: 'Connection pool size increased, idle connection cleanup configured, monitoring added',
    daysAgo: 4,
  },
  {
    title: 'SSL certificate expiration warning',
    rawContent: 'Our monitoring system detected that the SSL certificate for api.ourservice.com expires in 7 days. Auto-renewal appears to be failing with error: "DNS validation failed". Please investigate and ensure renewal before expiration.',
    category: 'technical_issue',
    priority: 'high',
    confidence: 0.88,
    sourceType: 'slack',
    sourceRef: 'SL-infra-0887',
    extractedData: { domain: 'api.ourservice.com', days_until_expiry: '7', error: 'DNS validation failed', source: 'monitoring_system' },
    routeDestination: 'Jira',
    status: 'completed',
    workflowType: 'maintenance_task',
    assignedQueue: 'Infrastructure',
    workflowStatus: 'completed',
    actionTaken: 'DNS records corrected, certificate renewed successfully, monitoring alert cleared',
    daysAgo: 5,
  },
  {
    title: 'Memory leak in background worker process',
    rawContent: 'The background job worker process is consuming increasing amounts of memory over time. It starts at 256MB and grows to 4GB+ within 24 hours. Worker: job-processor-prod-2. This causes OOM kills and job failures. Heap dumps attached.',
    category: 'technical_issue',
    priority: 'high',
    confidence: 0.91,
    sourceType: 'slack',
    sourceRef: 'SL-eng-2204',
    extractedData: { worker: 'job-processor-prod-2', initial_memory: '256MB', peak_memory: '4GB+', time_to_peak: '24 hours', impact: 'OOM kills' },
    routeDestination: 'Jira',
    status: 'in_progress',
    workflowType: 'bug_report',
    assignedQueue: 'Backend Engineering',
    workflowStatus: 'in_progress',
    actionTaken: 'Heap dump analysis in progress, suspect event listener accumulation',
    daysAgo: 2,
  },

  // general_inquiry
  {
    title: 'How to export data to CSV format',
    rawContent: 'Hello, I am trying to export my project data to CSV format but I cannot find the option in the dashboard. Is this feature available? If so, could you point me in the right direction? I am on the Pro plan.',
    category: 'general_inquiry',
    priority: 'low',
    confidence: 0.85,
    sourceType: 'web_form',
    sourceRef: 'WF-2289',
    extractedData: { email: 'user@smallbiz.com', company: 'SmallBiz LLC', plan: 'Pro', feature: 'CSV export' },
    routeDestination: 'General Inbox',
    status: 'completed',
    workflowType: 'inquiry_response',
    assignedQueue: 'Customer Success',
    workflowStatus: 'completed',
    actionTaken: 'Provided step-by-step guide for CSV export, linked to documentation',
    daysAgo: 4,
  },
  {
    title: 'Requesting product roadmap update',
    rawContent: 'We are considering expanding our usage and would love to know what features are planned for Q1-Q2 2025. Specifically interested in: 1) Advanced reporting, 2) Custom workflow builder, 3) Slack integration improvements. Can you share any roadmap details?',
    category: 'general_inquiry',
    priority: 'low',
    confidence: 0.79,
    sourceType: 'email',
    sourceRef: 'EM-9955',
    extractedData: { email: 'pm@techfirm.com', company: 'TechFirm', interests: 'reporting,workflow_builder,slack_integration', context: 'expansion_consideration' },
    routeDestination: 'General Inbox',
    status: 'routed',
    workflowType: 'inquiry_response',
    assignedQueue: 'Product Team',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 1,
  },
  {
    title: 'General feedback on new dashboard design',
    rawContent: 'Just wanted to say the new dashboard redesign is great! The navigation is much more intuitive. A few suggestions: 1) Add dark mode, 2) Allow widget rearrangement, 3) Add keyboard shortcuts. Keep up the great work!',
    category: 'general_inquiry',
    priority: 'low',
    confidence: 0.77,
    sourceType: 'web_form',
    sourceRef: 'WF-2298',
    extractedData: { email: 'power.user@company.com', type: 'feedback', sentiment: 'positive', suggestions: 'dark_mode,widget_rearrangement,keyboard_shortcuts' },
    routeDestination: 'General Inbox',
    status: 'classified',
    workflowType: 'feedback_collection',
    assignedQueue: 'Product Team',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 0,
  },

  // onboarding
  {
    title: 'New team setup - 15 developers need access',
    rawContent: 'We just signed our Enterprise contract and need to onboard our development team of 15 people. We need: 1) Team workspace created, 2) SSO setup with Okta, 3) API keys generated for CI/CD, 4) Admin training session scheduled. Contact: devops@newclient.com.',
    category: 'onboarding',
    priority: 'medium',
    confidence: 0.93,
    sourceType: 'email',
    sourceRef: 'EM-9960',
    extractedData: { email: 'devops@newclient.com', company: 'NewClient Tech', team_size: '15', sso_provider: 'Okta', needs: 'workspace,sso,api_keys,training' },
    routeDestination: 'Onboarding Queue',
    status: 'in_progress',
    workflowType: 'customer_onboarding',
    assignedQueue: 'Onboarding Team',
    workflowStatus: 'in_progress',
    actionTaken: 'Workspace created, SSO configuration in progress, training scheduled for Thursday',
    daysAgo: 3,
  },
  {
    title: 'SSO configuration help for Azure AD',
    rawContent: 'We need help setting up SSO with Azure Active Directory. We have followed the documentation but are getting a SAML assertion error. Our Azure tenant ID is tenant-xxxx-yyyy. We have 80 users waiting to be migrated to SSO login.',
    category: 'onboarding',
    priority: 'medium',
    confidence: 0.86,
    sourceType: 'support_portal',
    sourceRef: 'SP-4850',
    extractedData: { email: 'it.admin@enterprise.com', company: 'Enterprise Solutions', sso_provider: 'Azure AD', error: 'SAML assertion error', users: '80' },
    routeDestination: 'Onboarding Queue',
    status: 'routed',
    workflowType: 'technical_onboarding',
    assignedQueue: 'Onboarding Team',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 1,
  },

  // document_review
  {
    title: 'Contract review needed for enterprise deal',
    rawContent: 'We have a new enterprise customer (MegaRetail Inc) ready to sign a 3-year contract worth $450K ARR. The contract includes custom SLA terms, data residency requirements (EU), and a non-standard indemnification clause. Legal review required before signing.',
    category: 'document_review',
    priority: 'high',
    confidence: 0.90,
    sourceType: 'slack',
    sourceRef: 'SL-deals-0412',
    extractedData: { customer: 'MegaRetail Inc', deal_value: '$450K ARR', term: '3 years', special_terms: 'custom_sla,eu_data_residency,indemnification' },
    routeDestination: 'Legal Review',
    status: 'in_progress',
    workflowType: 'document_review',
    assignedQueue: 'Legal Team',
    workflowStatus: 'in_progress',
    actionTaken: 'Initial review complete, redlines sent back on indemnification clause',
    daysAgo: 2,
  },
  {
    title: 'Compliance document verification request',
    rawContent: 'Our SOC 2 Type II audit is coming up next month. We need to verify and update the following documents: 1) Information Security Policy, 2) Access Control Procedures, 3) Incident Response Plan, 4) Data Retention Policy. Deadline: Jan 15th.',
    category: 'document_review',
    priority: 'medium',
    confidence: 0.84,
    sourceType: 'email',
    sourceRef: 'EM-9962',
    extractedData: { email: 'compliance@ourcompany.com', audit_type: 'SOC 2 Type II', documents: '4', deadline: 'Jan 15th' },
    routeDestination: 'Legal Review',
    status: 'routed',
    workflowType: 'compliance_review',
    assignedQueue: 'Compliance Team',
    workflowStatus: 'pending',
    actionTaken: '',
    daysAgo: 3,
  },

  // urgent_escalation
  {
    title: 'Production database is down - all services affected',
    rawContent: 'URGENT: Primary production database (prod-db-main) is completely unresponsive as of 03:45 UTC. All customer-facing services are returning 503 errors. Failover did not trigger automatically. All hands on deck needed. Estimated impact: 100% of customers.',
    category: 'urgent_escalation',
    priority: 'critical',
    confidence: 0.97,
    sourceType: 'slack',
    sourceRef: 'SL-incidents-0099',
    extractedData: { severity: 'P0', service: 'prod-db-main', start_time: '03:45 UTC', impact: '100% customers', failover: 'failed' },
    routeDestination: 'Incident Response',
    status: 'completed',
    workflowType: 'incident_response',
    assignedQueue: 'Incident Commander',
    workflowStatus: 'completed',
    actionTaken: 'Manual failover executed, root cause identified as disk failure, post-mortem scheduled',
    daysAgo: 5,
  },
  {
    title: 'Security breach detected - immediate action required',
    rawContent: 'CRITICAL SECURITY ALERT: Anomalous access patterns detected on customer data API. Unusual volume of requests from IP range 203.0.113.0/24 accessing /v2/users endpoint. Potential data exfiltration in progress. WAF rules bypassed. Immediate investigation required.',
    category: 'urgent_escalation',
    priority: 'critical',
    confidence: 0.96,
    sourceType: 'api',
    sourceRef: 'SEC-ALERT-0042',
    extractedData: { severity: 'P0', type: 'security_breach', source_ip: '203.0.113.0/24', target_endpoint: '/v2/users', waf_status: 'bypassed' },
    routeDestination: 'Incident Response',
    status: 'completed',
    workflowType: 'security_incident',
    assignedQueue: 'Security Team',
    workflowStatus: 'completed',
    actionTaken: 'IP range blocked, API keys rotated, forensic analysis completed, no data exfiltration confirmed',
    daysAgo: 4,
  },
]

function hoursAgo(days: number, offsetHours: number = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - offsetHours)
  return d.toISOString()
}

export function seedDatabase(): { requests: number; workflows: number; logs: number } {
  const db = getDb()

  // Delete all existing records (order matters due to foreign keys)
  db.exec('DELETE FROM automation_logs')
  db.exec('DELETE FROM workflows')
  db.exec('DELETE FROM requests')

  const insertRequest = db.prepare(`
    INSERT INTO requests (id, sourceType, sourceRef, title, rawContent, extractedData, category, priority, confidence, routeDestination, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertWorkflow = db.prepare(`
    INSERT INTO workflows (id, requestId, workflowType, assignedQueue, actionTaken, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertLog = db.prepare(`
    INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  let requestCount = 0
  let workflowCount = 0
  let logCount = 0

  const insertAll = db.transaction(() => {
    for (const seed of seedRequests) {
      const requestId = uuidv4()
      const workflowId = uuidv4()
      const createdAt = hoursAgo(seed.daysAgo, Math.floor(Math.random() * 8))
      const updatedAt = hoursAgo(Math.max(0, seed.daysAgo - 1), Math.floor(Math.random() * 4))

      // Insert request
      insertRequest.run(
        requestId,
        seed.sourceType,
        seed.sourceRef,
        seed.title,
        seed.rawContent,
        JSON.stringify(seed.extractedData),
        seed.category,
        seed.priority,
        seed.confidence,
        seed.routeDestination,
        seed.status,
        createdAt,
        updatedAt
      )
      requestCount++

      // Insert workflow
      insertWorkflow.run(
        workflowId,
        requestId,
        seed.workflowType,
        seed.assignedQueue,
        seed.actionTaken,
        seed.workflowStatus,
        createdAt,
        updatedAt
      )
      workflowCount++

      // Insert automation logs (2-3 per request)
      // Log 1: request_received
      insertLog.run(
        uuidv4(),
        requestId,
        'request_received' as EventType,
        `Request received from ${seed.sourceType}: "${seed.title}"`,
        JSON.stringify({ sourceType: seed.sourceType, sourceRef: seed.sourceRef }),
        createdAt
      )
      logCount++

      // Log 2: classification_completed
      const classifiedAt = hoursAgo(seed.daysAgo, Math.floor(Math.random() * 7))
      insertLog.run(
        uuidv4(),
        requestId,
        'classification_completed' as EventType,
        `Classified as ${seed.category} with ${(seed.confidence * 100).toFixed(0)}% confidence`,
        JSON.stringify({ category: seed.category, priority: seed.priority, confidence: seed.confidence }),
        classifiedAt
      )
      logCount++

      // Log 3: routing_completed (for most), error/retry for some
      const routedAt = hoursAgo(Math.max(0, seed.daysAgo - 1), Math.floor(Math.random() * 6))

      if (seed.priority === 'critical' || seed.confidence < 0.8) {
        // Add an error + retry for critical/low-confidence items
        insertLog.run(
          uuidv4(),
          requestId,
          'error' as EventType,
          `Routing attempt failed: ${seed.priority === 'critical' ? 'escalation path validation required' : 'low confidence score requires manual review'}`,
          JSON.stringify({ error_code: seed.priority === 'critical' ? 'ESCALATION_VALIDATION' : 'LOW_CONFIDENCE', threshold: 0.80 }),
          routedAt
        )
        logCount++

        insertLog.run(
          uuidv4(),
          requestId,
          'retry_requested' as EventType,
          `Retry routing after ${seed.priority === 'critical' ? 'escalation validation' : 'manual review approval'}`,
          JSON.stringify({ retry_count: 1, resolved: true }),
          hoursAgo(Math.max(0, seed.daysAgo - 1), Math.floor(Math.random() * 3))
        )
        logCount++
      }

      insertLog.run(
        uuidv4(),
        requestId,
        'routing_completed' as EventType,
        `Routed to ${seed.routeDestination} - ${seed.assignedQueue}`,
        JSON.stringify({ destination: seed.routeDestination, queue: seed.assignedQueue, workflowId }),
        routedAt
      )
      logCount++
    }
  })

  insertAll()

  return { requests: requestCount, workflows: workflowCount, logs: logCount }
}

// Run standalone if executed directly
const isMainModule = require.main === module || process.argv[1]?.endsWith('seed.ts')
if (isMainModule) {
  console.log('Seeding database...')
  const counts = seedDatabase()
  console.log(`Seeded successfully:`)
  console.log(`  Requests:  ${counts.requests}`)
  console.log(`  Workflows: ${counts.workflows}`)
  console.log(`  Logs:      ${counts.logs}`)
  console.log('Done!')
}
