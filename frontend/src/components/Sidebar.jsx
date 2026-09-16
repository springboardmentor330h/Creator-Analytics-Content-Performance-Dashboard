import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileBarChart,
  Users,
  TrendingUp,
  DollarSign,
  Handshake,
  Bell,
  FileText,
  Share2,
  UserRound,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/content", label: "Content Analytics", icon: FileBarChart },
  { to: "/audience", label: "Audience Analytics", icon: Users },
  { to: "/growth", label: "Growth & Trends", icon: TrendingUp },
  { to: "/revenue", label: "Revenue", icon: DollarSign },
  { to: "/sponsorships", label: "Sponsorships", icon: Handshake },
  { to: "/social", label: "Social Media", icon: Share2 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileText },
  {
  to: "/profile",
  label: "Profile & Settings",
  icon: UserRound,
},
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-brand-900 text-white
        transform transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <span className="text-xl font-semibold tracking-tight">CreatorIQ</span>
          <button className="md:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
                      : "text-amber-200 hover:bg-amber-500/10 hover:text-amber-100"
                  }`
                }
              >
                <ShieldCheck size={18} className="transition-transform duration-200 group-hover:scale-110" />
                Admin Control Center
              </NavLink>
              <div className="my-2 h-px bg-white/10" />
            </>
          )}

          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
