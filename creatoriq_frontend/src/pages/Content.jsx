import { useEffect, useMemo, useState } from 'react'
import { contentAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'
import PlatformSelect from '../components/ui/PlatformSelect'

export default function Content() {
  const [rows, setRows] = useState([])
  const [platform, setPlatform] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    contentAPI.list()
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [])

  const platforms = useMemo(
    () => Array.from(new Set(rows.map((r) => r.platform).filter(Boolean))).sort(),
    [rows]
  )

  const filtered = platform === 'All' ? rows : rows.filter((r) => r.platform === platform)

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Content Analytics</h1>
        <PlatformSelect platforms={platforms} value={platform} onChange={setPlatform} />
      </div>
      {error && <ErrorBox message={String(error)} />}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-800">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Platform</th>
              <th className="text-right px-4 py-3">Views</th>
              <th className="text-right px-4 py-3">Likes</th>
              <th className="text-right px-4 py-3">Comments</th>
              <th className="text-right px-4 py-3">Reach</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-800/50">
                <td className="px-4 py-3 max-w-xs truncate">{c.content_title}</td>
                <td className="px-4 py-3 capitalize">{c.platform}</td>
                <td className="px-4 py-3 text-right">{(c.views || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{(c.likes || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{(c.comments || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{(c.reach || 0).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {rows.length === 0 ? 'No content in database yet' : `No ${platform} content yet`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
