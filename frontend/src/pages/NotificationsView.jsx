import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, CheckCheck, Trash2, AlertTriangle, CheckCircle, Info, Zap, Filter } from 'lucide-react';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import { useSortableData, SortHeader } from '../utils/useSortableData';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(unreadOnly, filterType);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType, unreadOnly]);

  const { items: sortedNotifications, requestSort, sortConfig } = useSortableData(notifications, { key: 'created_at', direction: 'desc' });

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      const alerts = await api.triggerAlertCheck();
      await fetchNotifications();
      alert(`Alert scan complete! Generated ${alerts.length} contextual alerts.`);
    } catch (err) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      await fetchNotifications();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.deleteNotification(id);
      await fetchNotifications();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const performanceCount = notifications.filter(n => n.type === 'performance').length;
  const revenueCount = notifications.filter(n => n.type === 'revenue').length;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'success':
        return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckCircle size={12} /> Milestone</span>;
      case 'warning':
        return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><AlertTriangle size={12} /> Warning</span>;
      case 'alert':
        return <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Zap size={12} /> Urgent</span>;
      default:
        return <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Info size={12} /> Info</span>;
    }
  };

  return (
    <div className="section-card">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={22} color="#2563eb" />
            <span>Notification & Alert Center</span>
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Contextual performance alerts, engagement spikes, revenue goals, and payment notifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleTriggerScan}
            disabled={scanning}
            className="btn-add"
            style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={scanning ? 'spin' : ''} />
            {scanning ? 'Scanning Metrics...' : 'Trigger Alert Scan'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="nav-btn"
            style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 700 }}>Total Alerts Recorded</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 700 }}>Unread Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', marginTop: '4px' }}>{unreadCount}</div>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>Performance Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>{performanceCount}</div>
        </div>

        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 700 }}>Revenue & Payment Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#854d0e', marginTop: '4px' }}>{revenueCount}</div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Filter Category:</span>
          {['All', 'Performance', 'Engagement', 'Revenue', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              style={{
                backgroundColor: filterType === cat ? '#2563eb' : '#ffffff',
                color: filterType === cat ? '#ffffff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Show Unread Only
        </label>
      </div>

      {/* Notifications List Table with Interactive Up/Down Arrow Column Sorting */}
      <div className="table-responsive">
        <table className="simple-table">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <SortHeader label="Status" columnKey="is_read" sortConfig={sortConfig} onSort={requestSort} />
              <SortHeader label="Category" columnKey="type" sortConfig={sortConfig} onSort={requestSort} />
              <SortHeader label="Alert Title" columnKey="title" sortConfig={sortConfig} onSort={requestSort} />
              <SortHeader label="Message Details" columnKey="message" sortConfig={sortConfig} onSort={requestSort} />
              <SortHeader label="Severity" columnKey="severity" sortConfig={sortConfig} onSort={requestSort} />
              <SortHeader label="Created Date" columnKey="created_at" sortConfig={sortConfig} onSort={requestSort} />
              <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Loading notifications...
                </td>
              </tr>
            ) : sortedNotifications.length > 0 ? (
              sortedNotifications.map((notif) => (
                <tr key={notif.id} style={{ backgroundColor: notif.is_read ? '#ffffff' : '#f0f9ff' }}>
                  <td>
                    {notif.is_read ? (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Read</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 800 }}>● Unread</span>
                    )}
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '12px', color: '#334155' }}>
                      {notif.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{notif.title}</td>
                  <td style={{ fontSize: '13px', color: '#334155', maxWidth: '360px' }}>{notif.message}</td>
                  <td>{getSeverityBadge(notif.severity)}</td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {!notif.is_read && (
                      <button
                        className="btn-small btn-edit"
                        onClick={() => handleMarkRead(notif.id)}
                        style={{ marginRight: '6px' }}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(notif.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  <EmptyState
                    icon={Bell}
                    title="No Alerts Found"
                    description="Click Trigger Alert Scan to analyze metrics and generate contextual alerts."
                    actionLabel="Trigger Alert Scan"
                    onAction={handleTriggerScan}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
