import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/content": "Content Analytics",
  "/audience": "Audience Analytics",
  "/growth": "Growth & Trends",
  "/revenue": "Revenue Analytics",
  "/platforms": "Platform Comparison",
  "/sponsorships": "Sponsorships",
  "/notifications": "Notifications",
  "/reports": "Reports",
  "/profile": "Profile & Settings",
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "CreatorIQ";

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User size={15} className="text-gray-400" />
            <span>{user.full_name || user.email}</span>
          </div>
        )}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
          {user?.role || "creator"}
        </span>
      </div>
    </header>
  );
}