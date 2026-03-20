'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Card from '@/components/shared/card'
import EmptyState from '@/components/shared/empty-state'

interface LogRow {
  id: string
  requestId: string
  requestTitle: string
  eventType: string
  message: string
  metadata: string
  createdAt: string
}

const eventTypes = [
  '', 'request_received', 'classification_started', 'classification_completed',
  'routing_started', 'routing_completed', 'workflow_created', 'workflow_updated',
  'action_triggered', 'error', 'retry_requested'
]

const eventTypeColors: Record<string, string> = {
  request_received: 'bg-blue-500',
  classification_started: 'bg-indigo-500',
  classification_completed: 'bg-emerald-500',
  routing_started: 'bg-violet-500',
  routing_completed: 'bg-emerald-500',
  workflow_created: 'bg-blue-500',
  workflow_updated: 'bg-amber-500',
  action_triggered: 'bg-indigo-500',
  error: 'bg-red-500',
  retry_requested: 'bg-amber-500',
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const limit = 25

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (eventTypeFilter) params.set('eventType', eventTypeFilter)
      const res = await fetch(`/api/logs?${params}`)
      const json = await res.json()
      setLogs(json.data || [])
      setTotal(json.total || 0)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, eventTypeFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-500 mt-1">Complete automation event history across all requests</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={eventTypeFilter}
          onChange={e => { setEventTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Event Types</option>
          {eventTypes.filter(Boolean).map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <EmptyState title="No log entries found" description="Automation events will appear here as requests are processed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Event</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Request</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => {
                  const dotColor = eventTypeColors[log.eventType] || 'bg-slate-400'
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                          <span className="text-xs font-medium text-slate-700">{formatLabel(log.eventType)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/requests/${log.requestId}`} className="text-sm text-slate-900 hover:text-blue-600 transition-colors">
                          {log.requestTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 max-w-md truncate">{log.message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">{total} total events</p>
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
