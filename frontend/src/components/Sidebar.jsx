import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  TrendingUp, 
  DollarSign,
  Bell,
  FileText,
  Settings,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isMobileOpen, onCloseMobile }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content Analytics', icon: Video },
    { id: 'audience', label: 'Audience Analytics', icon: Users },
    { id: 'growth', label: 'Growth & Trends', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue & Sponsorships', icon: DollarSign },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99
          }}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div>
          <div className="brand" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="brand-icon">IQ</div>
              <span className="brand-name">CreatorIQ</span>
            </div>

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sign Out button at bottom of sidebar */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
          <button
            className="nav-item"
            onClick={onLogout}
            style={{ color: '#f43f5e', width: '100%' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
