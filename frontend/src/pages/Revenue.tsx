import { useState, useEffect } from 'react'
import { analyticsApi, revenueApi } from '../services/api'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import PieChartCard from '../components/PieChartCard'
import { DollarSign, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6']
const SOURCES = ['Sponsorship','Ad Revenue','Affiliate Marketing','Brand Collaboration','Subscription Revenue']

interface Revenue { id: number; source: string; amount: number; currency: string; description?: string; revenue_date: string }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Revenue() {
  const [total, setTotal] = useState<{ total_revenue: number; currency: string } | null>(null)
  const [bySource, setBySource] = useState<Record<string, number>>({})
  const [monthly, setMonthly] = useState<{ month: string; revenue: number }[]>([])
  const [records, setRecords] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Revenue | null>(null)
  const [form, setForm] = useState({ source: SOURCES[0], amount: '', currency: 'INR', description: '', revenue_date: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      analyticsApi.revenueSummary(),
      analyticsApi.revenueBySource(),
      analyticsApi.revenueMonthly(),
      revenueApi.list(),
    ]).then(([s, bs, m, r]) => {
      setTotal(s.data); setBySource(bs.data); setMonthly(m.data); setRecords(r.data)
    }).catch(() => setError('Failed to load revenue data'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ source: SOURCES[0], amount: '', currency: 'INR', description: '', revenue_date: '' }); setShowModal(true) }
  const openEdit = (r: Revenue) => { setEditing(r); setForm({ source: r.source, amount: String(r.amount), currency: r.currency, description: r.description || '', revenue_date: r.revenue_date }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.amount || !form.revenue_date) return
    setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editing) await revenueApi.update(editing.id, payload)
      else await revenueApi.create(payload)
      setShowModal(false); load()
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this revenue record?')) return
    await revenueApi.delete(id); load()
  }

  // Short display labels for pie chart to prevent overflow; fullName is used in tooltip
  const SHORT_NAMES: Record<string, string> = {
    'Sponsorship': 'Sponsorship',
    'Ad Revenue': 'Ad Revenue',
    'Affiliate Marketing': 'Affiliate',
    'Brand Collaboration': 'Brand Collab',
    'Subscription Revenue': 'Subscription',
  }

  const sourceChartData = Object.entries(bySource).map(([name, value]) => ({
    name: SHORT_NAMES[name] || name,
    fullName: name,
    value,
  }))
  const currency = total?.currency || 'INR'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
  if (error) return <div className="bg-red-50 text-red-600 rounded-xl p-4 border border-red-200">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Revenue</h2>
          <p className="text-sm text-slate-500 mt-1">Track and manage your creator revenue streams</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Revenue
        </button>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Revenue</p>
        <p className="text-4xl font-extrabold mt-1">{currency} {(total?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-xs opacity-70 mt-2">Across all revenue sources and time periods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source Pie */}
        {sourceChartData.some(d => d.value > 0) && (
          <PieChartCard
            title="Revenue by Source"
            data={sourceChartData}
            colors={COLORS}
            tooltipFormatter={(v, fullName) => `${fullName}: ${currency} ${v.toLocaleString()}`}
          />
        )}

        {/* Monthly Revenue Chart */}
        {monthly.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Revenue by Source Bars */}
      {sourceChartData.some(d => d.value > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Revenue Source Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceChartData} margin={{ top: 4, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: number, _name: string, props: any) => [`${currency} ${v.toLocaleString()}`, props.payload.fullName || props.payload.name]}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">Revenue Records ({records.length})</h3>
        </div>
        {records.length === 0 ? (
          <div className="text-center text-slate-400 py-12">No revenue records yet. Add your first entry.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <tr>
                  {['Source','Amount','Date','Description','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.source}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{r.currency} {r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-slate-600">{r.revenue_date}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{r.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Revenue' : 'Add Revenue'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                <input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input type="date" value={form.revenue_date} onChange={e => setForm(f => ({ ...f, revenue_date: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-1">
                {saving ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
