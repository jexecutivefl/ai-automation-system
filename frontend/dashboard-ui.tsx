import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface LogEntry {
  id: string
  timestamp: string
  text: string
  source: string
  classification: string
  confidence: number
  status: string
}

interface Stats {
  totalProcessed: number
  successRate: number
  averageConfidence: number
  classificationBreakdown: Record<string, number>
  recentActivity: LogEntry[]
}

interface TestResult {
  classification: string
  confidence: number
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function DashboardUI() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch')
      const statsData = await res.json()
      setStats(statsData)
      setError(null)
      setLoading(false)
    } catch {
      setError('Could not connect to backend. Please ensure the server is running.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleTest = async () => {
    if (!testInput.trim() || submitting) return
    setSubmitting(true)
    setTestResult(null)
    try {
      const res = await fetch('/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testInput, source: 'dashboard' })
      })
      const data = await res.json()
      setTestResult(data)
      setTestInput('')
      fetchData()
    } catch {
      setError('Failed to process request.')
    } finally {
      setSubmitting(false)
    }
  }

  const classificationData = stats?.classificationBreakdown
    ? Object.entries(stats.classificationBreakdown).map(([name, value]) => ({ name, value }))
    : []

  const uniqueClassifications = classificationData.length

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading dashboard...</div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorBox}>
          <h2 style={{ margin: '0 0 8px 0', color: '#DC2626' }}>Connection Error</h2>
          <p style={{ margin: 0, color: '#6B7280' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>AI Automation Dashboard</h1>
        <p style={styles.headerSubtitle}>
          Real-time monitoring for AI-powered workflow automation
        </p>
      </header>

      <div style={styles.content}>
        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <StatCard label="Total Processed" value={stats?.totalProcessed ?? 0} />
          <StatCard
            label="Success Rate"
            value={`${(stats?.successRate ?? 0).toFixed(1)}%`}
          />
          <StatCard
            label="Avg Confidence"
            value={`${((stats?.averageConfidence ?? 0) * 100).toFixed(1)}%`}
          />
          <StatCard label="Classifications" value={uniqueClassifications} />
        </div>

        {/* Two-column layout */}
        <div style={styles.columnsRow}>
          {/* Recent Activity */}
          <div style={{ ...styles.card, flex: '3 1 0' }}>
            <h2 style={styles.cardTitle}>Recent Activity</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Time', 'Input', 'Classification', 'Confidence', 'Status'].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#9CA3AF' }}>
                        No activity yet. Use the test panel below to send a request.
                      </td>
                    </tr>
                  ) : (
                    stats.recentActivity.map((log, i) => (
                      <tr
                        key={log.id || i}
                        style={{
                          backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
                        }}
                      >
                        <td style={styles.td}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={styles.td} title={log.text}>
                          {log.text && log.text.length > 50
                            ? log.text.slice(0, 50) + '...'
                            : log.text}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{log.classification}</span>
                        </td>
                        <td style={styles.td}>
                          {(log.confidence * 100).toFixed(1)}%
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusDot,
                              backgroundColor:
                                log.status === 'completed' ? '#10B981' : '#EF4444'
                            }}
                          />
                          {log.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classification Breakdown */}
          <div style={{ ...styles.card, flex: '2 1 0' }}>
            <h2 style={styles.cardTitle}>Classification Breakdown</h2>
            {classificationData.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>
                No data available
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={classificationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {classificationData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={styles.legendContainer}>
                  {classificationData.map((entry, i) => (
                    <div key={entry.name} style={styles.legendItem}>
                      <span
                        style={{
                          ...styles.legendDot,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length]
                        }}
                      />
                      <span style={styles.legendLabel}>{entry.name}</span>
                      <span style={styles.legendValue}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Manual Test Panel */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Manual Test Panel</h2>
          <div style={styles.testRow}>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              placeholder="Enter text to classify..."
              style={styles.testInput}
            />
            <button
              onClick={handleTest}
              disabled={submitting || !testInput.trim()}
              style={{
                ...styles.testButton,
                opacity: submitting || !testInput.trim() ? 0.6 : 1
              }}
            >
              {submitting ? 'Processing...' : 'Process Request'}
            </button>
          </div>
          {testResult && (
            <div style={styles.resultBox}>
              <strong>Result:</strong> {testResult.classification} &mdash;
              Confidence: {(testResult.confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F1F5F9',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F1F5F9',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 12,
    padding: '32px 48px',
    textAlign: 'center' as const
  },
  header: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: '28px 40px'
  },
  headerTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  headerSubtitle: {
    margin: '6px 0 0 0',
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 400
  },
  content: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '24px 32px'
  },
  statsRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    textAlign: 'center' as const
  },
  statValue: {
    fontSize: 36,
    fontWeight: 700,
    color: '#1E293B',
    lineHeight: 1.1
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  columnsRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#1E293B'
  },
  tableWrapper: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '2px solid #E2E8F0',
    color: '#64748B',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #F1F5F9',
    color: '#334155'
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    padding: '2px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 500
  },
  statusDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6,
    verticalAlign: 'middle'
  },
  legendContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    marginTop: 8
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0
  },
  legendLabel: {
    flex: 1,
    color: '#334155'
  },
  legendValue: {
    fontWeight: 600,
    color: '#1E293B'
  },
  testRow: {
    display: 'flex',
    gap: 12
  },
  testInput: {
    flex: 1,
    padding: '14px 16px',
    fontSize: 15,
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    outline: 'none',
    backgroundColor: '#F9FAFB'
  },
  testButton: {
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const
  },
  resultBox: {
    marginTop: 16,
    padding: '12px 16px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: 8,
    fontSize: 14,
    color: '#166534'
  }
}
