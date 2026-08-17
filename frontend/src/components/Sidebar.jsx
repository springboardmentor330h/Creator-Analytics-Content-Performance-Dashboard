import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  TrendingUp, 
  User, 
  Settings, 
  HelpCircle,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audience', label: 'Audience Analytics', icon: Users },
    { id: 'content', label: 'Content Performance', icon: Video },
    { id: 'growth', label: 'Growth Trends', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Account', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-icon">IQ</div>
          <span className="brand-name">CreatorIQ</span>
        </div>

        <ul className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout button at bottom of sidebar */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ color: '#be123c' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
