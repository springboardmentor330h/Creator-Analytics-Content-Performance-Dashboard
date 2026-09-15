import { useEffect, useState } from "react";
import api from "../api";

function Header({ currentPage = "Dashboard" }) {
  const [userName, setUserName] = useState("Creator");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data && res.data.full_name) {
          setUserName(res.data.full_name);
        }
      } catch (err) {
        console.warn("Header user fetch:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-xl font-semibold text-gray-800">{currentPage}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{userName}</p>
          <p className="text-xs text-gray-500">CreatorIQ Account</p>
        </div>

        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Header;

