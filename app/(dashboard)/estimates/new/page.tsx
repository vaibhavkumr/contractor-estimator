'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LineItem, TradeType } from '@/types'
import { formatCurrency, generateId, generateEstimateNumber, TRADE_LABELS } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const TRADE_TYPES: TradeType[] = ['plumbing', 'electrical', 'hvac', 'general', 'roofing', 'painting', 'carpentry']

export default function NewEstimatePage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'review'>('form')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    trade_type: 'plumbing' as TradeType,
    job_description: '',
    job_address: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    square_footage: '',
    notes: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [taxRate, setTaxRate] = useState(8.25)
  const [discountAmount, setDiscountAmount] = useState(0)

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100)
  const total = subtotal - discountAmount + taxAmount

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = Number(updated.quantity) * Number(updated.unit_price)
        }
        return updated
      })
    )
  }

  function removeLineItem(id: string) {
    setLineItems((items) => items.filter((i) => i.id !== id))
  }

  function addLineItem() {
    setLineItems((items) => [
      ...items,
      { id: generateId(), description: '', quantity: 1, unit: 'ea', unit_price: 0, total: 0, category: 'labor' },
    ])
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGenerating(true)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_type: form.trade_type,
          job_description: form.job_description,
          job_address: form.job_address,
          square_footage: form.square_footage ? Number(form.square_footage) : undefined,
          additional_notes: form.notes,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate estimate')

      const data = await res.json()
      setLineItems(data.line_items)
      setJobTitle(data.job_title)
      if (data.notes) setForm((f) => ({ ...f, notes: data.notes }))
      setStep('review')
    } catch {
      setError('Failed to generate estimate. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave(status: 'draft' | 'sent') {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: dbErr } = await supabase
      .from('estimates')
      .insert({
        user_id: user.id,
        estimate_number: generateEstimateNumber(),
        status,
        trade_type: form.trade_type,
        job_title: jobTitle,
        job_description: form.job_description,
        job_address: form.job_address,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        line_items: lineItems,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total,
        notes: form.notes,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single()

    if (dbErr) {
      setError(dbErr.message)
      setSaving(false)
      return
    }
    router.push(`/estimates/${data.id}`)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/estimates" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Estimate</h1>
      </div>

      {step === 'form' && (
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Job details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trade type</label>
                <select
                  value={form.trade_type}
                  onChange={(e) => update('trade_type', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRADE_TYPES.map((t) => (
                    <option key={t} value={t}>{TRADE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.job_description}
                  onChange={(e) => update('job_description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the job in detail. e.g. 'Replace existing 40-gallon water heater with new gas water heater, including disposal of old unit and permit filing.'"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">More detail = more accurate estimate. Describe materials, scope, and any special conditions.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job address</label>
                  <input
                    type="text"
                    value={form.job_address}
                    onChange={(e) => update('job_address', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Austin, TX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square footage (optional)</label>
                  <input
                    type="number"
                    value={form.square_footage}
                    onChange={(e) => update('square_footage', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1,800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer (optional)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => update('customer_name', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => update('customer_email', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => update('customer_phone', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={generating || !form.job_description}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-base transition-colors"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating estimate...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate AI Estimate
              </>
            )}
          </button>
          {generating && (
            <p className="text-center text-sm text-gray-500">Analyzing job details and calculating costs...</p>
          )}
        </form>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          {/* Job title */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <Zap className="w-3.5 h-3.5" />
                AI Generated — review and edit as needed
              </div>
            </div>

            <div className="p-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-5">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2">Unit price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        value={item.unit}
                        onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, 'unit_price', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeLineItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addLineItem}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 px-2"
              >
                <Plus className="w-4 h-4" />
                Add line item
              </button>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>$</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span>%</span>
                </div>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Terms</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Payment terms, exclusions, warranty, etc."
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save as draft'}
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save & send to customer'}
            </button>
          </div>

          <button
            onClick={() => setStep('form')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Regenerate estimate
          </button>
        </div>
      )}
    </div>
  )
}
