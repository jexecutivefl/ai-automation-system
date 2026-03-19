import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { classifyRequest } from '@/lib/ai-service'
import { executeWorkflow } from '@/lib/workflow-engine'
import type { Request } from '@/lib/types'

export async function GET(req: globalThis.Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const db = getDb()
    const conditions: string[] = []
    const params: unknown[] = []

    if (category) {
      conditions.push('category = ?')
      params.push(category)
    }
    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }
    if (priority) {
      conditions.push('priority = ?')
      params.push(priority)
    }
    if (search) {
      conditions.push('(title LIKE ? OR rawContent LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const total = (db.prepare(`SELECT COUNT(*) as count FROM requests ${whereClause}`).get(...params) as { count: number }).count

    const data = db.prepare(
      `SELECT * FROM requests ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as Request[]

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('List requests error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: globalThis.Request) {
  try {
    const body = await req.json()
    const { title, content, sourceType, sourceRef } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'title and content are required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const id = uuidv4()
    const now = new Date().toISOString()

    // Create pending request
    db.prepare(`
      INSERT INTO requests (id, sourceType, sourceRef, title, rawContent, extractedData, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sourceType || 'web_form', sourceRef || '', title, content, '{}', 'pending', now, now)

    // Log request_received
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, 'request_received', `Request received from ${sourceType || 'web_form'}`, JSON.stringify({ sourceType }), now)

    // Classify
    const classification = await classifyRequest(content, title)

    // Log classification_completed
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, 'classification_completed', `Classified as ${classification.category} with confidence ${classification.confidence}`, JSON.stringify(classification), new Date().toISOString())

    // Update request with classification
    db.prepare(`
      UPDATE requests
      SET category = ?, priority = ?, confidence = ?, extractedData = ?, routeDestination = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      classification.category,
      classification.priority,
      classification.confidence,
      JSON.stringify(classification.extractedData),
      classification.routeRecommendation,
      'classified',
      new Date().toISOString(),
      id
    )

    // Execute workflow
    await executeWorkflow(id, classification.category, classification.extractedData)

    // Update status to routed
    db.prepare(`
      UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?
    `).run('routed', new Date().toISOString(), id)

    // Fetch full record
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request

    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    console.error('Create request error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
