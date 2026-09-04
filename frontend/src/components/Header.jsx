import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, CheckCircle2, Code2, Sparkles } from "lucide-react";
import { getNotifications, logoutUser } from "../services/api";

function Header() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getNotifications();
        const list = Array.isArray(res) ? res : res?.data || [];
        const unread = list.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Header notification fetch error:", err);
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-8 -mx-8 mb-8 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
              CreatorIQ Studio
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                v1.0 Live
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
              Cross-Platform Analytics & Revenue Control
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-200/70 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>6 Channels Connected</span>
        </div>

        {/* Swagger API Button */}
        <Link
          to="/api-docs"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Swagger API</span>
        </Link>

        {/* Notifications Button */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
          title="Alerts & Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100/80 transition-colors border border-slate-200/60"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            MC
          </div>
          <span className="text-xs font-bold text-slate-800 hidden md:inline">Monika C.</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50/80 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
