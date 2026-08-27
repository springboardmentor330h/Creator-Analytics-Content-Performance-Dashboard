import { useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../services/api'
import { Bell, BellOff, Check, CheckCheck, Trash2, RefreshCw, Zap } from 'lucide-react'

interface Notification {
  id: number; title: string; message: string
  notification_type: string; is_read: boolean; created_at: string
}

const TYPE_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  performance: { label: 'Performance', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  engagement:  { label: 'Engagement',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  revenue:     { label: 'Revenue',     color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  general:     { label: 'General',     color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = useCallback(async () => {
    try {
      const params = filter === 'unread' ? { unread_only: true, limit: 100 } : { limit: 100 }
      const res = await notificationApi.list(params)
      setNotifications(res.data)
    } catch { setError('Failed to load notifications') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { setLoading(true); load() }, [load])

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id)
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleMarkAll = async () => {
    await notificationApi.markAllRead()
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
    showToast('All notifications marked as read')
  }

  const handleDelete = async (id: number) => {
    await notificationApi.delete(id)
    setNotifications(ns => ns.filter(n => n.id !== id))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await notificationApi.generateAlerts()
      const { total_generated } = res.data
      showToast(total_generated > 0 ? `${total_generated} new alert(s) generated!` : 'No new alerts at this time')
      await load()
    } catch { showToast('Alert generation failed') }
    finally { setGenerating(false) }
  }

  const filtered = notifications.filter(n => {
    if (typeFilter !== 'all' && n.notification_type !== typeFilter) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? (
              <span className="text-indigo-600 font-bold">{unreadCount} unread</span>
            ) : 'All caught up!'} — {notifications.length} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors">
            {generating ? <div className="h-3.5 w-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            Generate Alerts
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
            </button>
          )}
          <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f === 'all' ? 'All' : 'Unread Only'}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-200" />
        {['all', 'performance', 'engagement', 'revenue', 'general'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-colors ${typeFilter === t ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 border border-red-200">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16 flex flex-col items-center gap-3">
          <Bell className="h-10 w-10 text-slate-200" />
          <p className="text-slate-500 font-medium">No notifications found</p>
          <p className="text-xs text-slate-400">Click "Generate Alerts" to create real analytics-based notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const ts = TYPE_STYLES[n.notification_type] || TYPE_STYLES.general
            return (
              <div key={n.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${n.is_read ? 'border-slate-200 opacity-80' : 'border-indigo-200 shadow-indigo-50'}`}>
                <div className="flex items-start gap-4 p-5">
                  <div className={`mt-1 flex-shrink-0 h-2.5 w-2.5 rounded-full ${n.is_read ? 'bg-slate-200' : ts.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ts.color}`}>{ts.label}</span>
                      {!n.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">NEW</span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-auto">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
                    </div>
                    <p className={`text-sm font-bold ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Mark as read">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
