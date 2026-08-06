import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";

export default function Navbar() {
  const { role, userName, clearRole } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearRole();
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
      <span className="font-medium">
        {userName} <span className="capitalize text-gray-400">({role?.replace("_", " ")})</span>
      </span>
      <button onClick={handleLogout} className="text-sm text-red-500">
        Logout
      </button>
    </header>
  );
}