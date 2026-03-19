import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { classifyRequest } from '@/lib/ai-service'
import { executeWorkflow } from '@/lib/workflow-engine'
import type { Request } from '@/lib/types'

export async function POST(req: globalThis.Request) {
  try {
    const body = await req.json()
    const { text, source, sourceType, title, ...metadata } = body

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'text is required' },
        { status: 400 }
      )
    }

    const db = getDb()
    const id = uuidv4()
    const now = new Date().toISOString()
    const reqTitle = title || (text.length > 80 ? text.slice(0, 80) + '...' : text)

    // Create pending request
    db.prepare(`
      INSERT INTO requests (id, sourceType, sourceRef, title, rawContent, extractedData, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, sourceType || 'api', source || '', reqTitle, text, JSON.stringify(metadata), 'pending', now, now)

    // Log request_received
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, 'request_received', `Request received from ${sourceType || 'api'}`, JSON.stringify({ source, sourceType }), now)

    // Classify
    const classification = await classifyRequest(text, title)

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
    const finalNow = new Date().toISOString()
    db.prepare(`
      UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?
    `).run('routed', finalNow, id)

    // Fetch full record
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request

    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
