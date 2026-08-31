import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/content", label: "Content Analytics" },
  { path: "/audience", label: "Audience Analytics" },
  { path: "/growth", label: "Growth & Trends" },
  { path: "/revenue", label: "Revenue" },
  { path: "/sponsorships", label: "Sponsorships" },
  { path: "/notifications", label: "Notifications" },
  { path: "/reports", label: "Reports" },
  { path: "/profile", label: "Profile" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get("/notifications?unread_only=true")
      .then((res) => setUnreadCount(res.data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="flex flex-col w-64 text-white bg-gray-900">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          CreatorIQ
        </div>
        <nav className="flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-3 hover:bg-gray-800 ${
                  isActive ? "bg-gray-800 border-l-4 border-blue-500" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-lg font-semibold">Welcome, {user?.full_name}</h1>

          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link to="/profile" className="flex items-center justify-center text-sm font-semibold text-white bg-blue-600 rounded-full w-9 h-9 hover:bg-blue-700">
              {user?.full_name?.charAt(0) || "U"}
            </Link>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}