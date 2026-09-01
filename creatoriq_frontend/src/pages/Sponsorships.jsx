import { useEffect, useState } from 'react'
import { sponsorshipAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'

export default function Sponsorships() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    sponsorshipAPI.list()
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load sponsorships'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sponsorships</h1>
      {error && <ErrorBox message={String(error)} />}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-500 border-b border-slate-200">
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
              <tr key={s.id} className="border-b border-slate-200/50">
                <td className="px-4 py-2">{s.brand_name}</td>
                <td className="px-4 py-2">{s.campaign_name}</td>
                <td className="px-4 py-2 text-right">${Number(s.contract_value || 0).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{s.status}</td>
                <td className="px-4 py-2 capitalize">{s.payment_status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No sponsorships</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
