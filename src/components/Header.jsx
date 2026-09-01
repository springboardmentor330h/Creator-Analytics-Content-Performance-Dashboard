import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, CheckCircle, Code2 } from "lucide-react";
import { getNotifications } from "../services/api";

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
    localStorage.removeItem("access_token");
    navigate("/dashboard");
  };

  return (
    <header className="h-16 flex items-center justify-between border-b border-slate-200 bg-white px-8 -mx-8 mb-8 sticky top-0 z-10 shadow-xs">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">CreatorIQ Studio</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Unified Cross-Platform Analytics & Revenue Control</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>All Platforms Live</span>
        </div>

        {/* Swagger Docs Link */}
        <Link
          to="/api-docs"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Swagger API</span>
        </Link>

        {/* Notifications Icon Button */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </Link>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Monika C.</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          title="Reset session"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
