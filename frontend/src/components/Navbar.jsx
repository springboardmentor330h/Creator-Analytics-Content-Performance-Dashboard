import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useCreator } from "../context/CreatorContext";

export default function Navbar() {
  const { role, userName, clearRole } = useRole();
  const { creatorId, updateCreatorId } = useCreator();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearRole();
    navigate("/");
  };

  return (
    <header className="flex flex-col gap-2 border-b bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span className="font-medium text-sm sm:text-base">
        {userName} <span className="capitalize text-gray-400">({role?.replace("_", " ")})</span>
      </span>
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 sm:text-sm">Creator ID:</label>
        <input
          type="number"
          value={creatorId}
          onChange={(e) => updateCreatorId(e.target.value || 1)}
          className="w-16 rounded border px-2 py-1 text-sm"
        />
        <button onClick={handleLogout} className="text-sm text-red-500">
          Logout
        </button>
      </div>
    </header>
  );
}