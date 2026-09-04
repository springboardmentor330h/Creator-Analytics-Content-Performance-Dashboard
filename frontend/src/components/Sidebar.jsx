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
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

function Sidebar() {
  const primaryMenu = [
    { name: "Overview Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Content Performance", path: "/content", icon: Video },
    { name: "Audience & Reach", path: "/audience", icon: Users },
    { name: "Growth Velocity", path: "/growth", icon: TrendingUp },
  ];

  const monetizationMenu = [
    { name: "Revenue Analytics", path: "/revenue", icon: DollarSign },
    { name: "Brand Sponsorships", path: "/sponsorships", icon: Handshake },
    { name: "Reports & Exports", path: "/reports", icon: FileText },
  ];

  const systemMenu = [
    { name: "Alerts & Feeds", path: "/notifications", icon: Bell },
    { name: "Creator Profile", path: "/profile", icon: User },
    { name: "API Documentation", path: "/api-docs", icon: Code2, isApi: true },
  ];

  return (
    <aside className="w-68 min-h-screen bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800/80 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-white tracking-tight">CreatorIQ</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Platform Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {/* Analytics Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Analytics & Channels
          </div>
          {primaryMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </div>

        {/* Monetization Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Monetization & Deals
          </div>
          {monetizationMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </div>

        {/* System & API Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System & Control
          </div>
          {systemMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.isApi && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    OAS 3.1
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer User Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              MC
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">Monika Chowdary</div>
              <div className="text-[11px] text-slate-400 truncate">monika@example.com</div>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Creator" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
