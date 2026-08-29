'use client'

import { useEffect, useState } from 'react'
import { Save, CreditCard, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CompanyProfile } from '@/types'
import { PLANS } from '@/lib/stripe'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'profile' | 'billing'>('profile')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [])

  function update(field: string, value: string | number) {
    setProfile((p) => ({ ...p, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('company_profiles')
      .update(profile)
      .eq('user_id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleUpgrade(plan: string) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company profile and subscription</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {(['profile', 'billing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { field: 'company_name', label: 'Company name', placeholder: 'Torres Plumbing LLC' },
                { field: 'owner_name', label: 'Owner / Contact name', placeholder: 'Mike Torres' },
                { field: 'email', label: 'Business email', placeholder: 'mike@torresplumbing.com' },
                { field: 'phone', label: 'Phone', placeholder: '(512) 555-0100' },
                { field: 'website', label: 'Website', placeholder: 'https://torresplumbing.com' },
                { field: 'license_number', label: 'License number', placeholder: 'TX-2024-00001' },
                { field: 'insurance_number', label: 'Insurance policy #', placeholder: 'INS-123456' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(profile as Record<string, string>)[field] || ''}
                    onChange={(e) => update(field, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Business Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => update('address', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                />
              </div>
              {[
                { field: 'city', label: 'City', placeholder: 'Austin' },
                { field: 'state', label: 'State', placeholder: 'TX' },
                { field: 'zip', label: 'ZIP', placeholder: '78701' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(profile as Record<string, string>)[field] || ''}
                    onChange={(e) => update(field, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quote Defaults</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default tax rate (%)</label>
                <input
                  type="number"
                  value={profile.default_tax_rate ?? 8.25}
                  onChange={(e) => update('default_tax_rate', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote valid for (days)</label>
                <input
                  type="number"
                  value={profile.default_validity_days ?? 30}
                  onChange={(e) => update('default_validity_days', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Default payment terms</label>
                <textarea
                  value={profile.payment_terms || ''}
                  onChange={(e) => update('payment_terms', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="50% deposit required. Balance due upon completion."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}

      {tab === 'billing' && (
        <div className="space-y-6">
          {profile.subscription_status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Active subscription</p>
                <p className="text-green-700 text-xs mt-0.5">
                  You&apos;re on the <strong>{profile.subscription_plan}</strong> plan.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isActive = profile.subscription_plan === key && profile.subscription_status === 'active'
              return (
                <div key={key} className={`bg-white rounded-xl border-2 p-6 ${isActive ? 'border-blue-600' : 'border-gray-100'}`}>
                  {isActive && (
                    <div className="text-xs font-bold text-blue-600 mb-2">CURRENT PLAN</div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-black text-gray-900">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={isActive}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isActive ? 'Current plan' : 'Upgrade'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Billing managed by Stripe</p>
                <p className="text-gray-500 text-xs">To cancel or update payment method, contact support.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
