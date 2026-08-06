import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useRole } from "../context/RoleContext";

const ROLE_LABELS = {
  creator: "Creator",
  agency: "Agency",
  marketing_team: "Marketing Team",
  admin: "Administrator",
};

export default function RoleSelect() {
  const [roles, setRoles] = useState([]);
  const { selectRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/roles/").then((res) => setRoles(res.data));
  }, []);

  const handleSelect = (role) => {
    selectRole(role);
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="mb-8 text-2xl font-semibold text-gray-800">
        Who's logging in?
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleSelect(role)}
            className="w-48 rounded-xl bg-white p-6 text-center shadow transition hover:shadow-md hover:bg-indigo-50"
          >
            <p className="text-lg font-medium text-gray-800">
              {ROLE_LABELS[role] || role}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}