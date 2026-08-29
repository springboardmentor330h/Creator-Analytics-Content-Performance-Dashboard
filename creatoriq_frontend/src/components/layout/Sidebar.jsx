import { NavLink } from "react-router";

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
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        CreatorIQ
      </h1>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600"
                  : "text-slate-300 hover:bg-slate-800"
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