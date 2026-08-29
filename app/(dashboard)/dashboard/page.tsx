import Link from 'next/link'
import { Plus, FileText, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency, formatDate, STATUS_COLORS, TRADE_LABELS } from '@/lib/utils'
import { Estimate } from '@/types'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  const { data: estimates = [] } = await supabase
    .from('estimates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allEstimates = [] } = await supabase
    .from('estimates')
    .select('total, status')
    .eq('user_id', user.id)

  const totalRevenue = (allEstimates as Estimate[])
    .filter((e) => e.status === 'accepted')
    .reduce((sum, e) => sum + e.total, 0)

  const totalEstimates = allEstimates?.length ?? 0
  const acceptedCount = allEstimates?.filter((e: Estimate) => e.status === 'accepted').length ?? 0
  const acceptanceRate = totalEstimates > 0 ? Math.round((acceptedCount / totalEstimates) * 100) : 0

  const pendingValue = (allEstimates as Estimate[])
    .filter((e) => e.status === 'sent')
    .reduce((sum, e) => sum + e.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <Link
          href="/estimates/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New estimate
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total estimates', value: totalEstimates.toString(), icon: <FileText className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Revenue closed', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
          { label: 'Acceptance rate', value: `${acceptanceRate}%`, icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Pending value', value: formatCurrency(pendingValue), icon: <Clock className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent estimates */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Estimates</h2>
          <Link href="/estimates" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>

        {(!estimates || estimates.length === 0) ? (
          <div className="px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No estimates yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first estimate to get started</p>
            <Link href="/estimates/new" className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Create estimate
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(estimates as Estimate[]).map((est) => (
              <Link key={est.id} href={`/estimates/${est.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{est.job_title || est.estimate_number}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{est.customer_name} · {TRADE_LABELS[est.trade_type]} · {formatDate(est.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[est.status]}`}>
                    {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(est.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
