import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { AutomationLog } from '@/lib/types'

export async function GET(req: globalThis.Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get('eventType')
    const requestId = searchParams.get('requestId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const db = getDb()
    const conditions: string[] = []
    const params: unknown[] = []

    if (eventType) {
      conditions.push('l.eventType = ?')
      params.push(eventType)
    }
    if (requestId) {
      conditions.push('l.requestId = ?')
      params.push(requestId)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const total = (db.prepare(
      `SELECT COUNT(*) as count FROM automation_logs l ${whereClause}`
    ).get(...params) as { count: number }).count

    const data = db.prepare(`
      SELECT l.*, r.title as requestTitle
      FROM automation_logs l
      LEFT JOIN requests r ON l.requestId = r.id
      ${whereClause}
      ORDER BY l.createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as (AutomationLog & { requestTitle: string })[]

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('List logs error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
