import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function Header({ title, subtitle, user, onLogout }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Creator';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="top-header">
      <div className="header-title-box">
        <h1>{title || 'Dashboard'}</h1>
        <p>{subtitle || 'Live realtime analytics platform'}</p>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search analytics..." />
        </div>

        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile" title={`Logged in as ${user?.email || 'User'}`}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            color: 'white',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            {initial}
          </div>
          <span className="user-name">{userName}</span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
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
