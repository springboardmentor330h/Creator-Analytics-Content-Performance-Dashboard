import { NavLink } from "react-router-dom";

function Sidebar() {
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
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      
      {/* Logo */}
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-2xl font-bold">
          CreatorIQ
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Creator Analytics
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
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

      {/* Bottom */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-xs text-slate-400">
          CreatorIQ Dashboard
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;