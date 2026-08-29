import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { Estimate, CompanyProfile } from '@/types'
import { formatCurrency, TRADE_LABELS } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { estimateId } = await req.json()

  const { data: estimate } = await supabase
    .from('estimates').select('*').eq('id', estimateId).single() as { data: Estimate }

  if (!estimate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!estimate.customer_email) return NextResponse.json({ error: 'No customer email' }, { status: 400 })

  const { data: company } = await supabase
    .from('company_profiles').select('*').eq('user_id', estimate.user_id).single() as { data: CompanyProfile }

  const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/estimates/${estimateId}/pdf`

  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'quotes@yourdomain.com',
    to: estimate.customer_email,
    subject: `Estimate from ${company?.company_name || 'Your Contractor'}: ${estimate.job_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h2 style="color:#111827">Hi ${estimate.customer_name || 'there'},</h2>
        <p style="color:#374151;margin-top:12px">
          Thank you for the opportunity. Please find your estimate for <strong>${estimate.job_title}</strong> (${TRADE_LABELS[estimate.trade_type]}) below.
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0">
          <div style="font-size:14px;color:#6b7280">Estimate Total</div>
          <div style="font-size:36px;font-weight:800;color:#2563eb;margin-top:4px">${formatCurrency(estimate.total)}</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:4px">Estimate #${estimate.estimate_number}</div>
        </div>
        <a href="${pdfUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Full Estimate →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          This estimate is valid for 30 days. Reply to this email with any questions.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#6b7280;font-size:13px">
          ${company?.company_name || ''}<br/>
          ${company?.phone || ''} · ${company?.email || ''}
          ${company?.license_number ? `<br/>License #${company.license_number}` : ''}
        </p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
