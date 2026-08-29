import Anthropic from '@anthropic-ai/sdk'
import { AIEstimateRequest, LineItem } from '@/types'
import { generateId } from './utils'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateEstimate(request: AIEstimateRequest): Promise<{
  line_items: LineItem[]
  notes: string
  job_title: string
}> {
  const prompt = `You are an expert ${request.trade_type} contractor with 20 years of experience. Generate a detailed, professional cost estimate for the following job.

Trade Type: ${request.trade_type}
Job Description: ${request.job_description}
Location: ${request.job_address}
${request.square_footage ? `Square Footage: ${request.square_footage} sq ft` : ''}
${request.additional_notes ? `Additional Notes: ${request.additional_notes}` : ''}

Return a JSON object with this exact structure:
{
  "job_title": "Brief job title (max 8 words)",
  "line_items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit": "unit type (hr, ea, sq ft, linear ft, etc.)",
      "unit_price": 0.00,
      "category": "labor|material|equipment|permit|other"
    }
  ],
  "notes": "Professional notes about the estimate, assumptions made, and any important caveats"
}

Rules:
- Include realistic market-rate prices for ${request.job_address} area
- Break down labor and materials separately
- Include 3-12 line items depending on job complexity
- Labor rates: plumbing/electrical/HVAC $85-150/hr, general $65-95/hr
- Add permit fees if applicable
- Be specific in descriptions (e.g. "Install 3/4 inch copper supply line" not just "plumbing work")
- Return ONLY the JSON, no other text`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const parsed = JSON.parse(content.text)

  const line_items: LineItem[] = parsed.line_items.map((item: Omit<LineItem, 'id' | 'total'>) => ({
    id: generateId(),
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
    category: item.category,
  }))

  return {
    job_title: parsed.job_title,
    line_items,
    notes: parsed.notes,
  }
}
