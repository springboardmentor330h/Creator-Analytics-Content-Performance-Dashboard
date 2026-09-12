import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useCreator } from "../context/CreatorContext";

export default function Navbar() {
  const { role, userName, clearRole } = useRole();
  const { creatorId, setCreatorId, managedCreators } = useCreator();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearRole();
    navigate("/");
  };

  return (
    <header className="flex flex-col gap-2 border-b bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span className="text-sm font-medium sm:text-base">
        {userName} <span className="capitalize text-gray-400">({role?.replace("_", " ")})</span>
      </span>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {role === "creator" ? (
          <span className="w-full rounded border bg-gray-50 px-2 py-1 text-sm text-gray-500 sm:w-auto">
            Creator #{creatorId ?? "—"}
          </span>
        ) : (
          <select
            value={creatorId ?? ""}
            onChange={(e) => setCreatorId(Number(e.target.value))}
            className="w-full rounded border px-2 py-1 text-sm sm:w-auto"
          >
            {managedCreators.length === 0 && <option value="">No creators available</option>}
            {managedCreators.map((c) => (
              <option key={c.creator_id} value={c.creator_id}>Creator #{c.creator_id}</option>
            ))}
          </select>
        )}
        <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
      </div>
    </header>
  );
}