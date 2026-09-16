import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Layers,
  BarChart3,
  Activity,
  ShieldCheck,
  ArrowLeftCircle,
  X,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/creators", label: "Top Creators", icon: Trophy },
  { to: "/admin/content", label: "Top Content by Platform", icon: Layers },
  { to: "/admin/comparison", label: "Cross-Platform Comparison", icon: BarChart3 },
  { to: "/admin/activity", label: "Recent Activity", icon: Activity },
];

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-slate-950 text-white
        transform transition-transform duration-200 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 text-slate-900">
              <ShieldCheck size={16} />
            </div>
            <span className="text-lg font-semibold tracking-tight">Admin Panel</span>
          </div>
          <button className="md:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-3">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftCircle size={18} />
            Back to Creator View
          </button>
        </div>
      </aside>
    </>
  );
}
