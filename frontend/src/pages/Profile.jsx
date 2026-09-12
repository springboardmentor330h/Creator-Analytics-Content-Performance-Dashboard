import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useRole } from "../context/RoleContext";

export default function Profile() {
  const { userId, role } = useRole();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [managers, setManagers] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/auth/users/${userId}`);
      setProfile(res.data);
      setForm({ full_name: res.data.full_name, email: res.data.email, password: "" });
    } catch {
      setError("Could not load profile");
    }

    if (role === "creator") {
      const [mgrRes, contractRes] = await Promise.all([
        api.get("/contracts/managers"),
        api.get("/contracts/mine"),
      ]);
      setManagers(mgrRes.data);
      setMyContracts(contractRes.data);
    } else if (role === "agency" || role === "marketing_team") {
      const contractRes = await api.get("/contracts/mine");
      setMyContracts(contractRes.data);
    }
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  const handleAddManager = async (managerId) => {
    try {
      await api.post("/contracts", { manager_user_id: managerId });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add manager");
    }
  };

  const handleRemoveManager = async (contractId) => {
    try {
      await api.delete(`/contracts/${contractId}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to remove manager");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const payload = { full_name: form.full_name, email: form.email };
      if (form.password) payload.password = form.password;
      await api.put(`/auth/users/${userId}`, payload);
      setMessage("Profile updated successfully");
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile");
    }
  };

  const linkedManagerIds = myContracts.map((c) => c.manager_id);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Profile & Settings</h1>
          {message && <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <form onSubmit={handleSubmit} className="mb-6 max-w-md space-y-3 rounded-xl bg-white p-4 shadow">
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Full Name"
              required
              minLength={3}
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Email"
              required
            />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="New password (leave blank to keep current)"
              minLength={8}
            />
            <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white">Save Changes</button>
          </form>

          {role === "creator" && (
            <>
              <div className="mb-6 rounded-xl bg-white p-4 shadow">
                <p className="mb-3 font-medium">Your Agencies / Marketing Teams</p>
                {myContracts.length === 0 && <p className="text-sm text-gray-500">Not linked to any manager yet.</p>}
                {myContracts.map((c) => (
                  <div key={c.contract_id} className="flex items-center justify-between border-b py-2 text-sm">
                    <span>{c.manager_name} <span className="capitalize text-gray-400">({c.manager_role?.replace("_", " ")})</span></span>
                    <button onClick={() => handleRemoveManager(c.contract_id)} className="text-xs text-red-500">Remove</button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white p-4 shadow">
                <p className="mb-3 font-medium">All Agencies & Marketing Teams on the Platform</p>
                {managers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border-b py-2 text-sm">
                    <span>{m.full_name} <span className="capitalize text-gray-400">({m.role.replace("_", " ")})</span></span>
                    <button
                      onClick={() => handleAddManager(m.id)}
                      disabled={linkedManagerIds.includes(m.id)}
                      className="text-xs text-indigo-600 disabled:text-gray-300"
                    >
                      {linkedManagerIds.includes(m.id) ? "Linked" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {(role === "agency" || role === "marketing_team") && (
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="mb-3 font-medium">Creators You Manage</p>
              {myContracts.length === 0 && <p className="text-sm text-gray-500">No creators linked yet.</p>}
              {myContracts.map((c) => (
                <p key={c.contract_id} className="border-b py-2 text-sm">Creator #{c.creator_id}</p>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}