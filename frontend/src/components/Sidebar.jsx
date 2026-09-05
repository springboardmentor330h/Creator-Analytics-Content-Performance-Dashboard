import { Link, useLocation } from "react-router-dom";

const items = [
  { label: "Overview", path: "/dashboard" },
  { label: "Content Analytics", path: "/content-analytics" },
  { label: "Audience", path: "/audience-analytics" },
  { label: "Growth & Trends", path: "/growth-trends" },
  { label: "Revenue", path: "/revenue" },
  { label: "Sponsorships", path: "/sponsorships" },
  { label: "Notifications", path: "/notifications" },
  { label: "Reports", path: "/reports" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 bg-indigo-700 text-white p-4">
      <h2 className="mb-6 text-lg font-bold">CreatorIQ</h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block cursor-pointer rounded px-3 py-2 hover:bg-indigo-600 ${
                  isActive ? "bg-indigo-800 font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}