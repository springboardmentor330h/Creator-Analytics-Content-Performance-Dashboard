import { useEffect, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  password: "",
  role: "creator",
};

const ROLES = [
  "creator",
  "agency",
  "marketing team",
  "administrator",
];

function formatRole(role) {
  return (role || "Unknown")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatUserId(id) {
  const numericId = String(id).replace(/\D/g, "");
  return `#${numericId.padStart(3, "0")}`;
}

function sortUsersById(usersList) {
  return [...usersList].sort((firstUser, secondUser) => {
    const firstId = Number.parseInt(String(firstUser.id).replace(/\D/g, ""), 10);
    const secondId = Number.parseInt(String(secondUser.id).replace(/\D/g, ""), 10);

    return firstId - secondId;
  });
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      const usersData = response.data;
      const usersList = Array.isArray(usersData)
        ? usersData
        : usersData.data || [];

      setUsers(sortUsersById(usersList));
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(user) {
    setEditingId(user.id);

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "creator",
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        const payload = {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api.put(
          `/users/${editingId}`,
          payload
        );

        setSuccess("User updated successfully.");
      } else {
        await api.post("/users", {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: form.role,
        });

        setSuccess("User created successfully.");
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      console.error("User save error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Delete user "${user.full_name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/users/${user.id}`);

      setSuccess("User deleted successfully.");

      if (editingId === user.id) {
        resetForm();
      }

      await loadUsers();
    } catch (err) {
      console.error("User delete error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete user."
      );
    }
  }

  return (
    <div className="dashboard-shell px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="dashboard-hero">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-indigo-100/90">
            Manage CreatorIQ users, roles, accounts, and access.
          </p>
        </div>

        {error && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">

          <div className="dashboard-panel">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingId ? "Edit User" : "Create User"}
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {editingId
                  ? "Update the selected user account."
                  : "Create a new CreatorIQ account."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Full Name
                </label>

                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingId}
                  minLength={6}
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                  className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-slate-950 text-white">
                      {formatRole(role)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update User"
                      : "Create User"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="content-table-card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Users
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {users.length} registered accounts
                </p>
              </div>

              <button
                type="button"
                onClick={loadUsers}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-300">
                Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="dashboard-table w-full min-w-[760px] text-left">
                  <thead>
                    <tr>
                      <th className="w-24">ID</th>
                      <th className="min-w-40">Name</th>
                      <th className="min-w-56">Email</th>
                      <th className="w-44">Role</th>
                      <th className="w-44">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="font-mono text-sm font-semibold text-slate-300">
                          {formatUserId(user.id)}
                        </td>

                        <td className="font-semibold text-slate-800">
                          {user.full_name}
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span className="inline-flex min-w-32 justify-center rounded-full border border-indigo-300/30 bg-indigo-400/15 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                            {formatRole(user.role)}
                          </span>
                        </td>

                        <td>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(user)}
                              className="rounded-lg bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-200"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminUsers;