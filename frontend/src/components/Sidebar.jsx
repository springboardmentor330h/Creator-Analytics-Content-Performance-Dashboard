import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Content Analytics", path: "/content-analytics" },
    { label: "Audience", path: "/audience-analytics" },
    { label: "Growth & Trends", path: "/growth-trends" },
    { label: "Platform Comparison", path: "/platform-comparison" },
    { label: "Social Media", path: "/social-media" },
    { label: "Revenue", path: "/revenue" },
    { label: "Notifications", path: "/notifications" },
    { label: "Reports", path: "/reports" },
  ];

  return (
    <>
      <div className="flex items-center justify-between bg-indigo-700 px-4 py-3 text-white md:hidden">
        <h2 className="text-lg font-bold">CreatorIQ</h2>
        <button onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} absolute z-20 w-full bg-indigo-700 text-white md:relative md:block md:w-56`}
      >
        <h2 className="mb-6 hidden text-lg font-bold p-4 md:block">CreatorIQ</h2>
        <ul className="space-y-1 p-4 md:p-4 md:pt-0">
          {items.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block cursor-pointer rounded px-3 py-2 text-sm hover:bg-indigo-600 ${isActive ? "bg-indigo-600" : ""}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}