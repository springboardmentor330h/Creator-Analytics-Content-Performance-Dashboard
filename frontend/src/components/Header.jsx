import React from 'react';
import { Search, Link2, LogOut, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { YoutubeIcon } from './PlatformIcons';

export default function Header({
  title,
  subtitle,
  user,
  onLogout,
  onOpenYouTubeModal,
  onOpenSocialModal,
  onOpenNotificationsTab,
  onToggleMobileSidebar
}) {
  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Creator';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-only"
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} color="#0f172a" />
        </button>

        <div className="header-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>{title || 'CreatorIQ Dashboard'}</h1>
            <span className="live-badge">
              <span className="live-dot" /> LIVE REALTIME
            </span>
          </div>
          <p>{subtitle || 'Realtime Revenue & Analytics Management Platform'}</p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="search-bar">
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search content, revenue, analytics..." />
        </div>

        {/* Notification Bell Dropdown Widget */}
        <NotificationBell onOpenFullNotifications={onOpenNotificationsTab} />

        {/* Action Buttons */}
        <button
          className="nav-btn"
          onClick={onOpenSocialModal}
          style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Link2 size={15} /> Social Sync
        </button>

        <button
          className="nav-btn"
          onClick={onOpenYouTubeModal}
          style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <YoutubeIcon size={15} color="#dc2626" /> YouTube
        </button>

        {/* User Profile Badge */}
        <div className="user-profile" title={`Logged in as ${user?.email || 'User'}`}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px'
          }}>
            {initial}
          </div>
          <span className="user-name desktop-only" style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{userName}</span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4px'
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
