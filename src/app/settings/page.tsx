'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/shared/card'

interface HealthInfo {
  status: string
  classifierMode: string
  timestamp: string
  uptime: number
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthInfo | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">System configuration and service status</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="System Status">
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Service Health</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-sm font-medium text-slate-700 capitalize">{health?.status || 'Checking...'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Classifier Mode</span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                {health?.classifierMode || '...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Uptime</span>
              <span className="text-sm text-slate-700 tabular-nums">
                {health?.uptime ? `${Math.floor(health.uptime / 60)} min` : '...'}
              </span>
            </div>
          </div>
        </Card>

        <Card title="AI Classification Engine">
          <div className="px-5 py-4 space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-xs font-medium text-slate-700 mb-2">Mock Mode (Default)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses keyword-based classification with confidence scoring. No API key required.
                Categories are determined by matching keywords in the request text.
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-xs font-medium text-slate-700 mb-2">OpenAI Mode</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses GPT-4o-mini for intelligent classification. Set <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">OPENAI_API_KEY</code> and{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">CLASSIFIER_MODE=openai</code> in your environment.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Environment Variables">
          <div className="px-5 py-4">
            <div className="space-y-3">
              {[
                { name: 'CLASSIFIER_MODE', desc: 'Classification engine mode', default: 'mock' },
                { name: 'OPENAI_API_KEY', desc: 'OpenAI API key for live classification', default: '(not set)' },
                { name: 'DATABASE_PATH', desc: 'SQLite database file path', default: './data/automation.db' },
              ].map(env => (
                <div key={env.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <code className="text-xs font-medium text-slate-700">{env.name}</code>
                    <p className="text-[11px] text-slate-400 mt-0.5">{env.desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">{env.default}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Supported Categories">
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { cat: 'Support Ticket', dest: 'Zendesk' },
                { cat: 'Sales Lead', dest: 'Salesforce' },
                { cat: 'Billing', dest: 'Stripe' },
                { cat: 'Technical Issue', dest: 'Jira' },
                { cat: 'General Inquiry', dest: 'General Inbox' },
                { cat: 'Onboarding', dest: 'Onboarding Team' },
                { cat: 'Document Review', dest: 'Legal Review' },
                { cat: 'Urgent Escalation', dest: 'Incident Response' },
              ].map(({ cat, dest }) => (
                <div key={cat} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-slate-700">{cat}</span>
                  <span className="text-[11px] text-slate-400">→ {dest}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
