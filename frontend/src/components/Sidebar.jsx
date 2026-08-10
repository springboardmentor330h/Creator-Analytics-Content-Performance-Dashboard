import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Content Analytics", path: "/content-analytics" },
    { label: "Audience", path: "/audience-analytics" },
    { label: "Growth & Trends", path: "/growth-trends" },
    { label: "Revenue", path: "/dashboard" },
    { label: "Reports", path: "/dashboard" },
  ];

  return (
    <aside className="w-56 bg-indigo-700 text-white p-4">
      <h2 className="mb-6 text-lg font-bold">CreatorIQ</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block cursor-pointer rounded px-3 py-2 hover:bg-indigo-600 ${isActive ? "bg-indigo-600" : ""}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}