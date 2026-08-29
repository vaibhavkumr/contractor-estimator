'use client'

import { useEffect, useState } from 'react'
import { Plus, Users, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/types'
import { formatDate } from '@/lib/utils'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setCustomers(data ?? [])
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('customers').insert({ ...form, user_id: user.id })
    setForm({ name: '', email: '', phone: '', address: '', notes: '' })
    setShowAdd(false)
    setSaving(false)
    loadCustomers()
  }

  async function handleDelete(id: string) {
    await supabase.from('customers').delete().eq('id', id)
    setCustomers((c) => c.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} total customers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add customer
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Customer</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { field: 'name', label: 'Name', placeholder: 'John Smith', required: true },
                { field: 'email', label: 'Email', placeholder: 'john@email.com', required: false },
                { field: 'phone', label: 'Phone', placeholder: '(555) 000-0000', required: false },
              ].map(({ field, label, placeholder, required }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                    required={required}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, Austin TX"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save customer'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100">
        {customers.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No customers yet</p>
            <p className="text-gray-400 text-sm mt-1">Add customers to quickly pre-fill estimates</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {[c.email, c.phone, c.address].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
