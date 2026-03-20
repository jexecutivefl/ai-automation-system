'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/shared/card'
import { useToast } from '@/components/shared/toast'

interface HealthInfo {
  status: string
  classifierMode: string
  timestamp: string
  uptime: number
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthInfo | null>(null)
  const [classifierMode, setClassifierMode] = useState<'mock' | 'openai'>('mock')
  const [toggling, setToggling] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setHealth(data)
        setClassifierMode(data.classifierMode === 'openai' ? 'openai' : 'mock')
      })
      .catch(() => {})
  }, [])

  const handleToggleMode = async () => {
    const newMode = classifierMode === 'mock' ? 'openai' : 'mock'
    setToggling(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classifierMode: newMode }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const data = await res.json()
      setClassifierMode(data.classifierMode)
      if (data.classifierMode === 'openai') {
        toast('Classifier mode set to OpenAI. Requires API key to function.', 'warning')
      } else {
        toast('Classifier mode set to Mock (keyword-based)', 'success')
      }
    } catch {
      toast('Failed to update classifier mode', 'error')
    } finally {
      setToggling(false)
    }
  }

  const handleSeed = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    setSeeding(true)
    setConfirmReset(false)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to seed')
      toast('Database reset and seeded with demo data', 'success')
    } catch {
      toast('Failed to seed database', 'error')
    } finally {
      setSeeding(false)
    }
  }

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
              <div>
                <span className="text-sm text-slate-600">Classifier Mode</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Toggle between mock and OpenAI</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">{classifierMode === 'mock' ? 'Mock' : 'OpenAI'}</span>
                <button
                  onClick={handleToggleMode}
                  disabled={toggling}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
                    classifierMode === 'openai' ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      classifierMode === 'openai' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
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
            <div className={`rounded-lg p-4 ${classifierMode === 'mock' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {classifierMode === 'mock' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                <h4 className="text-xs font-medium text-slate-700">Mock Mode</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses keyword-based classification with confidence scoring. No API key required.
              </p>
            </div>
            <div className={`rounded-lg p-4 ${classifierMode === 'openai' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {classifierMode === 'openai' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                <h4 className="text-xs font-medium text-slate-700">OpenAI Mode</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses GPT-4o-mini for intelligent classification. Requires <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">OPENAI_API_KEY</code> environment variable.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 italic">Settings persist until server restart.</p>
          </div>
        </Card>

        <Card title="Database Management">
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-slate-500">
              Reset the database and populate with 25+ realistic demo records covering all categories, priorities, and statuses.
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                confirmReset
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {seeding ? 'Seeding...' : confirmReset ? 'Click again to confirm reset' : 'Reset & Seed Demo Data'}
            </button>
            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            )}
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
                  <span className="text-[11px] text-slate-400">&rarr; {dest}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
