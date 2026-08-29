import { NextRequest, NextResponse } from 'next/server'
import { generateEstimate } from '@/lib/anthropic'
import { AIEstimateRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: AIEstimateRequest = await req.json()

    if (!body.trade_type || !body.job_description) {
      return NextResponse.json({ error: 'trade_type and job_description required' }, { status: 400 })
    }

    const result = await generateEstimate(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'Failed to generate estimate' }, { status: 500 })
  }
}
