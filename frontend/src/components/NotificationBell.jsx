import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, RefreshCw, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { api } from '../api';

export default function NotificationBell({ onOpenFullNotifications }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadAndList = async () => {
    try {
      const [cntRes, notifList] = await Promise.all([
        api.getUnreadNotificationCount().catch(() => ({ unread_count: 0 })),
        api.getNotifications(false, null).catch(() => [])
      ]);
      setUnreadCount(cntRes.unread_count || 0);
      setNotifications(Array.isArray(notifList) ? notifList : []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    fetchUnreadAndList();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadAndList, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      await fetchUnreadAndList();
    } catch (e) {
      alert(`Error marking all as read: ${e.message}`);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      await fetchUnreadAndList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckAlerts = async () => {
    setLoading(true);
    try {
      await api.triggerAlertCheck();
      await fetchUnreadAndList();
    } catch (err) {
      alert(`Error checking alerts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'success':
        return <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}><CheckCircle size={14} /> Milestone</span>;
      case 'warning':
        return <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}><AlertTriangle size={14} /> Warning</span>;
      case 'alert':
        return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}><Zap size={14} /> Urgent</span>;
      default:
        return <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '2px' }}><Info size={14} /> Notice</span>;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          backgroundColor: isOpen ? '#eff6ff' : '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          color: '#1e293b',
          transition: 'all 0.2s ease'
        }}
        title="Notifications & Alerts Hub"
      >
        <Bell size={18} color={unreadCount > 0 ? '#ef4444' : '#64748b'} />
        <span style={{ fontSize: '13px' }}>Alerts</span>

        {unreadCount > 0 && (
          <span style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '2px 7px',
            fontSize: '11px',
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '46px',
          right: 0,
          width: '360px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="#3b82f6" /> Notifications ({unreadCount} Unread)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCheckAlerts}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Scan database and generate new alerts"
              >
                <RefreshCw size={12} className={loading ? 'spin' : ''} /> {loading ? 'Checking...' : 'Check Alerts'}
              </button>
            </div>
          </div>

          {/* Quick List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.action_url) {
                      window.location.hash = notif.action_url;
                    }
                    if (!notif.is_read) {
                      api.markNotificationAsRead(notif.id).then(fetchUnreadAndList);
                    }
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: notif.is_read ? '#ffffff' : '#f0f9ff',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{notif.title}</div>
                    <div style={{ fontSize: '10px' }}>{getSeverityBadge(notif.severity)}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, marginBottom: '6px' }}>
                    {notif.message}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkRead(notif.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No notifications found. Click "Check Alerts" to scan metrics.
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div style={{
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCheck size={14} /> Mark All Read
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenFullNotifications) onOpenFullNotifications();
              }}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Notification Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
