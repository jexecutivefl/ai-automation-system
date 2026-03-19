'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Card from '@/components/shared/card'
import { CategoryBadge, StatusBadge, PriorityBadge } from '@/components/shared/badge'
import ConfidenceBar from '@/components/shared/confidence-bar'
import EmptyState from '@/components/shared/empty-state'

interface Stats {
  totalRequests: number
  successRate: number
  averageConfidence: number
  activeWorkflows: number
  categoryBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  statusBreakdown: Record<string, number>
  recentActivity: Array<{
    id: string
    title: string
    category: string | null
    priority: string | null
    confidence: number | null
    status: string
    sourceType: string
    createdAt: string
  }>
}

const statCards = [
  { key: 'totalRequests', label: 'Total Requests', icon: '📥', format: (v: number) => v.toString() },
  { key: 'successRate', label: 'Success Rate', icon: '✓', format: (v: number) => `${Math.round(v)}%` },
  { key: 'averageConfidence', label: 'Avg Confidence', icon: '◎', format: (v: number) => `${Math.round(v * 100)}%` },
  { key: 'activeWorkflows', label: 'Active Workflows', icon: '⚡', format: (v: number) => v.toString() },
]

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b',
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of automation system performance</p>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
          <div className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-sm font-medium text-red-800 mb-1">Connection Error</h2>
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={fetchStats} className="mt-3 text-xs font-medium text-red-700 hover:text-red-900">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const categoryEntries = Object.entries(stats.categoryBreakdown)
  const totalCategories = categoryEntries.reduce((sum, [, c]) => sum + c, 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of automation system performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ key, label, icon, format }) => (
          <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
              <span className="text-base">{icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {format((stats as unknown as Record<string, number>)[key] || 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Latest processed requests" className="col-span-2">
          {stats.recentActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Submit a request or seed demo data to see activity here."
              action={
                <Link href="/demo" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Go to Demo Page →
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Title</th>
                    <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Priority</th>
                    <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Confidence</th>
                    <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentActivity.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/requests/${req.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                          {req.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">{req.sourceType}</p>
                      </td>
                      <td className="px-5 py-3"><CategoryBadge category={req.category} /></td>
                      <td className="px-5 py-3"><PriorityBadge priority={req.priority} /></td>
                      <td className="px-5 py-3"><ConfidenceBar confidence={req.confidence} /></td>
                      <td className="px-5 py-3"><StatusBadge status={req.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card title="Classification Breakdown" subtitle="Requests by category">
          {categoryEntries.length === 0 ? (
            <EmptyState title="No data" description="No classifications recorded yet." />
          ) : (
            <div className="px-5 py-4 space-y-3">
              {categoryEntries.map(([cat, count], idx) => {
                const pct = totalCategories > 0 ? Math.round((count / totalCategories) * 100) : 0
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">
                        {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Priority & Status Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="By Priority">
          <div className="px-5 py-4 flex gap-6">
            {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
              <div key={priority} className="text-center">
                <p className="text-lg font-bold text-slate-900 tabular-nums">{count}</p>
                <PriorityBadge priority={priority} />
              </div>
            ))}
            {Object.keys(stats.priorityBreakdown).length === 0 && (
              <p className="text-xs text-slate-400">No data</p>
            )}
          </div>
        </Card>
        <Card title="By Status">
          <div className="px-5 py-4 flex gap-6">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-lg font-bold text-slate-900 tabular-nums">{count}</p>
                <StatusBadge status={status} />
              </div>
            ))}
            {Object.keys(stats.statusBreakdown).length === 0 && (
              <p className="text-xs text-slate-400">No data</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
