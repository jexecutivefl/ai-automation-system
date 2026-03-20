'use client'

import { useState } from 'react'
import Card from '@/components/shared/card'
import { CategoryBadge, PriorityBadge } from '@/components/shared/badge'
import ConfidenceBar from '@/components/shared/confidence-bar'
import { useToast } from '@/components/shared/toast'

interface SubmitResult {
  id: string
  title: string
  category: string
  priority: string
  confidence: number
  routeDestination: string
  status: string
}

export default function DemoPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceType, setSourceType] = useState('web_form')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Webhook test
  const [webhookBody, setWebhookBody] = useState('{\n  "text": "Our API is returning 500 errors since the last deployment. This is urgent.",\n  "source": "monitoring_alert"\n}')
  const [webhookResult, setWebhookResult] = useState<string | null>(null)
  const [webhookSubmitting, setWebhookSubmitting] = useState(false)

  // Seed
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), sourceType }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.error || `Server error (${res.status})`)
      }
      const json = await res.json()
      setResult(json.data)
      setTitle('')
      setContent('')
      toast('Request classified successfully!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWebhook = async () => {
    setWebhookSubmitting(true)
    setWebhookResult(null)
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: webhookBody,
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || `Webhook failed (${res.status})`)
      }
      setWebhookResult(JSON.stringify(json, null, 2))
      toast('Webhook processed', 'info')
    } catch (err) {
      setWebhookResult(`Error: ${err instanceof Error ? err.message : 'Failed'}`)
      toast('Webhook request failed', 'error')
    } finally {
      setWebhookSubmitting(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || `Seed failed (${res.status})`)
      }
      setSeedResult(json.message || 'Database seeded successfully!')
      toast('Database seeded with demo data', 'success')
    } catch {
      setSeedResult('Failed to seed database')
      toast('Failed to seed database', 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Demo & Testing</h1>
        <p className="text-sm text-slate-500 mt-1">Submit test requests, test webhooks, and manage demo data</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Manual Submission */}
        <Card title="Manual Request Submission" subtitle="Submit a request through the classification pipeline">
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Cannot access billing portal"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                placeholder="Describe the request in detail..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={e => setSourceType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="web_form">Web Form</option>
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="api">API</option>
                <option value="support_portal">Support Portal</option>
                <option value="upload">File Upload</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Processing...' : 'Submit & Classify'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">{error}</div>
            )}

            {result && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-emerald-800">Request processed successfully!</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-0.5">Category</p>
                    <CategoryBadge category={result.category} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-0.5">Priority</p>
                    <PriorityBadge priority={result.priority} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-0.5">Confidence</p>
                    <ConfidenceBar confidence={result.confidence} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-0.5">Route</p>
                    <p className="text-xs font-medium text-slate-700">{result.routeDestination}</p>
                  </div>
                </div>
                <a href={`/requests/${result.id}`} className="block text-xs text-blue-600 hover:text-blue-700 mt-2">
                  View Full Details →
                </a>
              </div>
            )}
          </form>
        </Card>

        <div className="space-y-4">
          {/* Webhook Test */}
          <Card title="Webhook Test" subtitle="Test the POST /api/webhook endpoint directly">
            <div className="px-5 py-4 space-y-3">
              <textarea
                value={webhookBody}
                onChange={e => setWebhookBody(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <button
                onClick={handleWebhook}
                disabled={webhookSubmitting}
                className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {webhookSubmitting ? 'Sending...' : 'Send Webhook'}
              </button>
              {webhookResult && (
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 overflow-x-auto max-h-48">
                  {webhookResult}
                </pre>
              )}
            </div>
          </Card>

          {/* Seed Data */}
          <Card title="Demo Data Management" subtitle="Seed or reset the database with demo records">
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-slate-500">
                This will reset the database and populate it with 25+ realistic demo records
                covering all categories, priorities, and statuses.
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
              </button>
              {seedResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  {seedResult}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
