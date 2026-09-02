import { useAuth } from "../../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Creator Analytics Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-slate-800">
            {displayName}
          </p>

          <p className="text-sm text-slate-500">
            Creator
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {initial}
        </div>

        <button type="button" onClick={logout} className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Header;