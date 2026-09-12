import { useCallback, useEffect, useState } from 'react'
import { sponsorshipAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'

function extractError(err) {
  if (!err) return 'Failed to load sponsorships'
  if (!err.response) {
    return 'Cannot reach the API. Is the backend running on port 8000?'
  }
  const status = err.response.status
  const detail = err.response.data?.detail
  if (status === 401) return 'Unauthorized — please sign in again.'
  if (status === 403) {
    return typeof detail === 'string'
      ? detail
      : 'Access denied for your role.'
  }
  if (status === 404) return 'Sponsorships endpoint not found (check backend routes).'
  if (status === 500) return typeof detail === 'string' ? detail : 'Server error while loading sponsorships.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail)
  return `Failed to load sponsorships (HTTP ${status})`
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.sponsorships)) return payload.sponsorships
  if (Array.isArray(payload.results)) return payload.results
  return []
}

const emptyForm = {
  brand_name: '',
  campaign_name: '',
  contract_value: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  status: 'pending',
  payment_status: 'unpaid',
}

export default function Sponsorships() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formMsg, setFormMsg] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    sponsorshipAPI
      .list()
      .then((res) => {
        setRows(normalizeList(res.data))
      })
      .catch((e) => {
        setRows([])
        setError(extractError(e))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (e) => {
    e.preventDefault()
    setFormMsg('')
    setFormError('')
    const brand = form.brand_name.trim()
    const campaign = form.campaign_name.trim()
    const value = Number(form.contract_value)
    if (brand.length < 2 || campaign.length < 2) {
      setFormError('Brand and campaign must be at least 2 characters.')
      return
    }
    if (!Number.isFinite(value) || value < 0) {
      setFormError('Contract value must be a non-negative number.')
      return
    }
    if (!form.start_date) {
      setFormError('Start date is required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        brand_name: brand,
        campaign_name: campaign,
        contract_value: value,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: form.status,
        payment_status: form.payment_status,
      }
      await sponsorshipAPI.create(payload)
      setFormMsg('Sponsorship created successfully.')
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading label="Loading sponsorships…" />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sponsorships</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Brand deals and payment status</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="ciq-btn-ghost text-sm">
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="ciq-btn-primary text-sm"
          >
            {showForm ? 'Close form' : 'Add sponsorship'}
          </button>
        </div>
      </div>

      {error && (
        <div className="space-y-2">
          <ErrorBox message={error} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: You must be signed in. Creators only see their own records. Use “Add sponsorship”
            if the list is empty.
          </p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={onCreate}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm dark:bg-slate-900 dark:border-slate-800"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">New sponsorship</h2>
          {formMsg && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900">
              {formMsg}
            </div>
          )}
          {formError && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900">
              {formError}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Brand name</label>
              <input
                className="ciq-input mt-1"
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Campaign</label>
              <input
                className="ciq-input mt-1"
                value={form.campaign_name}
                onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Contract value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="ciq-input mt-1"
                value={form.contract_value}
                onChange={(e) => setForm({ ...form, contract_value: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start date</label>
              <input
                type="date"
                className="ciq-input mt-1"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End date (optional)</label>
              <input
                type="date"
                className="ciq-input mt-1"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
              <select
                className="ciq-input mt-1"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Payment</label>
              <select
                className="ciq-input mt-1"
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              >
                <option value="unpaid">unpaid</option>
                <option value="partial">partial</option>
                <option value="paid">paid</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create sponsorship'}
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto dark:bg-slate-900 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="text-left px-4 py-3">Brand</th>
              <th className="text-left px-4 py-3">Campaign</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-slate-200/50 dark:border-slate-800/50">
                <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{s.brand_name}</td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{s.campaign_name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-900 dark:text-slate-100">
                  ${Number(s.contract_value || 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 capitalize text-slate-700 dark:text-slate-300">{s.status}</td>
                <td className="px-4 py-2 capitalize text-slate-700 dark:text-slate-300">{s.payment_status}</td>
              </tr>
            ))}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No sponsorships yet. Click “Add sponsorship” to create one.
                </td>
              </tr>
            )}
            {rows.length === 0 && error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Could not load data. Fix the error above, then Refresh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
