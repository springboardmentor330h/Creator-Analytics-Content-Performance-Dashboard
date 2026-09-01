import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Users,
  TrendingUp,
  DollarSign,
  Handshake,
  Bell,
  FileText,
  User,
  Sparkles,
  Code2,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Content Analytics", path: "/content", icon: Video },
    { name: "Audience Analytics", path: "/audience", icon: Users },
    { name: "Growth & Trends", path: "/growth", icon: TrendingUp },
    { name: "Revenue", path: "/revenue", icon: DollarSign },
    { name: "Sponsorships", path: "/sponsorships", icon: Handshake },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Profile / Settings", path: "/profile", icon: User },
    { name: "API Docs (Swagger)", path: "/api-docs", icon: Code2 },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">CreatorIQ</h1>
          <span className="text-xs text-indigo-400 font-medium">Analytics Suite</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Creator Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            MC
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">Monika Chowdary</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Pro Creator
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
