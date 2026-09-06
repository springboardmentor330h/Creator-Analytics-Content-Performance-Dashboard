import { useAuth } from "../../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 shadow-[0_14px_34px_rgba(15,23,42,0.18)] backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-500/20">
          C
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300">
            CreatorIQ
          </p>

          <h2 className="text-base font-bold tracking-tight text-white sm:text-xl">
          Creator Analytics Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right shadow-inner shadow-white/5 sm:block">
          <p className="text-sm font-bold text-white">
            {displayName}
          </p>

          <p className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Active creator
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-extrabold text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-50">
          {initial}
        </div>

        <button type="button" onClick={logout} className="ml-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-red-300/40 hover:bg-red-500/15 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-sky-300/50">
          <span className="hidden sm:inline">Sign out</span>
          <span className="text-base sm:hidden" aria-hidden="true">↪</span>
          <span className="sr-only sm:hidden">Sign out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;