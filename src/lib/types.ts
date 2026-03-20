// Source types for incoming requests
export type SourceType = 'email' | 'web_form' | 'slack' | 'api' | 'upload' | 'support_portal'

// Categories for classification
export type Category = 'support_ticket' | 'sales_lead' | 'billing' | 'technical_issue' | 'general_inquiry' | 'onboarding' | 'document_review' | 'urgent_escalation'

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'critical'

// Request status
export type RequestStatus = 'pending' | 'classified' | 'routed' | 'in_progress' | 'completed' | 'failed'

// Workflow status
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// Automation log event types
export type EventType = 'request_received' | 'classification_started' | 'classification_completed' | 'routing_started' | 'routing_completed' | 'workflow_created' | 'workflow_updated' | 'action_triggered' | 'error' | 'retry_requested'

// Main Request entity
export interface Request {
  id: string
  sourceType: SourceType
  sourceRef: string
  title: string
  rawContent: string
  extractedData: string // JSON string of extracted fields
  category: Category | null
  priority: Priority | null
  confidence: number | null
  routeDestination: string | null
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

// Workflow entity
export interface Workflow {
  id: string
  requestId: string
  workflowType: string
  assignedQueue: string
  actionTaken: string
  status: WorkflowStatus
  createdAt: string
  updatedAt: string
}

// Automation Log entity
export interface AutomationLog {
  id: string
  requestId: string
  eventType: EventType
  message: string
  metadata: string // JSON string
  createdAt: string
}

// AI Classification result
export interface ClassificationResult {
  category: Category
  priority: Priority
  confidence: number
  extractedData: Record<string, string>
  routeRecommendation: string
  summary: string
}

// Dashboard stats
export interface DashboardStats {
  totalRequests: number
  successRate: number
  averageConfidence: number
  activeWorkflows: number
  categoryBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  statusBreakdown: Record<string, number>
  requestsOverTime: Array<{ date: string; count: number }>
  recentActivity: (Request & { workflowStatus?: string })[]
}

// API response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

// Pagination params
export interface PaginationParams {
  page?: number
  limit?: number
  category?: Category
  status?: RequestStatus
  priority?: Priority
  search?: string
}
