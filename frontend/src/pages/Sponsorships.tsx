import { useState, useEffect } from 'react'
import { analyticsApi, sponsorshipApi } from '../services/api'
import { Zap, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const STATUSES = ['Draft', 'Active', 'Completed', 'Cancelled']
const PAY_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue']

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  Completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Cancelled: 'bg-red-100 text-red-600 border-red-200',
}
const PAY_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Overdue: 'bg-red-100 text-red-600',
  'Partially Paid': 'bg-blue-100 text-blue-700',
}

interface Sponsorship {
  id: number; brand_name: string; campaign_name: string; contract_value: number
  currency: string; start_date: string; end_date: string; status: string
  payment_status: string; description?: string
}

interface Summary { total_sponsorships: number; total_contract_value: number; active_sponsorships: number; completed_sponsorships: number; pending_payments: number }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const emptyForm = { brand_name: '', campaign_name: '', contract_value: '', currency: 'INR', start_date: '', end_date: '', status: 'Draft', payment_status: 'Pending', description: '' }

export default function Sponsorships() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [records, setRecords] = useState<Sponsorship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sponsorship | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([analyticsApi.sponsorshipsSummary(), sponsorshipApi.list()])
      .then(([s, r]) => { setSummary(s.data); setRecords(r.data) })
      .catch(() => setError('Failed to load sponsorships'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true) }
  const openEdit = (s: Sponsorship) => {
    setEditing(s)
    setForm({ brand_name: s.brand_name, campaign_name: s.campaign_name, contract_value: String(s.contract_value), currency: s.currency, start_date: s.start_date, end_date: s.end_date, status: s.status, payment_status: s.payment_status, description: s.description || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.brand_name || !form.campaign_name || !form.contract_value || !form.start_date || !form.end_date) return
    setSaving(true)
    try {
      const payload = { ...form, contract_value: parseFloat(form.contract_value) }
      if (editing) await sponsorshipApi.update(editing.id, payload)
      else await sponsorshipApi.create(payload)
      setShowModal(false); load()
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sponsorship?')) return
    await sponsorshipApi.delete(id); load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
  if (error) return <div className="bg-red-50 text-red-600 rounded-xl p-4 border border-red-200">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sponsorships</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your brand deals and campaign pipeline</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm">
          <Plus className="h-4 w-4" /> Add Sponsorship
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: summary.total_sponsorships, color: 'bg-slate-900' },
            { label: 'Active', value: summary.active_sponsorships, color: 'bg-emerald-600' },
            { label: 'Completed', value: summary.completed_sponsorships, color: 'bg-indigo-600' },
            { label: 'Pending Pay', value: summary.pending_payments, color: 'bg-amber-500' },
            { label: 'Total Value', value: `${records[0]?.currency || 'INR'} ${summary.total_contract_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'bg-violet-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-lg font-extrabold mt-1 ${c.label === 'Total Value' ? 'text-violet-600 text-base' : 'text-slate-900'}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">Campaigns ({records.length})</h3>
        </div>
        {records.length === 0 ? (
          <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-2">
            <Zap className="h-8 w-8 text-slate-200" />
            <p>No sponsorships yet. Add your first campaign.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <tr>
                  {['Brand','Campaign','Value','Dates','Status','Payment','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{r.brand_name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.campaign_name}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{r.currency} {r.contract_value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.start_date} → {r.end_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PAY_COLORS[r.payment_status] || 'bg-slate-100 text-slate-600'}`}>{r.payment_status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Sponsorship' : 'Add Sponsorship'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[
              { label: 'Brand Name', key: 'brand_name', type: 'text' },
              { label: 'Campaign Name', key: 'campaign_name', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contract Value</label>
                <input type="number" min="0" step="0.01" value={form.contract_value} onChange={e => setForm(p => ({ ...p, contract_value: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                <input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                <select value={form.payment_status} onChange={e => setForm(p => ({ ...p, payment_status: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {PAY_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
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
