import React, { useState, useEffect, useMemo } from 'react'
import { analyticsApi, revenueApi } from '../services/api'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  RefreshCw,
  Briefcase,
  Share2,
  Download,
  Search,
  CheckCircle2,
  Wallet,
  Layers,
  ArrowUpRight,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  KPICard,
  ChartCard,
  DataTable,
  StatusBadge,
  KPISkeleton,
  ChartSkeleton,
  EmptyState,
  ErrorState,
  Modal,
  ConfirmDialog,
} from '../components/ui'

const PIE_COLORS = ['#4f46e5', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6']
const SOURCES = [
  'Sponsorship',
  'Ad Revenue',
  'Affiliate Marketing',
  'Brand Collaboration',
  'Subscription Revenue',
]

interface Revenue {
  id: number
  source: string
  amount: number
  currency: string
  description?: string
  revenue_date: string
}

const emptyRevenueForm = {
  source: SOURCES[0],
  amount: '',
  currency: 'INR',
  description: '',
  revenue_date: new Date().toISOString().slice(0, 10),
}

function formatMonthLabel(monthStr: string): string {
  if (!monthStr || monthStr.length < 7) return monthStr
  const [year, month] = monthStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIdx = parseInt(month, 10) - 1
  return `${months[monthIdx] || month} '${year.slice(2)}`
}

export default function Revenue() {
  const [total, setTotal] = useState<{ total_revenue: number; currency: string } | null>(null)
  const [bySource, setBySource] = useState<Record<string, number>>({})
  const [monthly, setMonthly] = useState<{ month: string; revenue: number }[]>([])
  const [records, setRecords] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Chart view mode: 'monthly' bar vs 'cumulative' area
  const [chartMode, setChartMode] = useState<'monthly' | 'cumulative'>('monthly')

  // Filtering and searching in ledger
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All')
  const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc')

  // Modals & Dialogs
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Revenue | null>(null)
  const [form, setForm] = useState(emptyRevenueForm)
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([
      analyticsApi.revenueSummary(),
      analyticsApi.revenueBySource(),
      analyticsApi.revenueMonthly(),
      revenueApi.list(),
    ])
      .then(([s, bs, m, r]) => {
        setTotal(s.data)
        setBySource(bs.data || {})
        setMonthly(m.data || [])
        setRecords(r.data || [])
      })
      .catch(() => setError('Failed to load revenue data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyRevenueForm)
    setShowModal(true)
  }

  const openEdit = (r: Revenue) => {
    setEditing(r)
    setForm({
      source: r.source,
      amount: String(r.amount),
      currency: r.currency,
      description: r.description || '',
      revenue_date: r.revenue_date,
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.revenue_date) return
    setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editing) await revenueApi.update(editing.id, payload)
      else await revenueApi.create(payload)
      setShowModal(false)
      loadData()
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await revenueApi.delete(deleteTargetId)
      setDeleteTargetId(null)
      loadData()
    } catch {
      /* ignore */
    } finally {
      setDeleting(false)
    }
  }

  // Export ledger to CSV file
  const exportToCSV = () => {
    if (records.length === 0) return
    const headers = ['ID', 'Date', 'Source', 'Description', 'Amount', 'Currency', 'Status']
    const rows = records.map((r) => [
      r.id,
      r.revenue_date,
      `"${r.source}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.amount,
      r.currency,
      'Verified Payout',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `CreatorIQ_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const currencySymbol = total?.currency === 'INR' ? '₹' : '$'
  const totalRevenueAmount = total?.total_revenue ?? 0

  // Computed cumulative chart data
  const cumulativeMonthlyData = useMemo(() => {
    let runningTotal = 0
    return monthly.map((item) => {
      runningTotal += item.revenue
      return {
        month: item.month,
        formattedMonth: formatMonthLabel(item.month),
        revenue: item.revenue,
        cumulative: runningTotal,
      }
    })
  }, [monthly])

  // Chart data for revenue streams with percentage shares
  const sourceChartData = useMemo(() => {
    const totalVal = Object.values(bySource).reduce((acc, v) => acc + v, 0) || 1
    return Object.entries(bySource).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalVal) * 100).toFixed(1),
    }))
  }, [bySource])

  // Filter and sort records for ledger table
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSource = selectedSourceFilter === 'All' || r.source === selectedSourceFilter
        const matchesSearch =
          !searchQuery.trim() ||
          r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.revenue_date.includes(searchQuery)
        return matchesSource && matchesSearch
      })
      .sort((a, b) => {
        if (sortOption === 'date_desc') return b.revenue_date.localeCompare(a.revenue_date)
        if (sortOption === 'date_asc') return a.revenue_date.localeCompare(b.revenue_date)
        if (sortOption === 'amount_desc') return b.amount - a.amount
        if (sortOption === 'amount_asc') return a.amount - b.amount
        return 0
      })
  }, [records, selectedSourceFilter, searchQuery, sortOption])

  // Key metrics calculations
  const averageMonthly = monthly.length > 0 ? Math.round(totalRevenueAmount / monthly.length) : 0
  const highestTransaction = records.reduce<{ amount: number; description?: string }>(
    (max, r) => (r.amount > max.amount ? { amount: r.amount, description: r.description } : max),
    { amount: 0, description: '' }
  )
  const sponsorshipSum = (bySource['Sponsorship'] ?? 0) + (bySource['Brand Collaboration'] ?? 0)
  const adRevenueSum = bySource['Ad Revenue'] ?? 0
  const recurringSum = (bySource['Subscription Revenue'] ?? 0) + (bySource['Affiliate Marketing'] ?? 0)

  // Source icon helper
  const getSourceIcon = (sourceName: string) => {
    switch (sourceName) {
      case 'Sponsorship':
        return <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
      case 'Ad Revenue':
        return <DollarSign className="h-3.5 w-3.5 text-blue-600" />
      case 'Affiliate Marketing':
        return <Share2 className="h-3.5 w-3.5 text-amber-600" />
      case 'Brand Collaboration':
        return <Sparkles className="h-3.5 w-3.5 text-purple-600" />
      case 'Subscription Revenue':
        return <Users className="h-3.5 w-3.5 text-emerald-600" />
      default:
        return <Wallet className="h-3.5 w-3.5 text-slate-600" />
    }
  }

  const columns = [
    {
      header: 'Stream / Source',
      accessor: (item: Revenue) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/70 shadow-2xs">
            {getSourceIcon(item.source)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs leading-tight">{item.source}</span>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {item.source.includes('Revenue') || item.source.includes('Marketing') ? 'Recurring Stream' : 'Direct Deal'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Description & Campaign',
      accessor: (item: Revenue) => (
        <div className="max-w-md min-w-[200px]">
          <span className="text-slate-800 text-xs font-medium block truncate" title={item.description || '—'}>
            {item.description || 'Verified Creator Payout'}
          </span>
          <span className="text-[10px] text-slate-400">Ref ID: CIQ-REV-{item.id.toString().padStart(4, '0')}</span>
        </div>
      ),
    },
    {
      header: 'Payout Date',
      accessor: (item: Revenue) => (
        <div className="text-xs">
          <span className="font-mono text-slate-700 font-semibold">{item.revenue_date}</span>
          <span className="text-[10px] text-slate-400 block">{formatMonthLabel(item.revenue_date.slice(0, 7))}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: () => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" />
          Disbursed
        </span>
      ),
    },
    {
      header: 'Amount',
      className: 'text-right',
      accessor: (item: Revenue) => (
        <div className="text-right">
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
            {item.currency === 'INR' ? '₹' : '$'}
            {item.amount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">{item.currency}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: Revenue) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(item)}
            className="ciq-btn-ghost p-1.5 text-slate-500 hover:text-indigo-600"
            title="Edit record"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTargetId(item.id)}
            className="ciq-btn-ghost p-1.5 text-slate-400 hover:text-rose-600"
            title="Delete record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Revenue Analytics
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              12 Months Realized
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Realized creator income across sponsorships, platform monetization, affiliate commissions, and membership tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="ciq-btn-secondary text-xs"
            title="Export transactions as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button type="button" onClick={openCreate} className="ciq-btn-primary text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Record Revenue</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* 2. Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Gross Revenue"
              value={`${currencySymbol}${totalRevenueAmount.toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
              change={24.8}
              changeLabel="vs previous cycle"
            />
            <KPICard
              title="Brand Deals & Collabs"
              value={`${currencySymbol}${sponsorshipSum.toLocaleString()}`}
              icon={Briefcase}
              color="indigo"
              change={19.5}
              changeLabel="14 brand campaigns"
            />
            <KPICard
              title="Platform AdSense"
              value={`${currencySymbol}${adRevenueSum.toLocaleString()}`}
              icon={TrendingUp}
              color="blue"
              change={15.2}
              changeLabel="12 monthly payouts"
            />
            <KPICard
              title="Recurring & Affiliates"
              value={`${currencySymbol}${recurringSum.toLocaleString()}`}
              icon={Share2}
              color="amber"
              change={28.4}
              changeLabel="members + gear links"
            />
          </>
        )}
      </div>

      {/* 3. Monetization Telemetry & Health Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-3.5 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-400 shrink-0 border border-white/15">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Monthly Run-Rate
            </span>
            <span className="text-base sm:text-lg font-black text-white leading-tight block">
              {currencySymbol}{averageMonthly.toLocaleString()} / mo
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Predictable multi-stream pacing</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2 border-t md:border-t-0 md:border-l border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-400 shrink-0 border border-white/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Highest Campaign Payout
            </span>
            <span className="text-base sm:text-lg font-black text-white leading-tight block">
              {currencySymbol}{highestTransaction.amount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-300 truncate block max-w-xs" title={highestTransaction.description}>
              {highestTransaction.description || 'Verified Campaign'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2 border-t md:border-t-0 md:border-l border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400 shrink-0 border border-white/15">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Income Diversification
            </span>
            <span className="text-base sm:text-lg font-black text-white leading-tight block">
              5 Active Channels
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Low concentration risk (94% Health)</span>
          </div>
        </div>
      </div>

      {/* 4. Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Velocity & Trajectory Chart */}
        <ChartCard
          title="Earnings Trajectory"
          subtitle={
            chartMode === 'monthly'
              ? 'Monthly realized income across all channels'
              : 'Cumulative income accumulation trajectory'
          }
          action={
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartMode('monthly')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  chartMode === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly Bars
              </button>
              <button
                type="button"
                onClick={() => setChartMode('cumulative')}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  chartMode === 'cumulative' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cumulative
              </button>
            </div>
          }
          loading={loading}
          empty={monthly.length === 0}
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'monthly' ? (
                <BarChart data={cumulativeMonthlyData}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedMonth"
                    tick={{ fontSize: 10.5, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(val: number) => [`${currencySymbol}${val.toLocaleString()}`, 'Realized Income']}
                    labelFormatter={(label) => `Billing Cycle: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={cumulativeMonthlyData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedMonth"
                    tick={{ fontSize: 10.5, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${currencySymbol}${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${Math.round(v / 1000)}k`}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(val: number) => [`${currencySymbol}${val.toLocaleString()}`, 'Total Accumulated']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Revenue by Stream Donut & Legend */}
        <ChartCard
          title="Revenue Stream Share"
          subtitle="Portfolio allocation across 5 active creator monetization models"
          loading={loading}
          empty={sourceChartData.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-72 w-full pt-2">
            <div className="h-full w-full sm:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {sourceChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                    formatter={(val: number) => [`${currencySymbol}${val.toLocaleString()}`, 'Total Stream Income']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-2.5 text-xs">
              {sourceChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 block">
                      {currencySymbol}{item.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* 5. Revenue Transactions Ledger with Search, Filtering & Quick Stats */}
      <div className="ciq-card space-y-4">
        <div className="ciq-card-header !mb-0 !pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">Revenue Ledger</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {filteredRecords.length} of {records.length} Entries
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized audit log of brand partnerships, ad payouts, and recurring receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Filtered Total:{' '}
              <strong className="text-slate-900 font-extrabold">
                {currencySymbol}
                {filteredRecords.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Toolbar: Search input, Stream filter, Sort dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, stream, or deal title..."
              className="ciq-input !mt-0 pl-9 text-xs py-2"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Stream Filter */}
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="ciq-select !mt-0 text-xs py-2 w-auto"
            >
              <option value="All">All Streams ({records.length})</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="ciq-select !mt-0 text-xs py-2 w-auto"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Payout</option>
              <option value="amount_asc">Lowest Payout</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage={
            searchQuery || selectedSourceFilter !== 'All'
              ? 'No transactions match your search criteria.'
              : 'No revenue transactions logged yet.'
          }
          emptyAction={
            <button type="button" onClick={openCreate} className="ciq-btn-primary">
              <Plus className="h-3.5 w-3.5" />
              <span>Record First Transaction</span>
            </button>
          }
        />
      </div>

      {/* Add / Edit Revenue Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Revenue Record' : 'Record New Revenue'}
        subtitle="Log confirmed payouts and stream receipts"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="ciq-label">Income Source *</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="ciq-select text-xs"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="50000"
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="ciq-select text-xs"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ciq-label">Payout Date *</label>
            <input
              type="date"
              required
              value={form.revenue_date}
              onChange={(e) => setForm({ ...form, revenue_date: e.target.value })}
              className="ciq-input text-xs"
            />
          </div>

          <div>
            <label className="ciq-label">Campaign / Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Brand Sponsorship - 60s Integration"
              className="ciq-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="ciq-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="ciq-btn-primary text-xs">
              {saving ? 'Saving...' : editing ? 'Update Record' : 'Record Payout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Revenue Record"
        message="Are you sure you want to delete this revenue entry? This will update your total earnings and monthly metrics."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isDanger
      />
    </div>
  )
}
