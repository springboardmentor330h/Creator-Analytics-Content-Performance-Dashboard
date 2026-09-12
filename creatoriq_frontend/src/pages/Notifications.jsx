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
    notificationAPI
      .list()
      .then((res) => {
        const payload = res.data || {}
        const items = payload.items || payload.notifications || (Array.isArray(payload) ? payload : [])
        setData({
          items: Array.isArray(items) ? items : [],
          unread_count: payload.unread_count ?? 0,
          total: payload.total ?? (Array.isArray(items) ? items.length : 0),
        })
      })
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const runAlerts = async () => {
    setBusy(true)
    setError('')
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
    try {
      await notificationAPI.markRead(id)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    }
  }

  const markAll = async () => {
    try {
      await notificationAPI.markAllRead()
      load()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    }
  }

  if (loading) return <Loading label="Loading notifications…" />
  const items = data.items || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {data.unread_count || 0} unread
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runAlerts}
            disabled={busy}
            className="px-3 py-2 text-sm rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {busy ? 'Running…' : 'Run alerts'}
          </button>
          <button
            type="button"
            onClick={markAll}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Mark all read
          </button>
        </div>
      </div>

      {error && <ErrorBox message={String(error)} />}

      <div className="space-y-2">
        {items.map((n) => {
          const unread = !n.is_read
          return (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition ${
                unread
                  ? 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-slate-900'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1">
                    {n.type || 'alert'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {n.title || 'Notification'}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 break-words leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {unread && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-600 shrink-0 self-start dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {items.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400 py-8 text-center">
            No notifications. Click “Run alerts” after you have content/revenue data.
          </p>
        )}
      </div>
    </div>
  )
}