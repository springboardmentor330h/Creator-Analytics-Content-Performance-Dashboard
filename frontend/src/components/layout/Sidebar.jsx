import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Content Analytics", path: "/content" },
    { name: "Audience Analytics", path: "/audience" },
    { name: "Growth & Trends", path: "/growth" },
    { name: "Revenue", path: "/revenue" },
    { name: "Sponsorships", path: "/sponsorships" },
    { name: "Notifications", path: "/notifications" },
    { name: "Reports", path: "/reports" },
    { name: "Profile / Settings", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-xl text-white shadow-lg lg:hidden"
        aria-label="Toggle navigation"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="border-b border-slate-700 px-6 py-5">
          <h1 className="text-2xl font-bold">CreatorIQ</h1>
          <p className="mt-1 text-xs text-slate-400">
            Creator Analytics
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="text-xs text-slate-400">
            CreatorIQ Dashboard
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;