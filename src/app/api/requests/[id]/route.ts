import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import type { Request, Workflow, AutomationLog } from '@/lib/types'

export async function GET(
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

    const workflows = db.prepare(
      'SELECT * FROM workflows WHERE requestId = ? ORDER BY createdAt DESC'
    ).all(id) as Workflow[]

    const logs = db.prepare(
      'SELECT * FROM automation_logs WHERE requestId = ? ORDER BY createdAt DESC'
    ).all(id) as AutomationLog[]

    return NextResponse.json({
      success: true,
      data: { ...request, workflows, logs },
    })
  } catch (error) {
    console.error('Get request error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: globalThis.Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, priority } = body

    const db = getDb()

    const existing = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request | undefined
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    const updates: string[] = []
    const values: unknown[] = []

    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    if (priority !== undefined) {
      updates.push('priority = ?')
      values.push(priority)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    updates.push('updatedAt = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE requests SET ${updates.join(', ')} WHERE id = ?`).run(...values)

    // Log workflow_updated event
    db.prepare(`
      INSERT INTO automation_logs (id, requestId, eventType, message, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      id,
      'workflow_updated',
      `Request updated: ${Object.keys(body).join(', ')}`,
      JSON.stringify(body),
      now
    )

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Request

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
