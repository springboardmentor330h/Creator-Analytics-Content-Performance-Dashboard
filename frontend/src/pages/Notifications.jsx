import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { LoadingState, EmptyState, ErrorState } from '../components/StateBlocks'
import {
  listNotifications, generateAlerts, markNotificationRead, deleteNotification,
} from '../services/reportService'

const TYPE_LABEL = { performance: 'Performance', engagement: 'Engagement', revenue: 'Revenue' }

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all') // all | unread
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listNotifications(filter === 'unread')
      setNotifications(data.items)
      setUnreadCount(data.unread_count)
    } catch (err) {
      setError('Could not load notifications. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await generateAlerts()
      await load()
    } finally {
      setGenerating(false)
    }
  }

  async function handleMarkRead(id, isRead) {
    await markNotificationRead(id, isRead)
    load()
  }

  async function handleDelete(id) {
    await deleteNotification(id)
    load()
  }

  return (
    <AppLayout>
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          actions={
            <button className="btn-small" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Checking...' : 'Check for alerts'}
            </button>
          }
        />

        <div className="notif-filter-tabs">
          <button
            className={filter === 'all' ? 'tab active' : 'tab'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'unread' ? 'tab active' : 'tab'}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>

        {error && <ErrorState message={error} />}
        {loading && <LoadingState label="Loading notifications..." />}

        {!loading && !error && notifications.length === 0 && (
          <EmptyState
            title="No notifications"
            description="Click 'Check for alerts' to scan your current analytics for performance, engagement, and revenue alerts."
          />
        )}

        {!loading && notifications.length > 0 && (
          <div className="notif-page-list">
            {notifications.map((n) => (
              <div key={n.id} className={n.is_read ? 'notif-page-item read' : 'notif-page-item'}>
                <div className="notif-page-item-main">
                  <div className="notif-page-item-header">
                    <StatusBadge label={TYPE_LABEL[n.notification_type]} variant={n.is_read ? 'read' : 'unread'} />
                    <span className="notif-page-title">{n.title}</span>
                  </div>
                  <p className="text-muted">{n.message}</p>
                </div>
                <div className="notif-page-item-actions">
                  {!n.is_read ? (
                    <button className="btn-link-delete" style={{ color: '#4ecdc4' }} onClick={() => handleMarkRead(n.id, true)}>
                      Mark read
                    </button>
                  ) : (
                    <button className="btn-link-delete" style={{ color: '#9aa0a6' }} onClick={() => handleMarkRead(n.id, false)}>
                      Mark unread
                    </button>
                  )}
                  <button className="btn-link-delete" onClick={() => handleDelete(n.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppLayout>
  )
}
