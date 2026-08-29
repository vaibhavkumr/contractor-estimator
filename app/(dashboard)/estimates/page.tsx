import Link from 'next/link'
import { Plus, FileText, Search } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency, formatDate, STATUS_COLORS, TRADE_LABELS } from '@/lib/utils'
import { Estimate } from '@/types'

export default async function EstimatesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: estimates = [] } = await supabase
    .from('estimates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-500 text-sm mt-1">{estimates?.length ?? 0} total estimates</p>
        </div>
        <Link
          href="/estimates/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New estimate
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimates..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All trades</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="hvac">HVAC</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {(!estimates || estimates.length === 0) ? (
          <div className="px-6 py-20 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No estimates yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first AI-powered estimate</p>
            <Link href="/estimates/new" className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Create estimate
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Job</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Trade</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
            <div className="divide-y divide-gray-50">
              {(estimates as Estimate[]).map((est) => (
                <Link key={est.id} href={`/estimates/${est.id}`} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-4">
                    <p className="font-medium text-gray-900 text-sm truncate">{est.job_title || est.estimate_number}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{est.estimate_number}</p>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 truncate">{est.customer_name || '—'}</div>
                  <div className="col-span-2 text-sm text-gray-600">{TRADE_LABELS[est.trade_type]}</div>
                  <div className="col-span-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[est.status]}`}>
                      {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-semibold text-gray-900 text-sm">{formatCurrency(est.total)}</div>
                  <div className="col-span-1 text-right text-xs text-gray-400">{formatDate(est.created_at)}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
