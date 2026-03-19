'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Card from '@/components/shared/card'
import { CategoryBadge, StatusBadge, PriorityBadge } from '@/components/shared/badge'
import ConfidenceBar from '@/components/shared/confidence-bar'
import EmptyState from '@/components/shared/empty-state'

interface RequestRow {
  id: string
  title: string
  sourceType: string
  category: string | null
  priority: string | null
  confidence: number | null
  status: string
  routeDestination: string | null
  createdAt: string
}

const categories = ['', 'support_ticket', 'sales_lead', 'billing', 'technical_issue', 'general_inquiry', 'onboarding', 'document_review', 'urgent_escalation']
const statuses = ['', 'pending', 'classified', 'routed', 'in_progress', 'completed', 'failed']
const priorities = ['', 'low', 'medium', 'high', 'critical']

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', search: '' })
  const limit = 15

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (filters.category) params.set('category', filters.category)
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/requests?${params}`)
      const json = await res.json()
      setRequests(json.data || [])
      setTotal(json.total || 0)
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Requests</h1>
          <p className="text-sm text-slate-500 mt-1">All incoming requests and their classification results</p>
        </div>
        <Link
          href="/demo"
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search requests..."
          value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
          className="flex-1 max-w-xs px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <select
          value={filters.category}
          onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.filter(Boolean).map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.filter(Boolean).map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
        </select>
        <select
          value={filters.priority}
          onChange={e => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Priorities</option>
          {priorities.filter(Boolean).map(p => <option key={p} value={p}>{formatLabel(p)}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="Try adjusting your filters or submit a new request."
            action={<Link href="/demo" className="text-xs font-medium text-blue-600 hover:text-blue-700">Submit Request →</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Source</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Priority</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Confidence</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/requests/${req.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                        {req.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatLabel(req.sourceType)}</td>
                    <td className="px-5 py-3"><CategoryBadge category={req.category} /></td>
                    <td className="px-5 py-3"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-5 py-3"><ConfidenceBar confidence={req.confidence} /></td>
                    <td className="px-5 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-5 py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">{total} total requests</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
