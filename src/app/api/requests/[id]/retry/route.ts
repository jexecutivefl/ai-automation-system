import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { classifyRequest } from '@/lib/ai-service'
import { executeWorkflow } from '@/lib/workflow-engine'
import type { Request } from '@/lib/types'

export async function POST(
  _req: globalThis.Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request | undefined
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    // Log retry_requested
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, 'retry_requested', 'Retry classification requested', JSON.stringify({ previousCategory: request.category, previousConfidence: request.confidence }), now)

    // Re-classify
    const classification = await classifyRequest(request.rawContent, request.title)

    // Update request with new classification
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

    // Log classification_completed
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), id, 'classification_completed', `Re-classified as ${classification.category} with confidence ${classification.confidence}`, JSON.stringify(classification), new Date().toISOString())

    // Execute new workflow
    await executeWorkflow(id, classification.category, classification.extractedData)

    // Update status to routed
    db.prepare(`
      UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?
    `).run('routed', new Date().toISOString(), id)

    // Fetch updated request
    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Retry error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
