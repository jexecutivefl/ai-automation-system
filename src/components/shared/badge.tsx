const categoryColors: Record<string, string> = {
  support_ticket: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  sales_lead: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  billing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  technical_issue: 'bg-red-50 text-red-700 ring-red-600/20',
  general_inquiry: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  onboarding: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  document_review: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  urgent_escalation: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  high: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  critical: 'bg-red-50 text-red-700 ring-red-600/20',
}

const statusColors: Record<string, string> = {
  pending: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  classified: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  routed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-red-50 text-red-700 ring-red-600/20',
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-slate-400">—</span>
  const colors = categoryColors[category] || categoryColors.general_inquiry
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
      {formatLabel(category)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-xs text-slate-400">—</span>
  const colors = priorityColors[priority] || priorityColors.low
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
      {formatLabel(priority)}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || statusColors.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}>
      {formatLabel(status)}
    </span>
  )
}
