import { NextResponse } from 'next/server'
import { getClassifierMode } from '@/lib/ai-service'

const startTime = Date.now()

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      classifierMode: getClassifierMode(),
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
