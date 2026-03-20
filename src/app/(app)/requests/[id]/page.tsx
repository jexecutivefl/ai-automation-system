'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/shared/card'
import { CategoryBadge, StatusBadge, PriorityBadge } from '@/components/shared/badge'
import ConfidenceBar from '@/components/shared/confidence-bar'
import Timeline from '@/components/shared/timeline'
import { useToast } from '@/components/shared/toast'

interface RequestDetail {
  id: string
  sourceType: string
  sourceRef: string
  title: string
  rawContent: string
  extractedData: string
  category: string | null
  priority: string | null
  confidence: number | null
  routeDestination: string | null
  status: string
  createdAt: string
  updatedAt: string
  workflows: Array<{
    id: string
    workflowType: string
    assignedQueue: string
    actionTaken: string
    status: string
    createdAt: string
    updatedAt: string
  }>
  logs: Array<{
    id: string
    eventType: string
    message: string
    metadata: string
    createdAt: string
  }>
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function parseExtractedData(json: string): Record<string, string> {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}

export default function RequestDetailPage() {
  const params = useParams()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const { toast } = useToast()

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${params.id}`)
      if (!res.ok) throw new Error('Not found')
      const json = await res.json()
      setRequest(json.data)
    } catch {
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { fetchRequest() }, [fetchRequest])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const res = await fetch(`/api/requests/${params.id}/retry`, { method: 'POST' })
      if (res.ok) {
        await fetchRequest()
        toast('Request reclassified successfully', 'success')
      } else {
        toast('Reclassification failed', 'error')
      }
    } catch {
      toast('Reclassification failed', 'error')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
          <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-sm font-medium text-red-800 mb-1">Request Not Found</h2>
          <p className="text-xs text-red-600 mb-4">The requested item could not be found.</p>
          <Link href="/requests" className="text-xs font-medium text-blue-600 hover:text-blue-700">← Back to Requests</Link>
        </div>
      </div>
    )
  }

  const extracted = parseExtractedData(request.extractedData)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/requests" className="text-xs text-slate-500 hover:text-slate-700 mb-2 inline-block">← Back to Requests</Link>
          <h1 className="text-xl font-semibold text-slate-900">{request.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={request.status} />
            <CategoryBadge category={request.category} />
            <PriorityBadge priority={request.priority} />
            <span className="text-xs text-slate-400">{formatDate(request.createdAt)}</span>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {retrying ? 'Reclassifying...' : '↻ Reclassify'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          {/* Raw Content */}
          <Card title="Request Content">
            <div className="px-5 py-4">
              <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                <span>Source: <strong className="text-slate-700">{formatLabel(request.sourceType)}</strong></span>
                {request.sourceRef && <span>Ref: <strong className="text-slate-700">{request.sourceRef}</strong></span>}
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.rawContent}
              </div>
            </div>
          </Card>

          {/* AI Classification Result */}
          <Card title="AI Classification Result" subtitle="Automated analysis by the classification engine">
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Category</p>
                  <CategoryBadge category={request.category} />
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Priority</p>
                  <PriorityBadge priority={request.priority} />
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Confidence Score</p>
                  <ConfidenceBar confidence={request.confidence} />
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Route Destination</p>
                  <p className="text-sm font-medium text-slate-700">{request.routeDestination || '—'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Extracted Fields */}
          {Object.keys(extracted).length > 0 && (
            <Card title="Extracted Fields" subtitle="Structured data extracted from the request">
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(extracted).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                        {formatLabel(key)}
                      </p>
                      <p className="text-sm text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Workflows */}
          {request.workflows.length > 0 && (
            <Card title="Workflows" subtitle="Automated workflow execution history">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Type</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Queue</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Action</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {request.workflows.map(wf => (
                      <tr key={wf.id}>
                        <td className="px-5 py-3 text-sm text-slate-700">{wf.workflowType}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{wf.assignedQueue}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{wf.actionTaken}</td>
                        <td className="px-5 py-3"><StatusBadge status={wf.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Event Timeline */}
        <div className="space-y-4">
          <Card title="Automation Timeline" subtitle="Event log for this request">
            <div className="px-5 py-4">
              <Timeline events={request.logs} />
            </div>
          </Card>

          <Card title="Request Metadata">
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">Request ID</p>
                <p className="text-xs text-slate-700 font-mono">{request.id}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">Created</p>
                <p className="text-xs text-slate-700">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">Last Updated</p>
                <p className="text-xs text-slate-700">{formatDate(request.updatedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">Source Type</p>
                <p className="text-xs text-slate-700">{formatLabel(request.sourceType)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
