import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Creator Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          title="Notifications"
        >
          🔔
        </button>

        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-100"
          title="Profile"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            A
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-800">
              Creator
            </p>

            <p className="text-xs text-slate-500">
              Account
            </p>
          </div>
        </button>

      </div>
    </header>
  );
}

export default Header;