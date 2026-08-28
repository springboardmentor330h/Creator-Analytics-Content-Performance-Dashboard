import React from 'react';
import { LayoutDashboard, Video, DollarSign, Bell, FileText } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'content', label: 'Content', icon: Video },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
