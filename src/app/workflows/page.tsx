'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Card from '@/components/shared/card'
import { StatusBadge } from '@/components/shared/badge'
import EmptyState from '@/components/shared/empty-state'

interface WorkflowRow {
  id: string
  requestId: string
  requestTitle: string
  workflowType: string
  assignedQueue: string
  actionTaken: string
  status: string
  createdAt: string
  updatedAt: string
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/workflows?${params}`)
      const json = await res.json()
      setWorkflows(json.data || [])
      setTotal(json.total || 0)
    } catch {
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchWorkflows() }, [fetchWorkflows])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Workflows</h1>
        <p className="text-sm text-slate-500 mt-1">Automated workflow execution history and routing results</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <EmptyState title="No workflows found" description="Workflows are created when requests are classified and routed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Request</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Workflow Type</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Queue</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Action Taken</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workflows.map(wf => (
                  <tr key={wf.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/requests/${wf.requestId}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                        {wf.requestTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">{wf.workflowType}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                        {wf.assignedQueue}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-xs truncate">{wf.actionTaken}</td>
                    <td className="px-5 py-3"><StatusBadge status={wf.status} /></td>
                    <td className="px-5 py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">{formatDate(wf.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">{total} total workflows</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
