import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Overview", path: "/" },
  { name: "Content Analytics", path: "/content" },
  { name: "Audience Analytics", path: "/audience" },
  { name: "Growth & Trends", path: "/growth" },
  { name: "Revenue", path: "/revenue" },
  { name: "Sponsorships", path: "/sponsorships" },
  { name: "Notifications", path: "/notifications" },
  { name: "Reports", path: "/reports" },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#111111] text-white">

      {/* Logo Section */}
      <div className="flex h-[150px] shrink-0 flex-col items-center justify-center border-b border-white/10 px-4">

        <h1 className="whitespace-nowrap text-[38px] font-bold leading-none tracking-tight">
          Creator<span className="text-purple-500">IQ</span>
        </h1>

        <p className="mt-4 text-xs text-gray-500">
          Creator Analytics
        </p>

      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

        </div>
      </nav>

      {/* Profile */}
      <div className="shrink-0 border-t border-white/10 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
            C
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Creator
            </p>

            <p className="truncate text-xs text-gray-500">
              View Profile
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;