import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Request, DashboardStats } from '@/lib/types'

export async function GET() {
  try {
    const db = getDb()

    // Total requests
    const totalRequests = (db.prepare('SELECT COUNT(*) as count FROM requests').get() as { count: number }).count

    // Success rate: percentage of requests with status completed or routed
    const successCount = (db.prepare(
      "SELECT COUNT(*) as count FROM requests WHERE status IN ('completed', 'routed')"
    ).get() as { count: number }).count
    const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 10000) / 100 : 0

    // Average confidence (where not null)
    const avgResult = db.prepare(
      'SELECT AVG(confidence) as avg FROM requests WHERE confidence IS NOT NULL'
    ).get() as { avg: number | null }
    const averageConfidence = avgResult.avg !== null ? Math.round(avgResult.avg * 100) / 100 : 0

    // Active workflows
    const activeWorkflows = (db.prepare(
      "SELECT COUNT(*) as count FROM workflows WHERE status IN ('pending', 'in_progress')"
    ).get() as { count: number }).count

    // Category breakdown
    const categoryRows = db.prepare(
      'SELECT category, COUNT(*) as count FROM requests WHERE category IS NOT NULL GROUP BY category'
    ).all() as { category: string; count: number }[]
    const categoryBreakdown: Record<string, number> = {}
    for (const row of categoryRows) {
      categoryBreakdown[row.category] = row.count
    }

    // Priority breakdown
    const priorityRows = db.prepare(
      'SELECT priority, COUNT(*) as count FROM requests WHERE priority IS NOT NULL GROUP BY priority'
    ).all() as { priority: string; count: number }[]
    const priorityBreakdown: Record<string, number> = {}
    for (const row of priorityRows) {
      priorityBreakdown[row.priority] = row.count
    }

    // Status breakdown
    const statusRows = db.prepare(
      'SELECT status, COUNT(*) as count FROM requests GROUP BY status'
    ).all() as { status: string; count: number }[]
    const statusBreakdown: Record<string, number> = {}
    for (const row of statusRows) {
      statusBreakdown[row.status] = row.count
    }

    // Requests over time (last 14 days)
    const requestsOverTime = db.prepare(
      "SELECT substr(createdAt, 1, 10) as date, COUNT(*) as count FROM requests GROUP BY substr(createdAt, 1, 10) ORDER BY date ASC LIMIT 14"
    ).all() as { date: string; count: number }[]

    // Recent activity: last 10 requests
    const recentActivity = db.prepare(
      'SELECT * FROM requests ORDER BY createdAt DESC LIMIT 10'
    ).all() as Request[]

    const stats: DashboardStats = {
      totalRequests,
      successRate,
      averageConfidence,
      activeWorkflows,
      categoryBreakdown,
      priorityBreakdown,
      statusBreakdown,
      requestsOverTime,
      recentActivity,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
