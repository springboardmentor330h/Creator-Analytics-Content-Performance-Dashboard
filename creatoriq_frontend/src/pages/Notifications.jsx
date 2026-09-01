import { useEffect, useState } from 'react'
import { notificationAPI } from '../services/api'
import Loading from '../components/ui/Loading'
import ErrorBox from '../components/ui/ErrorBox'

export default function Notifications() {
  const [data, setData] = useState({ items: [], unread_count: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    notificationAPI.list()
      .then((res) => setData(res.data || { items: [], unread_count: 0, total: 0 }))
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const runAlerts = async () => {
    setBusy(true)
    try {
      await notificationAPI.runAlerts()
      load()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setBusy(false)
    }
  }

  const markRead = async (id) => {
    await notificationAPI.markRead(id)
    load()
  }

  if (loading) return <Loading />
  const items = data.items || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500">{data.unread_count || 0} unread</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runAlerts} disabled={busy} className="px-3 py-2 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50">
            {busy ? 'Running...' : 'Run alerts'}
          </button>
          <button onClick={() => notificationAPI.markAllRead().then(load)} className="px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200">
            Mark all read
          </button>
        </div>
      </div>
      {error && <ErrorBox message={String(error)} />}
      <div className="space-y-2">
        {items.map((n) => (
          <div key={n.id} className={`border rounded-xl p-4 ${n.is_read ? 'border-slate-200 bg-slate-50' : 'border-sky-500/30 bg-white'}`}>
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-slate-500 mb-1">{n.type}</p>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-slate-500 mt-1">{n.message}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="text-xs text-sky-600 shrink-0">Mark read</button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-500 text-sm">No notifications. Click “Run alerts” after you have content/revenue data.</p>}
      </div>
    </div>
  )
}
