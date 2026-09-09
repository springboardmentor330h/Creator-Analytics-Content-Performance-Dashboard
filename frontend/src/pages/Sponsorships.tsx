import { useState, useEffect } from 'react'
import { analyticsApi, sponsorshipApi } from '../services/api'
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  KPICard,
  DataTable,
  StatusBadge,
  KPISkeleton,
  TableSkeleton,
  EmptyState,
  ErrorState,
  Modal,
  ConfirmDialog,
} from '../components/ui'
import { formatNumber } from '../utils/format'

const STATUSES = ['Draft', 'Active', 'Completed', 'Cancelled']
const PAY_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue']

interface Sponsorship {
  id: number
  brand_name: string
  campaign_name: string
  contract_value: number
  currency: string
  start_date: string
  end_date: string
  status: string
  payment_status: string
  description?: string
}

interface Summary {
  total_sponsorships: number
  total_contract_value: number
  active_sponsorships: number
  completed_sponsorships: number
  pending_payments: number
}

const emptyForm = {
  brand_name: '',
  campaign_name: '',
  contract_value: '',
  currency: 'INR',
  start_date: '',
  end_date: '',
  status: 'Draft',
  payment_status: 'Pending',
  description: '',
}

export default function Sponsorships() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [records, setRecords] = useState<Sponsorship[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sponsorship | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([analyticsApi.sponsorshipsSummary(), sponsorshipApi.list()])
      .then(([s, r]) => {
        setSummary(s.data)
        setRecords(r.data || [])
      })
      .catch(() => setError('Failed to load sponsorships pipeline.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (s: Sponsorship) => {
    setEditing(s)
    setForm({
      brand_name: s.brand_name,
      campaign_name: s.campaign_name,
      contract_value: String(s.contract_value),
      currency: s.currency,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      payment_status: s.payment_status,
      description: s.description || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand_name || !form.campaign_name || !form.contract_value || !form.start_date || !form.end_date) return
    setSaving(true)
    try {
      const payload = { ...form, contract_value: parseFloat(form.contract_value) }
      if (editing) await sponsorshipApi.update(editing.id, payload)
      else await sponsorshipApi.create(payload)
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
      await sponsorshipApi.delete(deleteTargetId)
      setDeleteTargetId(null)
      loadData()
    } catch {
      /* ignore */
    } finally {
      setDeleting(false)
    }
  }

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    if (paymentFilter !== 'All' && r.payment_status.toLowerCase() !== paymentFilter.toLowerCase()) return false
    if (search) {
      const q = search.toLowerCase()
      const matchBrand = r.brand_name.toLowerCase().includes(q)
      const matchCampaign = r.campaign_name.toLowerCase().includes(q)
      if (!matchBrand && !matchCampaign) return false
    }
    return true
  })

  const columns = [
    {
      header: 'Brand & Campaign',
      accessor: (item: Sponsorship) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-extrabold text-xs">
            {item.brand_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-slate-900 block truncate">{item.brand_name}</span>
            <span className="text-[11px] text-slate-500 block truncate">{item.campaign_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contract Value',
      accessor: (item: Sponsorship) => (
        <span className="font-extrabold text-slate-900">
          {item.currency === 'INR' ? '₹' : '$'}
          {item.contract_value.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Timeline',
      accessor: (item: Sponsorship) => (
        <div className="text-[11px] text-slate-500 font-mono">
          <span>{item.start_date}</span>
          <span className="text-slate-300 mx-1">→</span>
          <span>{item.end_date}</span>
        </div>
      ),
    },
    {
      header: 'Campaign Status',
      accessor: (item: Sponsorship) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Payment Status',
      accessor: (item: Sponsorship) => <StatusBadge status={item.payment_status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: Sponsorship) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(item)}
            className="ciq-btn-ghost p-1.5 text-slate-500 hover:text-indigo-600"
            title="Edit deal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTargetId(item.id)}
            className="ciq-btn-ghost p-1.5 text-slate-400 hover:text-rose-600"
            title="Delete deal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sponsorships Pipeline
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Brand collaboration agreements, contract milestones, and payment disbursements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={openCreate} className="ciq-btn-primary">
            <Plus className="h-4 w-4" />
            <span>Add Sponsorship</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Deals"
              value={summary?.total_sponsorships ?? 0}
              icon={Briefcase}
              color="indigo"
              subtitle="recorded contracts"
            />
            <KPICard
              title="Pipeline Value"
              value={`₹${(summary?.total_contract_value ?? 0).toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
              change={15.2}
              changeLabel="portfolio size"
            />
            <KPICard
              title="Active Deals"
              value={summary?.active_sponsorships ?? 0}
              icon={Zap}
              color="blue"
              subtitle="in progress"
            />
            <KPICard
              title="Completed"
              value={summary?.completed_sponsorships ?? 0}
              icon={CheckCircle2}
              color="emerald"
              subtitle="fulfilled"
            />
            <KPICard
              title="Pending Invoices"
              value={summary?.pending_payments ?? 0}
              icon={Clock}
              color="amber"
              subtitle="awaiting settlement"
            />
          </>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="ciq-card p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search by brand or campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ciq-input mt-0 py-2 pl-9 pr-8 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-[11px] font-bold text-slate-500">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ciq-select mt-0 py-1.5 px-2.5 text-xs w-auto"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-[11px] font-bold text-slate-500">Payment:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="ciq-select mt-0 py-1.5 px-2.5 text-xs w-auto"
              >
                <option value="All">All Invoices</option>
                {PAY_STATUSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsorship Deals Table */}
      <div className="ciq-card">
        <div className="ciq-card-header">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Brand Partnerships Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredRecords.length} deals</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No sponsorships found matching your filter criteria."
          emptyAction={
            <button type="button" onClick={openCreate} className="ciq-btn-primary">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Sponsorship</span>
            </button>
          }
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Brand Deal' : 'New Sponsorship Agreement'}
        subtitle="Record campaign scope, deliverables, and financial compensation"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Brand Name *</label>
              <input
                type="text"
                required
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                placeholder="e.g. Nike, Notion, Apple"
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">Campaign Name *</label>
              <input
                type="text"
                required
                value={form.campaign_name}
                onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                placeholder="e.g. Q4 Flagship Launch Reel"
                className="ciq-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Contract Value *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.contract_value}
                onChange={(e) => setForm({ ...form, contract_value: e.target.value })}
                placeholder="150000"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Start Date *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="ciq-input text-xs"
              />
            </div>
            <div>
              <label className="ciq-label">End Date *</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="ciq-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ciq-label">Campaign Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="ciq-select text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ciq-label">Payment Status</label>
              <select
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                className="ciq-select text-xs"
              >
                {PAY_STATUSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="ciq-label">Deliverables / Scope Note</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. 1 dedicated YouTube video + 2 Instagram stories"
              className="ciq-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="ciq-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ciq-btn-primary"
            >
              {saving ? 'Saving...' : editing ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Sponsorship Deal"
        message="Are you sure you want to remove this sponsorship? Pipeline metrics will be updated immediately."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  )
}
