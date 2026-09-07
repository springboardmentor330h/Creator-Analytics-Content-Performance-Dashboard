import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
      <button className="md:hidden text-slate-600" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-800">{user?.full_name}</p>
          <p className="text-xs text-slate-400">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
