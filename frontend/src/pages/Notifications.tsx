import { useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../services/api'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Zap,
  TrendingUp,
  DollarSign,
  Info,
  Sparkles,
} from 'lucide-react'
import { StatusBadge, EmptyState, ErrorState } from '../components/ui'

interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
}

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  performance: { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  engagement: { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  revenue: { icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  general: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
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
    setTimeout(() => setToast(''), 3500)
  }

  const loadData = useCallback(async () => {
    try {
      const params = filter === 'unread' ? { unread_only: true, limit: 100 } : { limit: 100 }
      const res = await notificationApi.list(params)
      setNotifications(res.data || [])
    } catch {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id)
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const handleMarkAll = async () => {
    await notificationApi.markAllRead()
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })))
    showToast('All notifications marked as read.')
  }

  const handleDelete = async (id: number) => {
    await notificationApi.delete(id)
    setNotifications((ns) => ns.filter((n) => n.id !== id))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await notificationApi.generateAlerts()
      const { total_generated } = res.data || {}
      showToast(total_generated > 0 ? `${total_generated} new alerts generated!` : 'System up-to-date. No new alerts.')
      await loadData()
    } catch {
      showToast('Alert analysis failed.')
    } finally {
      setGenerating(false)
    }
  }

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.notification_type !== typeFilter) return false
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-fade-in border border-slate-700">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Automated performance anomaly triggers, contract reminders, and milestone alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="ciq-btn-secondary"
          >
            <Sparkles className={`h-3.5 w-3.5 text-indigo-600 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Analyzing...' : 'Generate Alerts'}</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="ciq-btn-secondary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadData}
            title="Refresh inbox"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* Filters Toolbar */}
      <div className="ciq-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* All vs Unread toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Activity ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold text-slate-600">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Category:</span>
          {['all', 'performance', 'engagement', 'revenue', 'general'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors capitalize ${
                typeFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="ciq-card p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading notification feed...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'Notification inbox is clean'}
            description="You're all caught up! New alerts and milestones will appear here as they occur."
            action={
              <button type="button" onClick={handleGenerate} className="ciq-btn-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Alert Scan</span>
              </button>
            }
          />
        ) : (
          filtered.map((item) => {
            const typeConfig = TYPE_ICONS[item.notification_type] || TYPE_ICONS.general
            const Icon = typeConfig.icon

            return (
              <div
                key={item.id}
                className={`ciq-card p-4 sm:p-5 transition-all flex items-start gap-3.5 sm:gap-4 ${
                  item.is_read
                    ? 'bg-white/80 border-slate-200/60 opacity-80'
                    : 'bg-white border-indigo-200/90 shadow-2xs'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${typeConfig.bg} ${typeConfig.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                      )}
                      <h4
                        className={`text-xs sm:text-sm font-extrabold truncate ${
                          item.is_read ? 'text-slate-700' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <StatusBadge status={item.notification_type || 'general'} />

                    <div className="flex items-center gap-1">
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(item.id)}
                          className="ciq-btn-ghost text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark as Read</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="ciq-btn-ghost text-xs text-slate-400 hover:text-rose-600"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
