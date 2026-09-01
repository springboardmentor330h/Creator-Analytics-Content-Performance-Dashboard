import { useState } from 'react'
import { reportsAPI, downloadBlob } from '../services/api'
import ErrorBox from '../components/ui/ErrorBox'

const TYPES = [
  { value: 'full', label: 'Full report' },
  { value: 'content', label: 'Content' },
  { value: 'audience', label: 'Audience' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'growth', label: 'Growth' },
  { value: 'platform', label: 'Platform' },
]

export default function Reports() {
  const [type, setType] = useState('full')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await reportsAPI.generate(type)
      setReport(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not generate report')
    } finally {
      setLoading(false)
    }
  }

  const download = async (kind) => {
    setError('')
    try {
      const blob = kind === 'excel'
        ? await reportsAPI.downloadExcel(type)
        : await reportsAPI.downloadPdf(type)
      downloadBlob(blob, `creatoriq_${type}.${kind === 'excel' ? 'xlsx' : 'pdf'}`)
    } catch (e) {
      setError(e.response?.data?.detail || 'Download failed')
    }
  }

  const summary = report?.summary || {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-slate-500">Generate summaries and download PDF or Excel</p>
      </div>
      {error && <ErrorBox message={String(error)} />}

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500">Report type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="block mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 text-sm disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button onClick={() => download('excel')} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm">
          Download Excel
        </button>
        <button onClick={() => download('pdf')} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">
          Download PDF
        </button>
      </div>

      {report && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {Object.entries(summary)
              .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
              .map(([k, v]) => (
                <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500 capitalize">{k.replaceAll('_', ' ')}</p>
                  <p className="font-medium mt-0.5">{String(v)}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
