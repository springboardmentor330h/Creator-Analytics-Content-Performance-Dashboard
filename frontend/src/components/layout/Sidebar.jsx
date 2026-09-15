import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Content Analytics", path: "/content" },
  { name: "Audience Analytics", path: "/audience" },
  { name: "Growth & Trends", path: "/growth" },
  { name: "Revenue", path: "/revenue" },
  { name: "Sponsorships", path: "/sponsorships" },
  { name: "Notifications", path: "/notifications" },
  { name: "Reports", path: "/reports" },
  { name: "Profile", path: "/profile" },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5 border-r border-white/10 shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 font-black text-white shadow-md shadow-sky-500/20">
          C
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          CreatorIQ
        </h1>
      </div>

      <nav className="space-y-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
