import { useEffect, useMemo, useState } from "react";
import { Search, UserCheck, UserX, Trash2, ShieldCheck, Sparkles } from "lucide-react";

import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { LoadingState, ErrorState } from "../../components/StatusMessage";
import {
  ALL_ROLES,
  ConfirmDialog,
  ToastBanner,
  useAdminToast,
} from "../../components/admin/AdminUiKit";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [toast, showToast] = useAdminToast();

  const loadUsers = async (role) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users/search", {
        params: { limit: 200, ...(role ? { role } : {}) },
      });
      setUsers(res.data?.users ?? []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't load users. Make sure you're signed in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRoleChange = async (targetUser, newRole) => {
    if (newRole === targetUser.role) return;
    setBusyUserId(targetUser.id);
    try {
      await api.put(`/users/${targetUser.id}`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      showToast(
        "success",
        newRole === "Administrator"
          ? `${targetUser.full_name} is now an Administrator.`
          : `${targetUser.full_name}'s role changed to ${newRole}.`
      );
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Couldn't update role.");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleActive = async (targetUser) => {
    setBusyUserId(targetUser.id);
    try {
      const nextActive = !targetUser.is_active;
      await api.put(`/users/${targetUser.id}`, { is_active: nextActive });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: nextActive } : u)));
      showToast("success", `${targetUser.full_name} was ${nextActive ? "reactivated" : "suspended"}.`);
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Couldn't update account status.");
    } finally {
      setBusyUserId(null);
    }
  };

  const requestDelete = (targetUser) => {
    setConfirmState({
      title: "Remove this user?",
      message: `${targetUser.full_name} (${targetUser.email}) will lose access immediately. This can't be undone from here.`,
      confirmLabel: "Remove user",
      danger: true,
      onConfirm: async () => {
        setConfirmState(null);
        setBusyUserId(targetUser.id);
        try {
          await api.delete(`/users/${targetUser.id}`);
          setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
          showToast("success", `${targetUser.full_name} was removed.`);
        } catch (err) {
          showToast("error", err.response?.data?.detail || "Couldn't remove user.");
        } finally {
          setBusyUserId(null);
        }
      },
    });
  };

  if (loading) return <LoadingState label="Loading users..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 pb-8">
      <ToastBanner toast={toast} />
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger}
        onConfirm={confirmState?.onConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 text-white shadow-lg shadow-amber-500/30">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users & Roles</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Sparkles size={12} /> Administrator
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Decide who can access the platform, and who gets Administrator rights.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} shown
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">All roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left font-medium text-slate-500 px-5 py-3">User</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Role</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Status</th>
                <th className="text-right font-medium text-slate-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isBusy = busyUserId === u.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">
                        {u.full_name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || isBusy}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={isSelf || isBusy}
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? "Suspend user" : "Reactivate user"}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          disabled={isSelf || isBusy}
                          onClick={() => requestDelete(u)}
                          title="Remove user"
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">No users match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
