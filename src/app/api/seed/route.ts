import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

export async function POST() {
  try {
    const result = seedDatabase()

    return NextResponse.json({
      success: true,
      message: `Database seeded with ${result.requests} requests, ${result.workflows} workflows, and ${result.logs} log entries`,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
