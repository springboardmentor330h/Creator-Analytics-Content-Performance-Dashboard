import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Bell, 
  FileText, 
  User 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Content Analytics', href: '/content', icon: BarChart2 },
  { name: 'Audience Analytics', href: '/audience', icon: Users },
  { name: 'Growth & Trends', href: '/growth', icon: TrendingUp },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
  { name: 'Sponsorships', href: '/sponsorships', icon: Briefcase },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Reports & Export', href: '/reports', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 text-2xl font-extrabold tracking-wider text-sky-400 border-b border-slate-800">
          CreatorIQ
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Creator Analytics Workspace</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-sm font-semibold text-gray-900">Creator #8</span>
              <span className="block text-xs text-gray-500">Active Workspace</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
              C8
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}