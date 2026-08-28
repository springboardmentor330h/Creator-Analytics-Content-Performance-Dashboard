import React from 'react';
import { Search, Link2, LogOut, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { YoutubeIcon } from './PlatformIcons';

export default function Header({
  title,
  subtitle,
  user,
  selectedPlatform = 'All',
  onPlatformChange,
  onLogout,
  onOpenYouTubeModal,
  onOpenInstagramModal,
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
        {/* Global Platform Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Platform:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange && onPlatformChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">🌐 All Platforms</option>
            <option value="YouTube">📺 YouTube</option>
            <option value="Instagram">📸 Instagram</option>
            <option value="TikTok">🎵 TikTok</option>
            <option value="LinkedIn">💼 LinkedIn</option>
            <option value="X">🐦 X (Twitter)</option>
          </select>
        </div>

        {/* Notification Bell Dropdown Widget */}
        <NotificationBell onOpenFullNotifications={onOpenNotificationsTab} />

        {/* Action Buttons */}
        <button
          className="nav-btn"
          onClick={onOpenInstagramModal}
          style={{ backgroundColor: '#fce7f3', color: '#e1306c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Sync Instagram Media"
        >
          <InstagramIcon size={15} color="#e1306c" /> Instagram
        </button>

        <button
          className="nav-btn"
          onClick={onOpenYouTubeModal}
          style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Sync YouTube Channel"
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
