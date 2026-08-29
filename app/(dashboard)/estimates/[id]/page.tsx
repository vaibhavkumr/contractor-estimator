'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Send, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Estimate, CompanyProfile } from '@/types'
import { formatCurrency, formatDate, STATUS_COLORS, TRADE_LABELS } from '@/lib/utils'

export default function EstimateDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: est }, { data: comp }] = await Promise.all([
        supabase.from('estimates').select('*').eq('id', id).single(),
        supabase.from('company_profiles').select('*').eq('user_id', user.id).single(),
      ])

      setEstimate(est)
      setCompany(comp)
      setLoading(false)
    }
    load()
  }, [id])

  async function updateStatus(status: Estimate['status']) {
    await supabase.from('estimates').update({ status }).eq('id', id)
    setEstimate((e) => e ? { ...e, status } : e)
  }

  async function handleDelete() {
    if (!confirm('Delete this estimate?')) return
    await supabase.from('estimates').delete().eq('id', id)
    router.push('/estimates')
  }

  async function handleSendEmail() {
    if (!estimate?.customer_email) {
      setStatusMsg('No customer email on this estimate.')
      return
    }
    setSending(true)
    const res = await fetch('/api/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimateId: id }),
    })
    if (res.ok) {
      setStatusMsg('Quote emailed successfully!')
      updateStatus('sent')
    } else {
      setStatusMsg('Failed to send email. Check your Resend API key.')
    }
    setSending(false)
    setTimeout(() => setStatusMsg(''), 4000)
  }

  function handleDownloadPDF() {
    window.open(`/api/estimates/${id}/pdf`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!estimate) return <div>Estimate not found.</div>

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/estimates" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{estimate.job_title}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[estimate.status]}`}>
                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{estimate.estimate_number} · Created {formatDate(estimate.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {estimate.status === 'sent' && (
            <>
              <button
                onClick={() => updateStatus('accepted')}
                className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark accepted
              </button>
              <button
                onClick={() => updateStatus('declined')}
                className="flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Mark declined
              </button>
            </>
          )}
          <button
            onClick={handleSendEmail}
            disabled={sending}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Email quote'}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-4 bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-lg">{statusMsg}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main quote */}
        <div className="col-span-2 space-y-5">
          {/* Company & customer */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">From</p>
                <p className="font-semibold text-gray-900">{company?.company_name || 'Your Company'}</p>
                <p className="text-gray-600 text-sm">{company?.owner_name}</p>
                <p className="text-gray-600 text-sm">{company?.email}</p>
                <p className="text-gray-600 text-sm">{company?.phone}</p>
                {company?.license_number && (
                  <p className="text-gray-500 text-xs mt-1">Lic. #{company.license_number}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bill to</p>
                <p className="font-semibold text-gray-900">{estimate.customer_name || '—'}</p>
                <p className="text-gray-600 text-sm">{estimate.customer_email}</p>
                <p className="text-gray-600 text-sm">{estimate.customer_phone}</p>
                {estimate.job_address && (
                  <p className="text-gray-600 text-sm mt-1">{estimate.job_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
            </div>

            <div className="divide-y divide-gray-50">
              {/* Category grouping */}
              {['labor', 'material', 'equipment', 'permit', 'other'].map((cat) => {
                const items = estimate.line_items.filter((i) => i.category === cat)
                if (!items.length) return null
                return (
                  <div key={cat}>
                    <div className="px-6 py-2 bg-gray-50">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{cat}</span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center">
                        <div className="col-span-6 text-sm text-gray-700">{item.description}</div>
                        <div className="col-span-2 text-sm text-gray-500 text-center">{item.quantity} {item.unit}</div>
                        <div className="col-span-2 text-sm text-gray-500 text-right">{formatCurrency(item.unit_price)}</div>
                        <div className="col-span-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              {estimate.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(estimate.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({estimate.tax_rate}%)</span>
                <span>{formatCurrency(estimate.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-xl pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>

          {estimate.notes && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Notes & Terms</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{estimate.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Trade</span>
                <span className="font-medium text-gray-900">{TRADE_LABELS[estimate.trade_type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium text-gray-900">{estimate.line_items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid until</span>
                <span className="font-medium text-gray-900">{estimate.valid_until ? formatDate(estimate.valid_until) : '30 days'}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900 text-base">{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Download PDF
              </button>
              <button
                onClick={handleSendEmail}
                className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 text-gray-400" />
                Email to customer
              </button>
              {estimate.status === 'draft' && (
                <button
                  onClick={() => updateStatus('sent')}
                  className="w-full flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as sent
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
