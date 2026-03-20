import { NextResponse } from 'next/server'
import { getClassifierMode, setClassifierMode } from '@/lib/ai-service'

export async function GET() {
  return NextResponse.json({ classifierMode: getClassifierMode() })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { classifierMode } = body

    if (classifierMode !== 'mock' && classifierMode !== 'openai') {
      return NextResponse.json(
        { error: 'Invalid classifier mode. Must be "mock" or "openai".' },
        { status: 400 }
      )
    }

    setClassifierMode(classifierMode)
    return NextResponse.json({ classifierMode: getClassifierMode() })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
