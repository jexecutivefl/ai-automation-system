import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Workflow } from '@/lib/types'

export async function GET(req: globalThis.Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const requestId = searchParams.get('requestId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const db = getDb()
    const conditions: string[] = []
    const params: unknown[] = []

    if (status) {
      conditions.push('w.status = ?')
      params.push(status)
    }
    if (requestId) {
      conditions.push('w.requestId = ?')
      params.push(requestId)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const total = (db.prepare(
      `SELECT COUNT(*) as count FROM workflows w ${whereClause}`
    ).get(...params) as { count: number }).count

    const data = db.prepare(`
      SELECT w.*, r.title as requestTitle
      FROM workflows w
      LEFT JOIN requests r ON w.requestId = r.id
      ${whereClause}
      ORDER BY w.createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as (Workflow & { requestTitle: string })[]

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('List workflows error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
