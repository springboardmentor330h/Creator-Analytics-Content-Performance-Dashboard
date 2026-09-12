import { useEffect, useState } from 'react'
import { listNotifications, generateAlerts, markNotificationRead } from '../services/reportService'

const TYPE_ICON = { performance: 'P', engagement: 'E', revenue: 'R' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const data = await listNotifications()
      setNotifications(data.items)
      setUnreadCount(data.unread_count)
    } catch (err) {
      // silent -- notifications are non-critical to the rest of the dashboard
    }
  }

  useEffect(() => { load() }, [])

  async function handleGenerate() {
    setLoading(true)
    try {
      await generateAlerts()
      await load()
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    await markNotificationRead(id, true)
    load()
  }

  return (
    <div className="notif-wrapper">
      <button className="notif-bell" onClick={() => setOpen(!open)}>
        Notifications
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            <button className="btn-small" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Checking...' : 'Check for alerts'}
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-muted notif-empty">No notifications yet.</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className={n.is_read ? 'notif-item read' : 'notif-item'}>
                  <span className="notif-type-tag">{TYPE_ICON[n.notification_type] || '?'}</span>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                  </div>
                  {!n.is_read && (
                    <button className="notif-mark-read" onClick={() => handleMarkRead(n.id)}>
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
