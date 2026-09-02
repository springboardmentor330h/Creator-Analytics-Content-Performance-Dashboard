import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import {
  LayoutDashboard, BarChart3, Users, TrendingUp, DollarSign,
  Handshake, Bell, FileText, UserCircle, LogOut, Sparkles, GitCompare, Sun, Moon
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/content", label: "Content Analytics", icon: BarChart3 },
  { path: "/audience", label: "Audience Analytics", icon: Users },
  { path: "/growth", label: "Growth & Trends", icon: TrendingUp },
  { path: "/revenue", label: "Revenue", icon: DollarSign },
  { path: "/sponsorships", label: "Sponsorships", icon: Handshake },
  { path: "/platform-comparison", label: "Platform Comparison", icon: GitCompare },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications?unread_only=true").then((res) => setUnreadCount(res.data.length)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen transition-colors bg-gray-50 dark:bg-gray-900">
      <aside className="flex flex-col w-64 bg-white border-r border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">CreatorIQ</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200"
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-xl py-2.5 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 transition rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
              {theme === "light" ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
            <Link to="/notifications" className="relative p-2 transition rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex items-center justify-center text-sm font-semibold text-white transition rounded-full w-9 h-9 bg-brand-600 hover:bg-brand-700">
              {user?.full_name?.charAt(0) || "U"}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}