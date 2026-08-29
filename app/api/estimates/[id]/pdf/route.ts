import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Estimate, CompanyProfile } from '@/types'
import { formatCurrency, formatDate, TRADE_LABELS } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: estimate } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .single() as { data: Estimate }

  if (!estimate) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', estimate.user_id)
    .single() as { data: CompanyProfile }

  const html = buildPdfHtml(estimate, company)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="${estimate.estimate_number}.html"`,
    },
  })
}

function buildPdfHtml(estimate: Estimate, company: CompanyProfile | null): string {
  const categoryOrder = ['labor', 'material', 'equipment', 'permit', 'other']

  const lineItemRows = categoryOrder.flatMap((cat) => {
    const items = estimate.line_items.filter((i) => i.category === cat)
    if (!items.length) return []
    return [
      `<tr><td colspan="5" style="background:#f8fafc;padding:6px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">${cat}</td></tr>`,
      ...items.map(
        (item) => `
        <tr>
          <td style="padding:10px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f1f5f9">${item.description}</td>
          <td style="padding:10px 12px;font-size:13px;color:#6b7280;text-align:center;border-bottom:1px solid #f1f5f9">${item.quantity} ${item.unit}</td>
          <td style="padding:10px 12px;font-size:13px;color:#6b7280;text-align:right;border-bottom:1px solid #f1f5f9">${formatCurrency(item.unit_price)}</td>
          <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f1f5f9">${formatCurrency(item.total)}</td>
        </tr>`
      ),
    ]
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${estimate.estimate_number} — ${company?.company_name || 'Quote'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111827; padding: 48px; max-width: 860px; margin: 0 auto; }
    @media print { body { padding: 24px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:24px;display:flex;gap:12px">
    <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">⬇ Download / Print PDF</button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
    <div>
      <div style="font-size:28px;font-weight:800;color:#111827">${company?.company_name || 'Your Company'}</div>
      ${company?.owner_name ? `<div style="color:#6b7280;font-size:14px;margin-top:4px">${company.owner_name}</div>` : ''}
      ${company?.phone ? `<div style="color:#6b7280;font-size:13px">${company.phone}</div>` : ''}
      ${company?.email ? `<div style="color:#6b7280;font-size:13px">${company.email}</div>` : ''}
      ${company?.license_number ? `<div style="color:#9ca3af;font-size:12px;margin-top:4px">License #${company.license_number}</div>` : ''}
    </div>
    <div style="text-align:right">
      <div style="font-size:32px;font-weight:900;color:#2563eb;letter-spacing:-1px">ESTIMATE</div>
      <div style="color:#6b7280;font-size:13px;margin-top:6px">#${estimate.estimate_number}</div>
      <div style="color:#6b7280;font-size:13px">Date: ${formatDate(estimate.created_at)}</div>
      ${estimate.valid_until ? `<div style="color:#6b7280;font-size:13px">Valid until: ${formatDate(estimate.valid_until)}</div>` : ''}
    </div>
  </div>

  <!-- Divider -->
  <div style="height:3px;background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:2px;margin-bottom:32px"></div>

  <!-- Bill to + Job info -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px">
    <div style="background:#f8fafc;border-radius:12px;padding:20px">
      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Bill To</div>
      <div style="font-size:15px;font-weight:600;color:#111827">${estimate.customer_name || '—'}</div>
      ${estimate.customer_email ? `<div style="color:#6b7280;font-size:13px;margin-top:2px">${estimate.customer_email}</div>` : ''}
      ${estimate.customer_phone ? `<div style="color:#6b7280;font-size:13px">${estimate.customer_phone}</div>` : ''}
      ${estimate.job_address ? `<div style="color:#6b7280;font-size:13px;margin-top:4px">${estimate.job_address}</div>` : ''}
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:20px">
      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Job Details</div>
      <div style="font-size:15px;font-weight:600;color:#111827">${estimate.job_title}</div>
      <div style="color:#6b7280;font-size:12px;margin-top:4px">${TRADE_LABELS[estimate.trade_type]}</div>
      <div style="color:#6b7280;font-size:13px;margin-top:8px;line-height:1.5">${estimate.job_description}</div>
    </div>
  </div>

  <!-- Line items -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#1e293b">
        <th style="padding:12px;text-align:left;font-size:11px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.05em">Description</th>
        <th style="padding:12px;text-align:center;font-size:11px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.05em">Qty</th>
        <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.05em">Unit Price</th>
        <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.05em">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows.join('')}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px">
    <div style="width:280px">
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">
        <span>Subtotal</span><span>${formatCurrency(estimate.subtotal)}</span>
      </div>
      ${estimate.discount_amount > 0 ? `
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">
        <span>Discount</span><span>-${formatCurrency(estimate.discount_amount)}</span>
      </div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">
        <span>Tax (${estimate.tax_rate}%)</span><span>${formatCurrency(estimate.tax_amount)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:20px;font-weight:800;color:#111827">
        <span>Total</span><span style="color:#2563eb">${formatCurrency(estimate.total)}</span>
      </div>
    </div>
  </div>

  ${estimate.notes ? `
  <!-- Notes -->
  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:32px">
    <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Notes & Terms</div>
    <div style="font-size:13px;color:#374151;line-height:1.6;white-space:pre-line">${estimate.notes}</div>
  </div>` : ''}

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;color:#9ca3af;font-size:11px">
    <p>This estimate is valid for 30 days from the date of issue.</p>
    <p style="margin-top:4px">Questions? Contact us at ${company?.email || company?.phone || 'our office'}.</p>
    ${company?.website ? `<p style="margin-top:4px">${company.website}</p>` : ''}
  </div>
</body>
</html>`
}
